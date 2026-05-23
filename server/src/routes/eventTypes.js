const express = require("express");
const { prisma, getDefaultUser } = require("../db");

const router = express.Router();

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

router.get("/", async (_req, res, next) => {
  try {
    const user = await getDefaultUser();
    const items = await prisma.eventType.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.eventType.findUnique({
      where: { id: req.params.id },
      include: { questions: { orderBy: { position: "asc" } } },
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = await getDefaultUser();
    const { title, description, duration, slug } = req.body;
    if (!title || !duration) {
      return res.status(400).json({ error: "title and duration are required" });
    }
    const finalSlug = slug ? slugify(slug) : slugify(title);
    const created = await prisma.eventType.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        duration: parseInt(duration, 10),
        slug: finalSlug,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "An event type with this slug already exists" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, duration, slug, hidden, location, questions } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (duration !== undefined) data.duration = parseInt(duration, 10);
    if (slug !== undefined) data.slug = slugify(slug);
    if (hidden !== undefined) data.hidden = !!hidden;
    if (location !== undefined) data.location = location;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.eventType.update({ where: { id: req.params.id }, data });
      }
      if (Array.isArray(questions)) {
        await tx.question.deleteMany({ where: { eventTypeId: req.params.id } });
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await tx.question.create({
            data: {
              eventTypeId: req.params.id,
              label: q.label,
              type: q.type || "text",
              required: !!q.required,
              options: Array.isArray(q.options) ? q.options : [],
              position: i,
            },
          });
        }
      }
    });

    const updated = await prisma.eventType.findUnique({
      where: { id: req.params.id },
      include: { questions: { orderBy: { position: "asc" } } },
    });
    res.json(updated);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "An event type with this slug already exists" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.eventType.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
