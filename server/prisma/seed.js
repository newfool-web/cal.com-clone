require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_USER_EMAIL || "achyut@example.com";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Achyut Gupta",
      username: "achyut-gupta-qldpdd",
      timezone: "Asia/Kolkata",
    },
  });

  // Event types seed kar rahe hain
  const eventTypes = [
    { title: "15 min meeting", slug: "15min", duration: 15, description: "Quick sync" },
    { title: "30 min meeting", slug: "30min", duration: 30, description: "Standard meeting" },
    { title: "Secret meeting", slug: "secret", duration: 15, description: "Hidden event", hidden: true },
  ];

  for (const et of eventTypes) {
    await prisma.eventType.upsert({
      where: { userId_slug: { userId: user.id, slug: et.slug } },
      update: {},
      create: { ...et, userId: user.id },
    });
  }

  // Default working hours schedule
  const existing = await prisma.schedule.findFirst({
    where: { userId: user.id, name: "Working hours" },
  });

  if (!existing) {
    const schedule = await prisma.schedule.create({
      data: {
        userId: user.id,
        name: "Working hours",
        timezone: "Asia/Kolkata",
        isDefault: true,
      },
    });

    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          scheduleId: schedule.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
        },
      });
    }
  }

  console.log("Seed complete for user:", user.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
