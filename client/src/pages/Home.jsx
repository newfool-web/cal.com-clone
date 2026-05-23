import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/userSlice";
import {
  ClockIcon,
  VideoIcon,
  GlobeIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckIcon,
} from "../components/Icons";

const TRUSTED = ["ramp", "PlanetScale", "coinbase", "storyblok", "AngelList"];

const STEPS = [
  {
    n: "01",
    title: "Connect your calendar",
    body: "We'll handle all the cross-referencing, so you don't have to worry about double bookings.",
    art: "calendar",
  },
  {
    n: "02",
    title: "Set your availability",
    body: "Want to block off weekends? Set up any buffers? We make that easy.",
    art: "availability",
  },
  {
    n: "03",
    title: "Choose how to meet",
    body: "It could be a video chat, phone call, or a walk in the park!",
    art: "meet",
  },
];

const TESTIMONIALS = [
  {
    quote: "We switched from Calendly to Cal.com and the team adoption was instant.",
    name: "Guillermo Rauch",
    role: "CEO, Vercel",
    initial: "G",
    bg: "bg-rose-200",
  },
  {
    quote: "Just gave it a go and it's definitely the easiest meeting I've ever scheduled!",
    name: "Aria Minaei",
    role: "CEO, Theatre.JS",
    initial: "A",
    bg: "bg-emerald-200",
  },
  {
    quote:
      "I finally made the move after I couldn't find how to use the Calendly dashboard.",
    name: "Ant Wilson",
    role: "Co-Founder & CTO, Supabase",
    initial: "A",
    bg: "bg-sky-200",
  },
  {
    quote: "Open source, beautifully designed, and incredibly powerful. A no-brainer for our team.",
    name: "Priya Sharma",
    role: "Head of Ops, Northwind Labs",
    initial: "P",
    bg: "bg-amber-200",
  },
  {
    quote: "The reschedule flow alone has saved me hours every week. Customers self-serve.",
    name: "Daniel Okafor",
    role: "Engineering Manager, Hexa.io",
    initial: "D",
    bg: "bg-indigo-200",
  },
];

function SalesforceLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-2/3 h-2/3" fill="#00A1E0">
        <path d="M27 16c2.7-2.8 6.5-4.5 10.6-4.5 5.5 0 10.3 3 12.7 7.6 2.1-.9 4.5-1.4 6.9-1.4 9.3 0 16.8 7.4 16.8 16.6S66.5 51 57.2 51c-1.1 0-2.2-.1-3.3-.3-2.3 4-6.7 6.7-11.7 6.7-2.1 0-4.1-.5-5.9-1.3-2.1 4.8-7 8.2-12.7 8.2-5.9 0-10.9-3.6-12.9-8.7-.9.2-1.9.3-2.9.3-7.5 0-13.5-6-13.5-13.5 0-5 2.7-9.3 6.7-11.6-.8-1.9-1.3-3.9-1.3-6.1 0-8.5 6.9-15.4 15.4-15.4 5 0 9.4 2.4 12.2 6 .5-.3.9-.6 1.4-.8z" transform="translate(-3,2)"/>
      </svg>
    </div>
  );
}

function OutlookLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-2">
      <svg viewBox="0 0 32 32" className="w-2/3 h-2/3">
        <rect x="2" y="6" width="20" height="20" rx="2" fill="#0078D4" />
        <ellipse cx="12" cy="16" rx="4.5" ry="6" fill="#fff" />
        <ellipse cx="12" cy="16" rx="2.2" ry="3.6" fill="#0078D4" />
        <path d="M22 10l8-2v16l-8-2z" fill="#0364B8" />
        <path d="M22 14l4 2 4-2v6l-4 2-4-2z" fill="#0078D4" opacity=".5" />
      </svg>
    </div>
  );
}

function MeetLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-2/3 h-2/3">
        <path d="M40 24v16l8 6V18l-8 6z" fill="#00832D" />
        <path d="M14 18h26v28H16a2 2 0 0 1-2-2V18z" fill="#0066DA" />
        <path d="M40 24v16l-6-4 6-12z" fill="#E94235" />
        <path d="M40 46l-6-4v4h6z" fill="#FFBA00" />
        <path d="M14 18l-4 4v18l4 6v-4h26V18H14z" fill="#0066DA" opacity="0" />
      </svg>
    </div>
  );
}

function CalendarLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-3">
      <svg viewBox="0 0 32 32" className="w-3/4 h-3/4">
        <rect x="3" y="6" width="26" height="22" rx="2" fill="#fff" stroke="#E1E1E1" strokeWidth="1" />
        <rect x="3" y="6" width="26" height="6" fill="#fff" />
        <rect x="3" y="11" width="26" height="1.5" fill="#E1E1E1" />
        <path d="M9 4v6" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
        <path d="M23 4v6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 4v6" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
        <text x="16" y="24" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="9" textAnchor="middle" fill="#4285F4">31</text>
      </svg>
    </div>
  );
}

function TeamsLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
      <svg viewBox="0 0 32 32" className="w-2/3 h-2/3">
        <rect x="3" y="9" width="16" height="16" rx="2" fill="#5059C9" />
        <text x="11" y="22" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="12" textAnchor="middle" fill="#fff">T</text>
        <circle cx="23" cy="13" r="3.5" fill="#7B83EB" />
        <path d="M19 18a4 4 0 0 1 8 0v6h-8z" fill="#7B83EB" />
      </svg>
    </div>
  );
}

function LinearLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-[#1E1E1E] flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-3/5 h-3/5">
        <path d="M6 36c0-1.6.1-3.2.4-4.7L31.7 56.6c-1.5.3-3.1.4-4.7.4C16.5 57 8 49.4 6.4 39.4z" fill="#F1A2A2"/>
        <path d="M7.6 27.4 36.6 56.4c-2.3.7-4.7 1-7.3.6L7 33.7c-.4-2-.6-4.2.6-6.3z" fill="#F08383"/>
        <path d="M10.3 21.2 42.8 53.7c-2 1.3-4.1 2.3-6.4 3L7.3 27.6c.6-2.3 1.6-4.4 3-6.4z" fill="#EE6464"/>
        <path d="M14.5 16.5C19.2 11.5 25.7 8.4 33 8.4c14 0 25.4 11.4 25.4 25.4 0 7.3-3.1 13.8-8.1 18.5z" fill="#EC4646"/>
      </svg>
    </div>
  );
}

function ZoomLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-[#2D8CFF] flex items-center justify-center">
      <svg viewBox="0 0 32 32" className="w-3/5 h-3/5" fill="#fff">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M19 14l6-3v10l-6-3z" />
      </svg>
    </div>
  );
}

function AnalyticsLogo() {
  return (
    <div className="w-full h-full rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
      <svg viewBox="0 0 32 32" className="w-2/3 h-2/3">
        <rect x="20" y="6" width="6" height="22" rx="3" fill="#F9AB00" />
        <rect x="13" y="14" width="6" height="14" rx="3" fill="#E37400" />
        <circle cx="9" cy="25" r="3" fill="#E37400" />
      </svg>
    </div>
  );
}

const INTEGRATIONS = [
  { name: "Salesforce", Logo: SalesforceLogo },
  { name: "Outlook", Logo: OutlookLogo },
  { name: "Google Meet", Logo: MeetLogo },
  { name: "Google Calendar", Logo: CalendarLogo },
  { name: "MS Teams", Logo: TeamsLogo },
  { name: "Linear", Logo: LinearLogo },
  { name: "Zoom", Logo: ZoomLogo },
  { name: "Analytics", Logo: AnalyticsLogo },
];

function Logo({ size = 28 }) {
  return (
    <div className="flex items-center gap-2 text-gray-900">
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect x="3" y="3" width="26" height="26" rx="6" fill="#0c0c0c" />
        <text
          x="16"
          y="22"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="16"
          textAnchor="middle"
          fill="#ffffff"
        >
          c
        </text>
      </svg>
      <span className="font-semibold text-xl tracking-tight">Cal.com</span>
    </div>
  );
}

function Nav({ onLogin }) {
  return (
    <header className="sticky top-4 z-40 px-4">
      <div className="max-w-5xl mx-auto rounded-full bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <Logo size={26} />
        <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-700">
          <button className="flex items-center gap-1 hover:text-gray-900">
            Solutions <ChevronDown width={14} height={14} />
          </button>
          <a className="hover:text-gray-900">Enterprise</a>
          <a className="hover:text-gray-900">Cal.ai</a>
          <button className="flex items-center gap-1 hover:text-gray-900">
            Developer <ChevronDown width={14} height={14} />
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            Resources <ChevronDown width={14} height={14} />
          </button>
          <a className="hover:text-gray-900">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="text-sm text-gray-700 hover:text-gray-900 hidden sm:block">
            Sign in
          </button>
          <button
            onClick={onLogin}
            className="bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full px-4 py-2 flex items-center gap-1.5"
          >
            Get started <ChevronRight width={14} height={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MiniCalendar() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const day = i - 3;
    if (day < 1 || day > 31) cells.push(null);
    else cells.push(day);
  }
  const available = new Set([6, 7, 8, 9, 15, 20, 21, 22, 23, 27, 28, 29, 30]);
  return (
    <div className="text-gray-900">
      <div className="text-base font-semibold mb-3">
        May <span className="text-gray-400 font-normal">2025</span>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-[10px] text-gray-400 text-center mb-2">
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isAvail = available.has(d);
          const isSel = d === 9;
          return (
            <div
              key={i}
              className={`h-7 w-7 mx-auto rounded-md flex items-center justify-center ${
                isSel
                  ? "bg-gray-900 text-white font-semibold"
                  : isAvail
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-300"
              }`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeroBookingCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 grid grid-cols-[1fr_220px] gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-rose-300" />
        </div>
        <div className="text-xs text-gray-500">Michael Oliver</div>
        <h3 className="text-lg font-semibold mt-0.5">Legal Consultation</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Discuss your legal matters with our experienced attorneys in a private consultation.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          <ClockIcon width={14} height={14} />
          <div className="flex bg-gray-100 rounded-md p-0.5 text-xs">
            <span className="px-2 py-1 rounded text-gray-500">15m</span>
            <span className="px-2 py-1 rounded bg-white shadow-sm text-gray-900 font-medium">30m</span>
            <span className="px-2 py-1 rounded text-gray-500">45m</span>
            <span className="px-2 py-1 rounded text-gray-500">1h</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
          <span className="w-4 h-4 rounded bg-[#2D8CFF] inline-block" /> Zoom
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <GlobeIcon width={14} height={14} /> Europe/London <ChevronDown width={10} height={10} />
        </div>
      </div>
      <MiniCalendar />
    </div>
  );
}

function StepArt({ kind }) {
  if (kind === "calendar") {
    return (
      <div className="mt-8 relative h-44 flex items-center justify-center">
        <div className="absolute w-44 h-44 rounded-full border border-gray-200" />
        <div className="absolute w-32 h-32 rounded-full border border-gray-200" />
        <div className="absolute -top-1 left-12 w-9 h-9 rounded-md bg-white border border-gray-200 shadow flex items-center justify-center text-xs font-semibold text-blue-500">
          O
        </div>
        <div className="absolute bottom-2 left-10 w-9 h-9 rounded-md bg-white border border-gray-200 shadow flex items-center justify-center text-[10px] font-bold">
          <span className="text-blue-500">G</span>
        </div>
        <div className="absolute top-10 -left-1 w-9 h-9 rounded-md bg-white border border-gray-200 shadow flex items-center justify-center text-[10px] font-bold text-red-500">
          17
        </div>
        <div className="w-20 h-9 rounded-md bg-white border border-gray-200 shadow flex items-center justify-center text-sm font-semibold">
          Cal.com
        </div>
      </div>
    );
  }

  if (kind === "availability") {
    const rows = [
      { day: "Mon", on: false, from: "8:30 am", to: "5:00 pm" },
      { day: "Tue", on: true, from: "9:00 am", to: "6:30 pm" },
      { day: "Wed", on: false, from: "10:00 am", to: "7:00 pm" },
    ];
    return (
      <div className="mt-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow p-3 space-y-2">
          {rows.map((r) => (
            <div key={r.day} className="flex items-center gap-2 text-xs">
              <span
                className={`w-7 h-4 rounded-full ${r.on ? "bg-gray-900" : "bg-gray-200"} relative shrink-0`}
              >
                <span
                  className={`absolute top-0.5 ${r.on ? "right-0.5" : "left-0.5"} w-3 h-3 rounded-full bg-white`}
                />
              </span>
              <span className="w-7 text-gray-600">{r.day}</span>
              <span className="flex-1 text-center text-gray-500 border border-gray-200 rounded-md py-1">
                {r.from}
              </span>
              <span className="text-gray-400">—</span>
              <span className="flex-1 text-center text-gray-500 border border-gray-200 rounded-md py-1">
                {r.to}
              </span>
              <span className="text-gray-400">+</span>
              <span className="text-gray-400">⎘</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "meet") {
    return (
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow p-3">
        <div className="flex items-center gap-1 mb-3">
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-3 h-32">
          <div className="bg-gray-100 rounded-md flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-900" />
          </div>
          <div className="bg-gray-100 rounded-md flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-900" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-gray-500">
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs">▶</span>
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs">🎙</span>
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs">💬</span>
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs">⊞</span>
          <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs">●</span>
        </div>
      </div>
    );
  }

  return null;
}

function BenefitCard({ title, body, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-gray-600 text-sm mt-3 leading-relaxed">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function NoticeBuffersMock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="font-semibold text-sm mb-4">Notice and buffers</div>
      <div className="space-y-3 text-xs">
        <div>
          <div className="text-gray-700 mb-1">Minimum notice</div>
          <div className="border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center">
            <span>24 hours</span>
            <ChevronDown width={14} height={14} className="text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-gray-700 mb-1">Buffer before event</div>
            <div className="border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center">
              <span>30 mins</span>
              <ChevronDown width={14} height={14} className="text-gray-400" />
            </div>
          </div>
          <div>
            <div className="text-gray-700 mb-1">Buffer after event</div>
            <div className="border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center">
              <span>30 mins</span>
              <ChevronDown width={14} height={14} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <div className="text-gray-700 mb-1">Time-slot intervals</div>
          <div className="border border-gray-200 rounded-md px-3 py-2 flex justify-between items-center">
            <span>5 mins</span>
            <ChevronDown width={14} height={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingLinkMock() {
  return (
    <div className="relative">
      <div className="absolute -top-2 left-6 right-6 h-3 bg-white rounded-t-xl border border-gray-200 border-b-0 shadow-sm" />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative">
        <div className="bg-gray-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-gray-700">
          cal.com/bailey
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-amber-200" />
        </div>
        <div className="text-xs text-gray-500 mt-2">Bailey Pumfleet</div>
        <h4 className="font-semibold mt-0.5">Business meeting</h4>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Want to talk strategy, partnerships, or the bigger picture of scheduling infrastructure? Let's
          discuss how Cal.com fits into your business goals.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <ClockIcon width={12} height={12} className="text-gray-500" />
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <span className="px-2 py-0.5 rounded bg-white shadow-sm font-medium">15m</span>
            <span className="px-2 py-0.5 text-gray-500">30m</span>
            <span className="px-2 py-0.5 text-gray-500">45m</span>
            <span className="px-2 py-0.5 text-gray-500">1h</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span className="w-3 h-3 rounded bg-[#2D8CFF] inline-block" /> Zoom
        </div>
      </div>
    </div>
  );
}

function OverlayCalendarMock() {
  const events = [
    { col: 2, label: "Coffee\n11 AM - 12 PM", bg: "bg-purple-100 text-purple-800" },
    { col: 1, label: "Lunch date\n12 PM - 1 PM", bg: "bg-purple-100 text-purple-800" },
    { col: 4, label: "Hiring call\n11:30 AM - 1 PM", bg: "bg-rose-100 text-rose-800" },
    { col: 5, label: "Company meeting\n11 AM - 2:30 PM", bg: "bg-sky-100 text-sky-800" },
    { col: 3, label: "Design conference\n12 PM - 2 PM", bg: "bg-gray-100 text-gray-700" },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="w-7 h-4 rounded-full bg-gray-900 relative">
            <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white" />
          </span>
          Overlay my calendar
        </div>
        <div className="flex bg-gray-100 rounded-md p-0.5 text-xs">
          <span className="px-2 py-0.5 rounded bg-white shadow-sm font-medium">12h</span>
          <span className="px-2 py-0.5 text-gray-500">24h</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 text-[10px] text-gray-500">
        <div>Wed 06</div>
        <div>Thu 07</div>
        <div>Fri 08</div>
        <div>Sat 09</div>
        <div>Sun 10</div>
      </div>
      <div className="grid grid-cols-5 gap-1 mt-1 h-24 relative">
        {events.map((e, i) => (
          <div
            key={i}
            className={`text-[10px] rounded-md px-1.5 py-1 whitespace-pre-wrap leading-tight ${e.bg}`}
            style={{ gridColumnStart: e.col }}
          >
            {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function RemindersMock() {
  return (
    <div className="flex justify-end">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 max-w-[280px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gray-900 text-white text-xs flex items-center justify-center font-bold">
            Cal
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">Meeting is starting now</div>
            <div className="text-[10px] text-gray-500">Your meeting is starting now. Hurry up!</div>
          </div>
          <div className="text-[10px] text-gray-400">Just now</div>
        </div>
      </div>
    </div>
  );
}

function IntegrationGrid() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {INTEGRATIONS.map(({ name, Logo }) => (
        <div key={name} className="aspect-square">
          <Logo />
        </div>
      ))}
    </div>
  );
}

function Testimonials() {
  const [idx, setIdx] = useState(1);
  const total = TESTIMONIALS.length;
  const prev = () => setIdx((idx - 1 + total) % total);
  const next = () => setIdx((idx + 1) % total);

  const at = (offset) => TESTIMONIALS[(idx + offset + total) % total];

  return (
    <section className="bg-[#f5f5f3] border-t border-gray-200 px-4 py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm">
          <span>👥</span> Testimonials
        </span>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5">
          Don't just take our word for it
        </h2>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Our users are our best ambassadors. Discover why we're the top choice for scheduling meetings.
        </p>
      </div>

      <div className="mt-14 max-w-6xl mx-auto relative">
        <div className="grid grid-cols-3 gap-6 items-stretch">
          {[-1, 0, 1].map((offset) => {
            const t = at(offset);
            const isCenter = offset === 0;
            return (
              <div
                key={offset}
                className={`bg-white rounded-2xl border border-gray-200 p-7 transition-all ${
                  isCenter ? "shadow-xl scale-[1.02]" : "opacity-50"
                }`}
              >
                <p className="text-lg font-semibold leading-snug text-gray-900">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-10">
                  <div className={`w-10 h-10 rounded-md ${t.bg} flex items-center justify-center font-semibold text-gray-800`}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

function AwardBadge({ label }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="44" viewBox="0 0 36 44" className="text-gray-900">
        <path
          d="M6 6c2 12 6 22 12 30M30 6c-2 12-6 22-12 30"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <div className="text-[10px] text-gray-500 leading-tight">{label}</div>
        <div className="text-lg font-bold tracking-tight">1st</div>
      </div>
      <svg width="36" height="44" viewBox="0 0 36 44" className="text-gray-900">
        <path
          d="M30 6c-2 12-6 22-12 30M6 6c2 12 6 22 12 30"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ReviewStars({ brand, color, mark }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5 text-amber-500 text-sm leading-none">{"★★★★★"}</div>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${color}`}
      >
        {mark}
      </div>
    </div>
  );
}

function DecorativeSquares() {
  // Background decorative grid of rounded squares
  const items = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 11; c++) {
      items.push({ r, c });
    }
  }
  return (
    <div className="absolute inset-0 grid grid-rows-5 grid-cols-11 gap-3 p-6 opacity-40 pointer-events-none">
      {items.map(({ r, c }) => (
        <div
          key={`${r}-${c}`}
          className="rounded-2xl bg-white/80 border border-gray-200/60"
        />
      ))}
    </div>
  );
}

function PreFooterAwards({ onLogin }) {
  return (
    <section className="px-4 pb-16">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-200 relative overflow-hidden py-24 px-6">
        <DecorativeSquares />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Smarter, simpler scheduling
          </h2>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={onLogin}
              className="bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5"
            >
              Get started <ChevronRight width={14} height={14} />
            </button>
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
              Talk to sales <ChevronRight width={14} height={14} />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            <AwardBadge label="Product of the day" />
            <AwardBadge label="Product of the week" />
            <AwardBadge label="Product of the month" />
            <ReviewStars brand="ProductHunt" color="bg-[#DA552F]" mark="P" />
            <ReviewStars brand="Google" color="bg-white border border-gray-200 text-gray-900" mark="G" />
            <ReviewStars brand="G2" color="bg-[#FF492C]" mark="G" />
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = {
  Solutions: [
    "iOS/Android App",
    "Self-hosted",
    "Pricing",
    "Docs",
    "Cal.ai - AI Phone Agent",
    "Enterprise",
    "Integrate Cal.com",
    "Routing",
    "Cal.com Atoms",
    "Desktop App",
    "FAQ",
    "Enterprise API",
    "Github",
    "Docker",
  ],
  "Use Cases": [
    "Sales",
    "Marketing",
    "Talent Acquisition",
    "Customer Support",
    "Higher Education",
    "Telehealth",
    "Professional Services",
    "Hiring Marketplace",
    "Human Resources",
    "Tutoring",
    "C-suite",
    "Law",
  ],
  Resources: [
    "Affiliate Program",
    "Help Docs",
    "Blog",
    "Cal Fonts",
    "Teams",
    "Embed",
    "Recurring events",
    "Developers",
    "OOO",
    "Workflows",
    "Instant Meetings",
    "App Store",
    "Requires confirmation",
    "Payments",
    "Video Conferencing",
  ],
  Company: [
    "Jobs",
    "About",
    "Open Startup",
    "Support",
    "Privacy",
    "Terms",
    "License",
    "Security",
    "Changelog",
    "Get a demo",
    "Talk to sales",
  ],
};

const COMPLIANCE_BADGES = [
  { top: "ISO", bottom: "27001", ring: true },
  { top: "AICPA", bottom: "SOC 2", ring: true },
  { top: "CCPA", bottom: "COMPLIANT", ring: false },
  { top: "GDPR", bottom: "COMPLIANT", ring: false },
  { top: "HIPAA", bottom: "COMPLIANT", ring: false },
];

function ComplianceBadge({ top, bottom, ring }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-[8px] font-bold text-gray-700 ${
          ring ? "border-2 border-gray-700" : "bg-gray-100"
        }`}
      >
        <span className="leading-none">{top}</span>
      </div>
      <span className="text-[9px] font-semibold text-gray-700 mt-1 tracking-wider">{bottom}</span>
    </div>
  );
}

const DOWNLOAD_PLATFORMS = [
  { name: "iPhone", iconColor: "text-gray-900" },
  { name: "Android", iconColor: "text-emerald-500" },
  { name: "Chrome", iconColor: "text-blue-500" },
  { name: "Safari", iconColor: "text-sky-500" },
  { name: "Edge", iconColor: "text-teal-500" },
  { name: "Firefox", iconColor: "text-orange-500" },
  { name: "MacOS", iconColor: "text-gray-900" },
  { name: "Windows", iconColor: "text-sky-600" },
  { name: "Linux", iconColor: "text-gray-900" },
];

function DownloadButton({ name, iconColor }) {
  return (
    <button className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50">
      <span className={`w-4 h-4 rounded-sm ${iconColor} bg-current opacity-90`} />
      {name}
    </button>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#f5f5f3] border-t border-gray-200 px-4 pt-16 pb-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_3fr] gap-10">
        <div>
          <div className="font-semibold text-2xl tracking-tight">Cal.com</div>
          <p className="text-xs text-gray-600 mt-4 leading-relaxed max-w-xs">
            Cal.com® and Cal® are a registered trademark by Cal.com, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-3 mt-6">
            {COMPLIANCE_BADGES.map((b) => (
              <ComplianceBadge key={b.top} {...b} />
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-6 leading-relaxed max-w-xs">
            Our mission is to connect a billion people by 2031 through calendar scheduling.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <select className="text-xs bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700">
              <option>English</option>
            </select>
            <span className="inline-flex items-center gap-2 text-xs bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 font-mono">
              All Systems Operational
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </span>
          </div>

          <h4 className="text-base font-semibold mt-8">Downloads</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {DOWNLOAD_PLATFORMS.map((p) => (
              <DownloadButton key={p.name} {...p} />
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <div className="bg-[#FF492C] text-white text-[10px] font-semibold rounded-md px-3 py-2 flex items-center gap-2">
              <span className="text-amber-300">★★★★★</span>
              <span className="leading-tight">
                Read our<br />reviews on
              </span>
              <span className="text-base font-bold">G2</span>
            </div>
            <div className="bg-emerald-500 text-white text-[10px] font-semibold rounded-md px-3 py-2 flex items-center gap-2">
              <span className="text-white">★★★★★</span>
              <span className="leading-tight">
                Read our<br />reviews on
              </span>
              <span className="text-base font-bold">★</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-6">
            Need Help? <a className="text-sky-600 hover:underline">support@cal.com</a> or visit{" "}
            <a className="text-sky-600 hover:underline">cal.com/help</a>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-gray-900 mb-4">{heading}</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                {links.map((l) => (
                  <li key={l}>
                    <a className="hover:text-gray-900 cursor-pointer">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
        © 2026 Cal.com Clone — built for learning
      </div>
    </footer>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(login());
    navigate("/event-types");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-gray-900">
      <Nav onLogin={handleLogin} />

      <section className="px-4 pt-12 pb-20">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-200 px-6 md:px-12 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <button className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
              Cal.com launches v6.5 <ChevronRight width={12} height={12} />
            </button>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mt-6">
              The better way<br />to schedule<br />your meetings
            </h1>
            <p className="text-gray-600 text-base mt-6 max-w-md">
              A fully customizable scheduling software for individuals, businesses taking calls and
              developers building scheduling platforms where users meet users.
            </p>

            <div className="mt-8 space-y-3 max-w-md">
              <button
                onClick={handleLogin}
                className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                Login with Google
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg py-3 border border-gray-200 flex items-center justify-center gap-2"
              >
                Login with email <ChevronRight width={14} height={14} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">No credit card required</p>

            <div className="flex items-center gap-6 mt-10">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold text-xs">★</span>
                <span className="text-xs text-gray-600 font-medium">Trustpilot</span>
                <span className="text-xs text-gray-400">4.5</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-xs">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <HeroBookingCard />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
          <p className="text-sm text-gray-500 max-w-[180px] leading-tight">
            Trusted by fast-growing companies around the world
          </p>
          {TRUSTED.map((t) => (
            <span key={t} className="text-2xl font-semibold text-gray-800 tracking-tight">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#f5f5f3] border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
            <span>↗</span> How it works
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 leading-tight">
            With us, appointment scheduling is easy
          </h2>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Effortless scheduling for business and individuals, powerful solutions for fast-growing modern
            companies.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={handleLogin} className="bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
              Get started <ChevronRight width={14} height={14} />
            </button>
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
              Book a demo <ChevronRight width={14} height={14} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#f5f5f3] rounded-2xl border border-gray-200 p-7">
                <span className="inline-block bg-white border border-gray-200 text-gray-500 text-xs font-mono px-2 py-0.5 rounded-md">
                  {s.n}
                </span>
                <h3 className="text-xl font-semibold mt-4">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{s.body}</p>
                <StepArt kind={s.art} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm">
            <span>🎁</span> Benefits
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5">
            Your all-purpose scheduling app
          </h2>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Discover a variety of our advanced features. Unlimited and free for individuals.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={handleLogin} className="bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
              Get started <ChevronRight width={14} height={14} />
            </button>
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
              Book a demo <ChevronRight width={14} height={14} />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-14 grid md:grid-cols-2 gap-6 text-left">
          <BenefitCard
            title="Avoid meeting overload"
            body="Only get booked when you want to. Set daily, weekly or monthly limits and add buffers around your events to allow you to focus or take a break."
          >
            <NoticeBuffersMock />
          </BenefitCard>
          <BenefitCard
            title="Stand out with a custom booking link"
            body="Customize your booking link so it's short and easy to remember for your bookers. No more long, complicated links one can easily forget."
          >
            <BookingLinkMock />
          </BenefitCard>
          <BenefitCard
            title="Streamline your bookers' experience"
            body="Let your bookers overlay their calendar, receive booking confirmations via text or email, get events added to their calendar, and allow them to reschedule with ease."
          >
            <OverlayCalendarMock />
          </BenefitCard>
          <BenefitCard
            title="Reduce no-shows with automated meeting reminders"
            body="Easily send sms or meeting reminder emails about bookings, and send automated follow-ups to gather any relevant information before the meeting."
          >
            <RemindersMock />
          </BenefitCard>
        </div>
      </section>

      <Testimonials />

      <section className="px-4 py-24">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-gray-200 p-10 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#f5f5f3] border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
              <span>⊞</span> App store
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-5 leading-tight">
              All your key tools<br />in-sync with<br />your meetings
            </h2>
            <p className="text-gray-600 mt-4 max-w-md">
              Cal.com works with all apps already in your flow ensuring everything works perfectly together.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button onClick={handleLogin} className="bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
                Get started <ChevronRight width={14} height={14} />
              </button>
              <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5">
                Explore apps <ChevronRight width={14} height={14} />
              </button>
            </div>
          </div>
          <div>
            <IntegrationGrid />
          </div>
        </div>
      </section>

      <PreFooterAwards onLogin={handleLogin} />
      <SiteFooter />
    </div>
  );
}
