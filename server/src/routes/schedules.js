const express = require("express");
const { prisma, getDefaultUser } = require("../db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const user = await getDefaultUser();
    const schedules = await prisma.schedule.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: { availability: true },
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const schedule = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: user.id },
      include: { availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    });
    if (!schedule) return res.status(404).json({ error: "Not found" });
    const overrides = await prisma.dateOverride.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });
    res.json({ ...schedule, overrides });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const { name, timezone } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const schedule = await prisma.schedule.create({
      data: {
        userId: user.id,
        name,
        timezone: timezone || user.timezone,
      },
    });

    // Default Mon-Fri 9-5
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: { scheduleId: schedule.id, dayOfWeek: day, startTime: "09:00", endTime: "17:00" },
      });
    }

    const full = await prisma.schedule.findUnique({
      where: { id: schedule.id },
      include: { availability: true },
    });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const { name, timezone, isDefault, slots, overrides } = req.body;

    const existing = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: user.id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    await prisma.$transaction(async (tx) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (timezone !== undefined) data.timezone = timezone;
      if (isDefault === true) {
        await tx.schedule.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
        data.isDefault = true;
      }
      if (Object.keys(data).length) {
        await tx.schedule.update({ where: { id: existing.id }, data });
      }

      if (Array.isArray(slots)) {
        await tx.availability.deleteMany({ where: { scheduleId: existing.id } });
        for (const s of slots) {
          await tx.availability.create({
            data: {
              scheduleId: existing.id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
            },
          });
        }
      }

      if (Array.isArray(overrides)) {
        await tx.dateOverride.deleteMany({ where: { userId: user.id } });
        for (const o of overrides) {
          await tx.dateOverride.create({
            data: {
              userId: user.id,
              date: new Date(o.date),
              startTime: o.startTime || null,
              endTime: o.endTime || null,
              blocked: !!o.blocked,
            },
          });
        }
      }
    });

    const full = await prisma.schedule.findUnique({
      where: { id: existing.id },
      include: { availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    });
    const allOverrides = await prisma.dateOverride.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });
    res.json({ ...full, overrides: allOverrides });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const existing = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: user.id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.isDefault) {
      return res.status(400).json({ error: "Cannot delete the default schedule" });
    }
    await prisma.schedule.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
