require("dotenv").config();
const prisma = require("./prisma");

async function seedZones() {
  const zones = [
    {
      name: "PC Zone",
      pricePerHour: 150,
      description: "High-refresh gaming PCs",
    },
    { name: "Console Zone", pricePerHour: 120, description: "PS5 / Xbox area" },
    {
      name: "Snooker Table",
      pricePerHour: 200,
      description: "Full-size snooker table",
    },
    { name: "Pool Table", pricePerHour: 160, description: "Casual pool games" },
  ];

  let created = 0;
  for (const z of zones) {
    const existing = await prisma.zone.findFirst({ where: { name: z.name } });
    if (!existing) {
      await prisma.zone.create({ data: z });
      created += 1;
    }
  }

  const total = await prisma.zone.count();
  console.log(
    `Zones seeding complete. Created: ${created}. Total zones: ${total}`
  );
}

seedZones()
  .catch((e) => {
    console.error("Seed zones error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
