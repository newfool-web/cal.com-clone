const express = require("express");
const { getDefaultUser } = require("../db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const user = await getDefaultUser();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
