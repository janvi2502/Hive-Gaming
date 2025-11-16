require("dotenv").config();
const prisma = require("./prisma");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@hive.local";
    const plainPassword = process.env.ADMIN_PASSWORD || "admin123";

    const hash = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        passwordHash: hash, // update hash if admin already exists
      },
      create: {
        email,
        passwordHash: hash, // REQUIRED field in your model
      },
    });

    console.log("Admin seeded:", admin.email);
    console.log("Use these credentials to log in:");
    console.log("Email:", email);
    console.log("Password:", plainPassword);
  } catch (err) {
    console.error("Seed admin error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
