import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import api from "../api/client";
import { CheckIcon, ExternalIcon } from "../components/Icons";

dayjs.extend(utc);
dayjs.extend(timezone);

function getTzLongName(tz) {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "long",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value || tz;
  } catch {
    return tz;
  }
}

function icsDate(d) {
  return dayjs(d).utc().format("YYYYMMDD[T]HHmmss[Z]");
}

function googleCalUrl(b) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: b.eventType.title,
    dates: `${icsDate(b.startTime)}/${icsDate(b.endTime)}`,
    details: b.notes || "",
    location: b.eventType.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function office365Url(b) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: b.eventType.title,
    startdt: new Date(b.startTime).toISOString(),
    enddt: new Date(b.endTime).toISOString(),
    body: b.notes || "",
    location: b.eventType.location,
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function outlookLiveUrl(b) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: b.eventType.title,
    startdt: new Date(b.startTime).toISOString(),
    enddt: new Date(b.endTime).toISOString(),
    body: b.notes || "",
    location: b.eventType.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function downloadIcs(b) {
  const escape = (s) => (s || "").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cal.com Clone//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@cal.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(b.startTime)}`,
    `DTEND:${icsDate(b.endTime)}`,
    `SUMMARY:${escape(b.eventType.title)}`,
    `LOCATION:${escape(b.eventType.location)}`,
    `DESCRIPTION:${escape(b.notes)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([lines], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${b.eventType.title}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Office365Icon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#EB3C00" d="M14 2 4 5v14l10 3 6-3V5z" />
      <path fill="#fff" d="M14 2v20l6-3V5z" opacity=".5" />
      <rect x="7" y="9" width="6" height="6" rx="3" fill="#fff" />
      <rect x="8.5" y="10.5" width="3" height="3" rx="1.5" fill="#EB3C00" />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="2" y="5" width="14" height="14" rx="2" fill="#0078D4" />
      <ellipse cx="9" cy="12" rx="3.5" ry="4.5" fill="#fff" />
      <ellipse cx="9" cy="12" rx="1.5" ry="2.5" fill="#0078D4" />
      <path d="M16 8l6-1.5v11L16 16z" fill="#106EBE" />
    </svg>
  );
}

function IcsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#fff" stroke="#d1d5db" strokeWidth="1.5" d="M5 3h10l4 4v14H5z" />
      <path fill="none" stroke="#d1d5db" strokeWidth="1.5" d="M15 3v4h4" />
      <text
        x="12"
        y="17"
        fontFamily="Inter, sans-serif"
        fontSize="5"
        fontWeight="700"
        textAnchor="middle"
        fill="#374151"
      >
        ICS
      </text>
    </svg>
  );
}

function CalButton({ href, onClick, children, title }) {
  const className =
    "w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} title={title}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={className} title={title}>
      {children}
    </button>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-3 py-3">
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const wasRescheduled = params.get("rescheduled") === "1";
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    api
      .get(`/api/bookings/${id}`)
      .then((r) => setBooking(r.data))
      .catch((e) => setError(e.response?.data?.error || "Not found"));
  };

  useEffect(() => {
    load();
  }, [id]);

  const cancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(true);
    await api.delete(`/api/bookings/${id}`);
    setCancelling(false);
    load();
  };

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 px-6 text-center bg-gray-50">
        {error}
      </div>
    );
  if (!booking)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        Loading…
      </div>
    );

  const tz = booking.user.timezone;
  const start = dayjs(booking.startTime).tz(tz);
  const end = dayjs(booking.endTime).tz(tz);
  const tzLong = getTzLongName(tz);
  const cancelled = booking.status === "CANCELLED";
  const rescheduleLink = `/${booking.user.username}/${booking.eventType.slug}?reschedule=${booking.id}`;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-6 sm:px-10 py-10 text-center border-b border-gray-200">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                cancelled ? "bg-red-50 text-red-600" : "bg-white text-emerald-500 border border-gray-200"
              }`}
            >
              <CheckIcon />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-5">
              {cancelled
                ? "This booking was cancelled"
                : wasRescheduled
                ? "Booking rescheduled"
                : "This meeting is scheduled"}
            </h1>
            {!cancelled && (
              <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
                We sent an email with a calendar invitation with the details to everyone.
              </p>
            )}
          </div>

          <div className="px-6 sm:px-10 py-6 divide-y divide-gray-100">
            <Row label="What">
              <span className="font-medium">
                {booking.eventType.title} between {booking.user.name} and {booking.attendeeName}
              </span>
            </Row>
            <Row label="When">
              <div>{start.format("dddd, MMMM D, YYYY")}</div>
              <div className="mt-1">
                <span className="font-medium">
                  {start.format("HH:mm")} - {end.format("HH:mm")}
                </span>{" "}
                <span className="text-gray-500">({tzLong})</span>
              </div>
            </Row>
            <Row label="Who">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.user.name}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Host
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm break-all">{booking.user.email}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.attendeeName}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      Guest
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm break-all">{booking.attendeeEmail}</div>
                </div>
              </div>
            </Row>
            <Row label="Where">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-blue-600 hover:underline inline-flex items-center gap-1.5"
              >
                {booking.eventType.location} <ExternalIcon width={12} height={12} />
              </a>
            </Row>
            {booking.notes && (
              <Row label="Additional notes">
                <div className="text-blue-700 whitespace-pre-wrap break-words">{booking.notes}</div>
              </Row>
            )}
            {booking.answers && booking.answers.length > 0 && (
              <>
                {booking.answers.map((a) => (
                  <Row key={a.id} label={a.question.label}>
                    <div className="whitespace-pre-wrap break-words">{a.value}</div>
                  </Row>
                ))}
              </>
            )}
          </div>

          {!cancelled && (
            <div className="px-6 sm:px-10 py-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-sm font-medium">Add to calendar</span>
              <div className="flex items-center gap-2">
                <CalButton href={googleCalUrl(booking)} title="Google Calendar">
                  <GoogleIcon />
                </CalButton>
                <CalButton href={office365Url(booking)} title="Office 365">
                  <Office365Icon />
                </CalButton>
                <CalButton href={outlookLiveUrl(booking)} title="Outlook">
                  <OutlookIcon />
                </CalButton>
                <CalButton onClick={() => downloadIcs(booking)} title="Download ICS">
                  <IcsIcon />
                </CalButton>
              </div>
            </div>
          )}

          {!cancelled && (
            <div className="px-6 sm:px-10 py-5 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <span className="text-gray-500">Need to make a change?</span>
              <div className="flex items-center gap-3">
                <Link to={rescheduleLink} className="text-gray-900 hover:underline font-medium">
                  Reschedule
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="text-red-600 hover:underline font-medium"
                >
                  {cancelling ? "Cancelling…" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Create your own booking link with{" "}
          <a href="/" className="text-gray-900 font-medium hover:underline">
            Cal.com
          </a>
        </p>
      </div>
    </div>
  );
}
