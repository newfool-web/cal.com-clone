const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

function parseHM(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function generateSlotsForDate({ date, timezone: tz, duration, availability, overrides, bookings }) {
  // date is YYYY-MM-DD in user's timezone
  const targetDay = dayjs.tz(`${date} 00:00`, tz);
  const dayOfWeek = targetDay.day();

  const overrideForDate = overrides.find((o) => {
    const oDate = dayjs(o.date).utc().format("YYYY-MM-DD");
    return oDate === date;
  });

  let windows = [];
  if (overrideForDate) {
    if (overrideForDate.blocked) return [];
    if (overrideForDate.startTime && overrideForDate.endTime) {
      windows = [{ start: overrideForDate.startTime, end: overrideForDate.endTime }];
    }
  } else {
    windows = availability
      .filter((a) => a.dayOfWeek === dayOfWeek)
      .map((a) => ({ start: a.startTime, end: a.endTime }));
  }

  if (windows.length === 0) return [];

  const now = dayjs();
  const slots = [];

  for (const w of windows) {
    const startMin = parseHM(w.start);
    const endMin = parseHM(w.end);
    for (let cur = startMin; cur + duration <= endMin; cur += duration) {
      const hh = String(Math.floor(cur / 60)).padStart(2, "0");
      const mm = String(cur % 60).padStart(2, "0");
      const slotStart = dayjs.tz(`${date} ${hh}:${mm}`, tz);
      const slotEnd = slotStart.add(duration, "minute");

      if (slotStart.isBefore(now)) continue;

      const isBooked = bookings.some((b) => {
        const bs = dayjs(b.startTime);
        const be = dayjs(b.endTime);
        return slotStart.isBefore(be) && slotEnd.isAfter(bs);
      });
      if (isBooked) continue;

      slots.push({
        startUtc: slotStart.utc().toISOString(),
        label: slotStart.format("HH:mm"),
      });
    }
  }
  return slots;
}

module.exports = { generateSlotsForDate };
