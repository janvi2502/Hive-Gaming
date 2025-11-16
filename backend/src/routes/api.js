const express = require("express");
const prisma = require("../prisma");
const { buildDateFromYMD, generateSlots, slotsOverlap } = require("../utils/time");
const { notificationQueue } = require("../jobs/queue");

const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function requireAdmin(req, res, next) {
  try {
    const token = req.cookies.admin_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
// GET /api/zones
router.get("/zones", async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { id: "asc" } });
    res.json(zones);
  } catch (e) {
    next(e);
  }
});

// GET /api/availability?zoneId=1&date=2025-11-15
router.get("/availability", async (req, res) => {
  try {
    const { zoneId, date } = req.query;

    if (!zoneId || !date) {
      return res.status(400).json({ message: "zoneId and date are required" });
    }

    console.log("Availability request:", { zoneId, date });

    // --- date window: today .. today+7 (string-based to avoid timezone hell) ---
    const now = new Date();

    const todayStr = new Date().toISOString().split("T")[0]; // e.g. "2025-11-15"
    const maxDateStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // reject past days or too-future days
    if (date < todayStr || date > maxDateStr) {
      console.log("Date out of window, returning empty slots");
      return res.json({ slots: [] });
    }

    // --- generate base slots for the day (example hours: 10:00–22:00) ---
    const OPEN_HOUR = 10; // 10:00
    const CLOSE_HOUR = 22; // 22:00

    const allSlots = [];
    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
      const start = `${String(hour).padStart(2, "0")}:00`;
      const end = `${String(hour + 1).toString().padStart(2, "0")}:00`;
      allSlots.push({
        startTime: start,
        endTime: end,
        status: "available",
      });
    }

    let filteredSlots = allSlots;

    // --- if it's today, drop slots that start before current time ---
    if (date === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      filteredSlots = allSlots.filter((slot) => {
        const [h, m] = slot.startTime.split(":").map(Number);
        const slotStartMinutes = h * 60 + m;
        return slotStartMinutes > currentMinutes;
      });
    }

    // --- mark already booked slots using Prisma ---
    const dateObj = buildDateFromYMD(date); // IMPORTANT: same as in /bookings

    const existingBookings = await prisma.booking.findMany({
      where: {
        zoneId: Number(zoneId),
        date: dateObj, // match how you store it
      },
      select: { startTime: true },
    });

    const bookedSet = new Set(existingBookings.map((b) => b.startTime));

    const finalSlots = filteredSlots.map((slot) => ({
      ...slot,
      status: bookedSet.has(slot.startTime) ? "booked" : "available",
    }));

    console.log("Returning slots:", finalSlots);

    return res.json({ slots: finalSlots });
  } catch (err) {
    console.error("Availability error:", err);
    return res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// GET /api/bookings-debug?zoneId=1&date=2025-11-17
router.get("/bookings-debug", async (req, res, next) => {
  try {
    const { zoneId, date } = req.query;

    const where = {};
    if (zoneId) where.zoneId = Number(zoneId);
    if (date) where.date = buildDateFromYMD(date);

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        zoneId: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/login
router.post("/admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // httpOnly cookie so JS can't read it (safer than localStorage)
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Logged in" });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/bookings?date=2025-11-17&zoneId=1&status=CONFIRMED
router.get("/admin/bookings", requireAdmin, async (req, res, next) => {
  try {
    const { date, zoneId, status } = req.query;

    const where = {};
    if (date) where.date = buildDateFromYMD(date);
    if (zoneId) where.zoneId = Number(zoneId);
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        user: true,
        zone: true,
      },
    });

    res.json(bookings);
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/logout
router.post("/admin/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ message: "Logged out" });
});

// POST /api/bookings
router.post("/bookings", async (req, res, next) => {
  try {
    const { name, phone, zoneId, date, startTime } = req.body;
    if (!name || !phone || !zoneId || !date || !startTime) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const dateObj = buildDateFromYMD(date);

    // upsert user
    const user = await prisma.user.upsert({
      where: { phone },
      create: { name, phone },
      update: { name },
    });

    const [h] = startTime.split(":");
    const endTime = `${(parseInt(h, 10) + 1).toString().padStart(2, "0")}:00`;

    // conflict check
    const conflict = await prisma.booking.findFirst({
      where: {
        zoneId,
        date: dateObj,
        startTime,
        status: { not: "CANCELLED" },
      },
    });

    if (conflict) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        zoneId,
        date: dateObj,
        startTime,
        endTime,
        status: "CONFIRMED",
      },
      include: { user: true, zone: true },
    });

    // queue notifications (worker will handle later)
    await notificationQueue.add("bookingConfirmation", { bookingId: booking.id });

    res.status(201).json({ message: "Booking confirmed!", booking });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
