import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { GlobeIcon, MoreIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon } from "../components/Icons";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function summarizeAvailability(slots) {
  if (!slots || slots.length === 0) return "Unavailable";

  const byDay = new Map();
  for (const s of slots) {
    if (!byDay.has(s.dayOfWeek)) byDay.set(s.dayOfWeek, []);
    byDay.get(s.dayOfWeek).push(`${s.startTime}-${s.endTime}`);
  }
  const enabledDays = [...byDay.keys()].sort((a, b) => a - b);
  if (enabledDays.length === 0) return "Unavailable";

  const firstSlot = slots[0];
  const range = `${formatTime(firstSlot.startTime)} - ${formatTime(firstSlot.endTime)}`;

  const consecutive =
    enabledDays.length > 1 &&
    enabledDays.every((d, i) => i === 0 || d === enabledDays[i - 1] + 1);

  if (consecutive) {
    return `${DAYS_SHORT[enabledDays[0]]} - ${DAYS_SHORT[enabledDays[enabledDays.length - 1]]}, ${range}`;
  }
  return `${enabledDays.map((d) => DAYS_SHORT[d]).join(", ")}, ${range}`;
}

function formatTime(t) {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function RowMenu({ schedule, onSetDefault, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 rounded-md border border-border hover:bg-[#1f1f1f]"
      >
        <MoreIcon />
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-20 w-44 card py-1 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {!schedule.isDefault && (
            <button
              onClick={() => {
                setOpen(false);
                onSetDefault(schedule);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f]"
            >
              <CheckIcon width={14} height={14} /> Set as default
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onDuplicate(schedule);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f]"
          >
            <PencilIcon width={14} height={14} /> Duplicate
          </button>
          {!schedule.isDefault && (
            <button
              onClick={() => {
                setOpen(false);
                onDelete(schedule);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1f1f1f] text-red-400"
            >
              <TrashIcon width={14} height={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NewScheduleModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/api/schedules", { name });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md card p-6 mx-4">
        <h3 className="text-lg font-semibold">Add a new schedule</h3>
        <p className="text-sm text-muted mt-1">
          Create a new set of hours for a different context.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Name</label>
            <input
              autoFocus
              required
              className="input mt-1"
              placeholder="e.g. Weekends, Office hours"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating…" : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AvailabilityListPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("my");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/schedules");
      setItems(res.data);
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "Could not reach server. Is the backend running on " +
            (import.meta.env.VITE_API_URL || "http://localhost:4000") +
            "?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setDefault = async (s) => {
    await api.put(`/api/schedules/${s.id}`, { isDefault: true });
    load();
  };

  const duplicate = async (s) => {
    const res = await api.post("/api/schedules", { name: `${s.name} copy`, timezone: s.timezone });
    setItems((prev) => [...prev, res.data]);
  };

  const remove = async (s) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    await api.delete(`/api/schedules/${s.id}`);
    setItems((prev) => prev.filter((x) => x.id !== s.id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Availability</h1>
          <p className="text-sm text-muted mt-1">Configure times when you are available for bookings.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex bg-[#1a1a1a] rounded-md p-1 flex-1 sm:flex-initial">
            <button
              onClick={() => setTab("my")}
              className={`flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${
                tab === "my" ? "bg-[#2a2a2a] text-white" : "text-muted"
              }`}
            >
              My availability
            </button>
            <button
              onClick={() => setTab("team")}
              className={`flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-md whitespace-nowrap ${
                tab === "team" ? "bg-[#2a2a2a] text-white" : "text-muted"
              }`}
            >
              Team availability
            </button>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary shrink-0">
            <PlusIcon /> <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {tab === "team" ? (
        <div className="card px-6 py-20 text-center text-muted text-sm">
          No team availability yet
        </div>
      ) : (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="px-6 py-10 text-center text-muted text-sm">Loading…</div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-red-400 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-muted">No schedules yet.</p>
              <button onClick={() => setShowNew(true)} className="btn-primary mt-4">
                <PlusIcon /> Create your first schedule
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {items.map((s) => (
                  <Link
                    key={s.id}
                    to={`/availability/${s.id}`}
                    className="block px-4 sm:px-6 py-4 sm:py-5 hover:bg-[#161616] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{s.name}</h3>
                          {s.isDefault && (
                            <span className="text-[10px] uppercase tracking-wider bg-[#1d1d1d] border border-border text-muted px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted mt-1">
                          {summarizeAvailability(s.availability)}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                          <GlobeIcon width={12} height={12} /> {s.timezone}
                        </div>
                      </div>
                      <RowMenu
                        schedule={s}
                        onSetDefault={setDefault}
                        onDuplicate={duplicate}
                        onDelete={remove}
                      />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-6 py-4 text-center text-sm text-muted border-t border-border">
                Temporarily out-of-office?{" "}
                <a className="text-white underline hover:no-underline cursor-pointer">Add a redirect</a>
              </div>
            </>
          )}
        </div>
      )}

      {showNew && (
        <NewScheduleModal
          onClose={() => setShowNew(false)}
          onCreated={(s) => {
            setShowNew(false);
            navigate(`/availability/${s.id}`);
          }}
        />
      )}
    </div>
  );
}
