const prisma = require('../prisma');
const { buildDateFromYMD, generateSlots, slotsOverlap } = require('../utils/time');

async function listZones() {
  return prisma.zone.findMany({ orderBy: { id: 'asc' } });
}

async function getAvailability(zoneId, dateStr) {
  const date = buildDateFromYMD(dateStr);

  const allSlots = generateSlots(10, 22);

  const bookings = await prisma.booking.findMany({
    where: {
      zoneId,
      date,
      status: { not: 'CANCELLED' }
    }
  });

  const slots = allSlots.map(slot => {
    const isTaken = bookings.some(b =>
      slotsOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime)
    );
    return { ...slot, status: isTaken ? 'booked' : 'available' };
  });

  return { date: dateStr, zoneId, slots };
}

async function createBooking({ name, phone, zoneId, dateStr, startTime }) {
  const date = buildDateFromYMD(dateStr);

  // Upsert user by phone
  const user = await prisma.user.upsert({
    where: { phone },
    create: { name, phone },
    update: { name }
  });

  const [hour] = startTime.split(':');
  const endTime = `${(parseInt(hour, 10) + 1).toString().padStart(2, '0')}:00`;

  // Check conflict
  const conflicts = await prisma.booking.findFirst({
    where: {
      zoneId,
      date,
      status: { not: 'CANCELLED' },
      startTime
    }
  });

  if (conflicts) {
    const err = new Error('Slot already booked.');
    err.code = 'CONFLICT';
    throw err;
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      zoneId,
      date,
      startTime,
      endTime,
      status: 'CONFIRMED'
    },
    include: {
      user: true,
      zone: true
    }
  });

  return booking;
}

async function listBookingsForAdmin({ dateStr }) {
  const date = buildDateFromYMD(dateStr);
  return prisma.booking.findMany({
    where: { date },
    include: { user: true, zone: true },
    orderBy: { startTime: 'asc' }
  });
}

module.exports = {
  listZones,
  getAvailability,
  createBooking,
  listBookingsForAdmin
};
