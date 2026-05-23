import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api/client";
import Calendar from "../components/Calendar";
import { ClockIcon, VideoIcon, GlobeIcon, ChevronDown, ArrowLeft } from "../components/Icons";

function QuestionInput({ q, value, onChange }) {
  if (q.type === "textarea") {
    return (
      <textarea
        required={q.required}
        className="input mt-1"
        rows="3"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (q.type === "select") {
    return (
      <select
        required={q.required}
        className="input mt-1"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {(q.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (q.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 mt-1 text-sm">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
        Yes
      </label>
    );
  }
  return (
    <input
      required={q.required}
      className="input mt-1"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function PublicBookingPage() {
  const { username, slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [hour24, setHour24] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState("");

  const rescheduleId = params.get("reschedule");

  useEffect(() => {
    api
      .get(`/api/u/${username}/${slug}`)
      .then((r) => setInfo(r.data))
      .catch((e) => setError(e.response?.data?.error || "Not found"));
  }, [username, slug]);

  useEffect(() => {
    if (!info) return;
    api
      .get(`/api/u/${username}/${slug}/available-dates?month=${month.format("YYYY-MM")}`)
      .then((r) => setAvailableDates(r.data.dates));
  }, [info, month, username, slug]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    api
      .get(`/api/u/${username}/${slug}/slots?date=${selectedDate.format("YYYY-MM-DD")}`)
      .then((r) => setSlots(r.data.slots))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, username, slug]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setBookError("");
    try {
      if (rescheduleId) {
        const res = await api.put(`/api/bookings/${rescheduleId}`, { startTime: selectedSlot.startUtc });
        navigate(`/booking/${res.data.id}?rescheduled=1`);
      } else {
        const res = await api.post("/api/bookings", {
          eventTypeId: info.eventType.id,
          startTime: selectedSlot.startUtc,
          attendeeName: form.name,
          attendeeEmail: form.email,
          notes: form.notes,
          answers: Object.entries(answers)
            .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
            .map(([questionId, value]) => ({ questionId, value })),
        });
        navigate(`/booking/${res.data.id}`);
      }
    } catch (err) {
      setBookError(err.response?.data?.error || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="min-h-screen flex items-center justify-center text-muted px-6 text-center">{error}</div>;
  if (!info) return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>;

  const { eventType, user } = info;
  const questions = eventType.questions || [];

  const fmtSlot = (s) => {
    const d = dayjs(s.startUtc);
    return hour24 ? d.format("HH:mm") : d.format("h:mm A");
  };

  if (selectedSlot) {
    return (
      <div className="min-h-screen bg-bg text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <button
            onClick={() => setSelectedSlot(null)}
            className="text-muted hover:text-white text-sm flex items-center gap-1"
          >
            <ArrowLeft /> Back
          </button>
          <div className="card mt-4 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-5 sm:p-6">
              <div className="w-10 h-10 rounded-full bg-[#1d1d1d] flex items-center justify-center font-semibold">
                {user.name[0]}
              </div>
              <div className="text-sm text-muted mt-3">{user.name}</div>
              <h2 className="text-xl font-semibold mt-1 break-words">{eventType.title}</h2>
              {eventType.description && (
                <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{eventType.description}</p>
              )}
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted">
                  <ClockIcon /> {eventType.duration}m
                </li>
                <li className="flex items-center gap-2 text-muted">
                  <VideoIcon /> {eventType.location}
                </li>
                <li className="flex items-center gap-2 text-muted">
                  <GlobeIcon /> {user.timezone}
                </li>
                <li className="text-sm font-medium mt-2">
                  {dayjs(selectedSlot.startUtc).format("dddd, MMMM D, YYYY")}
                  <br />
                  {dayjs(selectedSlot.startUtc).format(hour24 ? "HH:mm" : "h:mm A")} -{" "}
                  {dayjs(selectedSlot.startUtc)
                    .add(eventType.duration, "minute")
                    .format(hour24 ? "HH:mm" : "h:mm A")}
                </li>
              </ul>
            </div>
            <form onSubmit={submit} className="p-5 sm:p-6 space-y-4">
              <h3 className="font-semibold">Enter Details</h3>
              <div>
                <label className="text-xs text-muted">Your name *</label>
                <input
                  required
                  className="input mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted">Email address *</label>
                <input
                  type="email"
                  required
                  className="input mt-1"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {questions.map((q) => (
                <div key={q.id}>
                  <label className="text-xs text-muted">
                    {q.label} {q.required && "*"}
                  </label>
                  <QuestionInput
                    q={q}
                    value={answers[q.id]}
                    onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-muted">Additional notes</label>
                <textarea
                  className="input mt-1"
                  rows="3"
                  placeholder="Please share anything that will help prepare for our meeting."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              {bookError && <p className="text-sm text-red-400">{bookError}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Booking…" : rescheduleId ? "Confirm reschedule" : "Confirm"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex justify-end mb-4 sm:mb-6">
          <button className="btn-secondary text-sm">Need help?</button>
        </div>

        <div className="card grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr_240px] divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-5 sm:p-6">
            <div className="w-10 h-10 rounded-full bg-[#1d1d1d] flex items-center justify-center font-semibold">
              {user.name[0]}
            </div>
            <div className="text-sm text-muted mt-3">{user.name}</div>
            <h2 className="text-xl font-semibold mt-1 break-words">{eventType.title}</h2>
            {eventType.description && (
              <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{eventType.description}</p>
            )}
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <ClockIcon /> {eventType.duration}m
              </li>
              <li className="flex items-center gap-2">
                <VideoIcon /> {eventType.location}
              </li>
              <li className="flex items-center gap-2">
                <GlobeIcon /> {user.timezone} <ChevronDown width={12} height={12} />
              </li>
            </ul>
          </div>

          <div className="p-5 sm:p-6 lg:border-r lg:border-border">
            <Calendar
              month={month}
              onMonthChange={setMonth}
              selected={selectedDate}
              onSelect={setSelectedDate}
              availableDates={availableDates}
            />
          </div>

          {selectedDate && (
            <div className="p-5 sm:p-6 border-t lg:border-t-0 border-border lg:border-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <span className="font-semibold">{selectedDate.format("ddd ")}</span>
                  <span className="text-muted">{selectedDate.format("DD")}</span>
                </div>
                <div className="flex bg-[#1a1a1a] rounded-md p-0.5 text-xs">
                  <button
                    onClick={() => setHour24(false)}
                    className={`px-2 py-1 rounded ${!hour24 ? "bg-[#2a2a2a]" : "text-muted"}`}
                  >
                    12h
                  </button>
                  <button
                    onClick={() => setHour24(true)}
                    className={`px-2 py-1 rounded ${hour24 ? "bg-[#2a2a2a]" : "text-muted"}`}
                  >
                    24h
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                {slotsLoading ? (
                  <div className="text-sm text-muted text-center py-4 col-span-full">Loading…</div>
                ) : slots.length === 0 ? (
                  <div className="text-sm text-muted text-center py-4 col-span-full">
                    No available slots
                  </div>
                ) : (
                  slots.map((s) => (
                    <button
                      key={s.startUtc}
                      onClick={() => setSelectedSlot(s)}
                      className="w-full flex items-center justify-center gap-2 border border-border bg-panel rounded-md py-2.5 text-sm hover:border-white"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {fmtSlot(s)}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted mt-6">Cal.com</div>
      </div>
    </div>
  );
}
