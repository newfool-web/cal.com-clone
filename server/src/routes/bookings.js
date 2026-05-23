const express = require("express");
const { prisma, getDefaultUser } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const status = (req.query.status || "upcoming").toLowerCase();
    const now = new Date();

    let where = { userId: user.id };
    if (status === "upcoming") {
      where = { ...where, status: "CONFIRMED", startTime: { gte: now } };
    } else if (status === "past") {
      where = { ...where, status: "CONFIRMED", startTime: { lt: now } };
    } else if (status === "cancelled") {
      where = { ...where, status: "CANCELLED" };
    }

    const list = await prisma.booking.findMany({
      where,
      orderBy: { startTime: status === "past" ? "desc" : "asc" },
      include: { eventType: true },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        eventType: true,
        user: true,
        answers: { include: { question: true } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { eventTypeId, startTime, attendeeName, attendeeEmail, notes, answers } = req.body;
    if (!eventTypeId || !startTime || !attendeeName || !attendeeEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { questions: true },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });

    // Required questions ki validation
    const answerMap = new Map((answers || []).map((a) => [a.questionId, a.value]));
    for (const q of eventType.questions) {
      if (q.required) {
        const v = answerMap.get(q.id);
        if (v === undefined || v === null || String(v).trim() === "") {
          return res.status(400).json({ error: `Question "${q.label}" is required` });
        }
      }
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

    const clash = await prisma.booking.findFirst({
      where: {
        userId: eventType.userId,
        status: "CONFIRMED",
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });
    if (clash) return res.status(409).json({ error: "This slot is no longer available" });

    const booking = await prisma.booking.create({
      data: {
        userId: eventType.userId,
        eventTypeId,
        startTime: start,
        endTime: end,
        attendeeName,
        attendeeEmail,
        notes: notes || null,
        answers: answers
          ? {
              create: answers
                .filter((a) => a.value !== undefined && a.value !== null && String(a.value).trim() !== "")
                .map((a) => ({
                  questionId: a.questionId,
                  value: String(a.value),
                })),
            }
          : undefined,
      },
      include: {
        eventType: true,
        user: true,
        answers: { include: { question: true } },
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { startTime } = req.body;
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { eventType: true },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + existing.eventType.duration * 60 * 1000);

    const clash = await prisma.booking.findFirst({
      where: {
        userId: existing.userId,
        status: "CONFIRMED",
        id: { not: existing.id },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });
    if (clash) return res.status(409).json({ error: "This slot is no longer available" });

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: { startTime: start, endTime: end, status: "CONFIRMED" },
      include: { eventType: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
