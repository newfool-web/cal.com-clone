import { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../api/client";
import { CalendarIcon, ClockIcon } from "../components/Icons";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "unconfirmed", label: "Unconfirmed" },
  { key: "recurring", label: "Recurring" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Canceled" },
];

function BookingCard({ b, onCancel }) {
  const start = dayjs(b.startTime);
  const end = dayjs(b.endTime);

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border last:border-0">
      <div>
        <div className="text-sm text-muted">{start.format("dddd, MMM D, YYYY")}</div>
        <div className="text-base font-medium mt-1">
          {start.format("h:mm A")} – {end.format("h:mm A")}
        </div>
        <div className="mt-2 text-sm">
          <span className="font-medium">{b.eventType?.title}</span>
          <span className="text-muted"> · between you and {b.attendeeName}</span>
        </div>
        {b.notes && <div className="text-xs text-muted mt-1">{b.notes}</div>}
      </div>
      <div className="flex items-center gap-2">
        <a href={`/booking/${b.id}`} className="btn-secondary">
          Details
        </a>
        {b.status === "CONFIRMED" && (
          <button onClick={() => onCancel(b)} className="btn-secondary text-red-400">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [tab, setTab] = useState("upcoming");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/bookings?status=${tab}`);
      setItems(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Could not reach server. Is the backend running on " + (import.meta.env.VITE_API_URL || "http://localhost:4000") + "?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const cancel = async (b) => {
    if (!confirm("Cancel this booking?")) return;
    await api.delete(`/api/bookings/${b.id}`);
    load();
  };

  const isStub = tab === "unconfirmed" || tab === "recurring";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? "tab-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto">
          <button className="btn-secondary">Filter</button>
        </div>
      </div>

      <div className="card min-h-[360px]">
        {loading ? (
          <div className="px-6 py-10 text-center text-muted text-sm">Loading…</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-400 text-sm">{error}</div>
        ) : isStub ? (
          <div className="px-6 py-20 text-center">
            <CalendarIcon className="mx-auto text-muted" width={28} height={28} />
            <p className="text-muted mt-3">You have no {tab} bookings</p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <CalendarIcon className="mx-auto text-muted" width={28} height={28} />
            <p className="text-muted mt-3">You have no {tab} bookings</p>
          </div>
        ) : (
          items.map((b) => <BookingCard key={b.id} b={b} onCancel={cancel} />)
        )}
      </div>
    </div>
  );
}
