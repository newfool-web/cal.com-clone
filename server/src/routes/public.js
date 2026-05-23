const express = require("express");
const { prisma } = require("../db");
const { generateSlotsForDate } = require("../slots");

const router = express.Router();

async function getDefaultSchedule(userId) {
  let schedule = await prisma.schedule.findFirst({
    where: { userId, isDefault: true },
    include: { availability: true },
  });
  if (!schedule) {
    schedule = await prisma.schedule.findFirst({
      where: { userId },
      include: { availability: true },
      orderBy: { createdAt: "asc" },
    });
  }
  return schedule;
}

router.get("/:username", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        eventTypes: {
          where: { hidden: false },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { id, email, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

router.get("/:username/:slug", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: user.id, slug: req.params.slug } },
      include: { questions: { orderBy: { position: "asc" } } },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    const schedule = await getDefaultSchedule(user.id);

    res.json({
      eventType,
      user: {
        name: user.name,
        username: user.username,
        timezone: schedule?.timezone || user.timezone,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:username/:slug/slots", async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date required" });

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: user.id, slug: req.params.slug } },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    const schedule = await getDefaultSchedule(user.id);
    const availability = schedule?.availability || [];
    const overrides = await prisma.dateOverride.findMany({ where: { userId: user.id } });

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        startTime: { gte: new Date(dayStart.getTime() - 24 * 60 * 60 * 1000) },
        endTime: { lte: new Date(dayEnd.getTime() + 24 * 60 * 60 * 1000) },
      },
    });

    const slots = generateSlotsForDate({
      date,
      timezone: schedule?.timezone || user.timezone,
      duration: eventType.duration,
      availability,
      overrides,
      bookings,
    });
    res.json({ date, slots });
  } catch (err) {
    next(err);
  }
});

router.get("/:username/:slug/available-dates", async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "month required" });

    const user = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const eventType = await prisma.eventType.findUnique({
      where: { userId_slug: { userId: user.id, slug: req.params.slug } },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    const schedule = await getDefaultSchedule(user.id);
    const availability = schedule?.availability || [];
    const overrides = await prisma.dateOverride.findMany({ where: { userId: user.id } });

    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const overrideMap = {};
    for (const o of overrides) {
      const key = new Date(o.date).toISOString().slice(0, 10);
      overrideMap[key] = o;
    }

    const allowedDays = new Set(availability.map((a) => a.dayOfWeek));
    const dates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(y, m - 1, d));
      const iso = date.toISOString().slice(0, 10);
      const ov = overrideMap[iso];
      if (ov) {
        if (!ov.blocked && ov.startTime && ov.endTime) dates.push(iso);
        continue;
      }
      if (allowedDays.has(date.getUTCDay())) dates.push(iso);
    }

    res.json({ month, dates });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
