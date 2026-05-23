require("dotenv").config();
const express = require("express");
const cors = require("cors");

const meRoutes = require("./routes/me");
const eventTypeRoutes = require("./routes/eventTypes");
const scheduleRoutes = require("./routes/schedules");
const bookingRoutes = require("./routes/bookings");
const publicRoutes = require("./routes/public");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/me", meRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/u", publicRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
