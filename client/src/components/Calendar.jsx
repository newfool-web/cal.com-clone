import { useMemo } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "./Icons";

const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Calendar({ month, onMonthChange, selected, onSelect, availableDates = [] }) {
  // month is dayjs object
  const startOfMonth = month.startOf("month");
  const startOfGrid = startOfMonth.startOf("week"); // Sunday

  const days = useMemo(() => {
    const arr = [];
    let cur = startOfGrid;
    for (let i = 0; i < 42; i++) {
      arr.push(cur);
      cur = cur.add(1, "day");
    }
    return arr;
  }, [startOfGrid]);

  const today = dayjs().startOf("day");
  const availableSet = new Set(availableDates);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-medium">
          {month.format("MMMM ")}<span className="text-muted">{month.format("YYYY")}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange(month.subtract(1, "month"))}
            className="p-1.5 rounded-md text-muted hover:bg-[#1f1f1f] hover:text-white"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => onMonthChange(month.add(1, "month"))}
            className="p-1.5 rounded-md text-muted hover:bg-[#1f1f1f] hover:text-white"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-[11px] font-medium text-muted mb-2">
        {WEEK.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-sm">
        {days.map((d, i) => {
          const inMonth = d.month() === month.month();
          const iso = d.format("YYYY-MM-DD");
          const isAvail = inMonth && availableSet.has(iso) && !d.isBefore(today);
          const isSelected = selected && d.isSame(selected, "day");
          const isToday = d.isSame(today, "day");

          return (
            <div key={i} className="flex justify-center">
              <button
                disabled={!isAvail}
                onClick={() => onSelect(d)}
                className={[
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-sm",
                  !inMonth ? "text-transparent" : "",
                  isSelected
                    ? "bg-white text-black font-semibold"
                    : isAvail
                    ? "bg-[#1a1a1a] hover:bg-[#262626] text-white"
                    : inMonth
                    ? "text-[#3a3a3a] cursor-not-allowed"
                    : "",
                  isToday && !isSelected ? "ring-1 ring-border" : "",
                ].join(" ")}
              >
                {d.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
