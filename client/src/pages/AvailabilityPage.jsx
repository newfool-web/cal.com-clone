import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/client";
import { ArrowLeft, PencilIcon, PlusIcon, TrashIcon } from "../components/Icons";

const DAYS = [
  { idx: 0, name: "Sunday" },
  { idx: 1, name: "Monday" },
  { idx: 2, name: "Tuesday" },
  { idx: 3, name: "Wednesday" },
  { idx: 4, name: "Thursday" },
  { idx: 5, name: "Friday" },
  { idx: 6, name: "Saturday" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

function to12h(t) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${mStr}${ampm}`;
}

function from12h(text) {
  const t = text.trim().toLowerCase().replace(/\s+/g, "");
  const ampm = t.endsWith("am") ? "am" : t.endsWith("pm") ? "pm" : null;
  const core = ampm ? t.slice(0, -2) : t;
  const [hStr, mStr = "00"] = core.split(":");
  let h = parseInt(hStr, 10);
  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mStr.padStart(2, "0")}`;
}

function TimeInput({ value, onChange }) {
  const [text, setText] = useState(to12h(value));
  useEffect(() => setText(to12h(value)), [value]);
  return (
    <input
      className="input w-24 text-center"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        try {
          const v = from12h(text);
          if (/^\d{2}:\d{2}$/.test(v)) onChange(v);
          else setText(to12h(value));
        } catch {
          setText(to12h(value));
        }
      }}
    />
  );
}

function DayRow({ day, slots, onChange }) {
  const enabled = slots.length > 0;

  const toggle = () => {
    if (enabled) onChange([]);
    else onChange([{ dayOfWeek: day.idx, startTime: "09:00", endTime: "17:00" }]);
  };

  const update = (i, patch) => {
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const add = () => {
    const last = slots[slots.length - 1];
    onChange([
      ...slots,
      { dayOfWeek: day.idx, startTime: last?.endTime || "09:00", endTime: "17:00" },
    ]);
  };

  const remove = (i) => onChange(slots.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4 gap-2 py-3">
      <label className="flex items-center gap-3 sm:w-32 pt-2">
        <span className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={toggle} className="sr-only peer" />
          <span className="w-9 h-5 bg-[#2a2a2a] rounded-full peer-checked:bg-white transition-colors relative">
            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#0c0c0c] rounded-full peer-checked:translate-x-4 transition-transform" />
          </span>
        </span>
        <span className={enabled ? "text-white" : "text-muted"}>{day.name}</span>
      </label>
      {enabled ? (
        <div className="flex-1 space-y-2">
          {slots.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <TimeInput value={s.startTime} onChange={(v) => update(i, { startTime: v })} />
              <span className="text-muted">-</span>
              <TimeInput value={s.endTime} onChange={(v) => update(i, { endTime: v })} />
              <button onClick={add} className="p-1.5 text-muted hover:text-white" title="Add range">
                <PlusIcon />
              </button>
              {slots.length > 1 && (
                <button
                  onClick={() => remove(i)}
                  className="p-1.5 text-muted hover:text-red-400"
                  title="Remove range"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted pt-2">Unavailable</div>
      )}
    </div>
  );
}

function OverrideForm({ onAdd }) {
  const [date, setDate] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const submit = (e) => {
    e.preventDefault();
    if (!date) return;
    onAdd({ date, blocked, startTime: blocked ? null : startTime, endTime: blocked ? null : endTime });
    setDate("");
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 pt-4">
      <div>
        <label className="text-xs text-muted">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input mt-1 w-44"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} />
        Mark as unavailable
      </label>
      {!blocked && (
        <>
          <div>
            <label className="text-xs text-muted">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input mt-1 w-32"
            />
          </div>
          <div>
            <label className="text-xs text-muted">End</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input mt-1 w-32"
            />
          </div>
        </>
      )}
      <button type="submit" className="btn-secondary">
        <PlusIcon /> Add an override
      </button>
    </form>
  );
}

export default function AvailabilityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    api
      .get(`/api/schedules/${id}`)
      .then((r) => setData(r.data))
      .catch((e) =>
        setLoadError(
          e.response?.data?.error ||
            "Could not reach server. Is the backend running on " +
              (import.meta.env.VITE_API_URL || "http://localhost:4000") +
              "?"
        )
      );
  }, [id]);

  if (loadError) return <div className="max-w-5xl mx-auto text-red-400 text-sm">{loadError}</div>;
  if (!data) return <div className="text-muted text-sm">Loading…</div>;

  const slotsByDay = (d) =>
    data.availability
      .filter((s) => s.dayOfWeek === d)
      .map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }));

  const setDay = (idx, newSlots) => {
    const others = data.availability.filter((s) => s.dayOfWeek !== idx);
    setData({ ...data, availability: [...others, ...newSlots] });
  };

  const removeOverride = (i) => {
    setData({ ...data, overrides: data.overrides.filter((_, idx) => idx !== i) });
  };

  const addOverride = (o) => {
    setData({ ...data, overrides: [...data.overrides, o] });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/schedules/${id}`, {
        name: data.name,
        timezone: data.timezone,
        slots: data.availability,
        overrides: data.overrides,
      });
      setData(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  const setAsDefault = async () => {
    const res = await api.put(`/api/schedules/${id}`, { isDefault: true });
    setData({ ...res.data, overrides: data.overrides });
  };

  const remove = async () => {
    if (!confirm("Delete this schedule?")) return;
    await api.delete(`/api/schedules/${id}`);
    navigate("/availability");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            to="/availability"
            className="btn-ghost px-2 -ml-2 text-muted mt-1 shrink-0"
            title="Back"
          >
            <ArrowLeft />
          </Link>
          <div className="min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                className="input text-xl sm:text-2xl font-semibold w-full sm:w-72"
              />
            ) : (
              <h1
                className="text-xl sm:text-2xl font-semibold flex items-center gap-2 cursor-pointer truncate"
                onClick={() => setEditingName(true)}
              >
                <span className="truncate">{data.name}</span>
                <PencilIcon width={14} height={14} className="text-muted shrink-0" />
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-xs sm:text-sm mr-2">
            <span>Set as default</span>
            <span className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.isDefault}
                disabled={data.isDefault}
                onChange={setAsDefault}
                className="sr-only peer"
              />
              <span className="w-9 h-5 bg-[#2a2a2a] rounded-full peer-checked:bg-white transition-colors relative">
                <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#0c0c0c] rounded-full peer-checked:translate-x-4 transition-transform" />
              </span>
            </span>
          </label>
          {!data.isDefault && (
            <button onClick={remove} className="btn-secondary text-red-400 border-red-900">
              <TrashIcon />
            </button>
          )}
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4 sm:p-6 divide-y divide-border overflow-x-auto">
          {DAYS.map((d) => (
            <DayRow
              key={d.idx}
              day={d}
              slots={slotsByDay(d.idx)}
              onChange={(slots) => setDay(d.idx, slots)}
            />
          ))}
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <select
              value={data.timezone}
              onChange={(e) => setData({ ...data, timezone: e.target.value })}
              className="input mt-1"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="card p-4">
            <p className="text-sm font-medium">Something doesn't look right?</p>
            <button className="btn-secondary mt-3 w-full">Launch troubleshooter</button>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold">Date overrides</h2>
        <p className="text-sm text-muted mt-1">
          Add dates when your availability changes from your daily hours.
        </p>
        {data.overrides.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.overrides.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2"
              >
                <span>{new Date(o.date).toLocaleDateString()}</span>
                <span className="text-muted">
                  {o.blocked ? "Unavailable" : `${o.startTime} - ${o.endTime}`}
                </span>
                <button onClick={() => removeOverride(i)} className="text-muted hover:text-red-400">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        <OverrideForm onAdd={addOverride} />
      </div>
    </div>
  );
}
