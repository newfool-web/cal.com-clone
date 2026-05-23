# Cal.com Clone

A scheduling and booking web application inspired by [Cal.com](https://cal.com). A user shares a public link, the invitee picks a time on a calendar, and a confirmed booking is created — with timezone-aware slot generation, custom questions, and rescheduling.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS + Redux Toolkit + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| Time handling | dayjs with `utc` + `timezone` plugins |
| Containerization | Docker (multi-stage for the client → nginx; node:20-slim for the server) |

---

## What the app does

The product is split into two surfaces:

### 1. Owner-side dashboard (single seeded user)

A pre-provisioned user lands on the dashboard from the home page's **Login** button. From there they manage:

- **Event types** — bookable meeting templates (`15 min meeting`, `30 min meeting`, etc.) with a title, slug, duration, location, hidden flag, and custom questions
- **Availability** — one or more named *schedules*, each with day-of-week working hours, a timezone, and optional date overrides. One schedule is marked as the default and is what powers slot generation on the public page
- **Bookings** — upcoming / past / cancelled tabs with cancel and reschedule actions

### 2. Public booking flow

Anyone with a link can book:

1. `/<username>` lists the visible event types
2. `/<username>/<slug>` shows a calendar of available dates and time slots
3. Picking a slot reveals a form (name, email, custom questions, notes)
4. On submit a `Booking` is created and the page redirects to `/booking/<id>` — a confirmation card with **Add to calendar** (Google / Outlook / Office 365 / `.ics` download) and **Reschedule / Cancel** controls

---

## End-to-end booking flow

```
1. Invitee opens /achyut-gupta-qldpdd/30min
   └─► GET /api/u/achyut-gupta-qldpdd/30min          → event type + questions

2. Invitee navigates to a month
   └─► GET /api/u/.../available-dates?month=YYYY-MM  → bookable date list
       (server expands the default schedule's day-of-week rules and date overrides)

3. Invitee clicks a date
   └─► GET /api/u/.../slots?date=YYYY-MM-DD          → array of UTC slot starts
       (server walks the schedule's start-end window in `duration` steps,
        skips past slots, skips slots that overlap with existing CONFIRMED bookings)

4. Invitee picks a slot, fills the form, hits Confirm
   └─► POST /api/bookings { eventTypeId, startTime, attendee*, answers[] }
       Server:
         • validates required questions
         • re-checks for overlap (race-condition guard)
         • creates Booking + BookingAnswer rows in a transaction
   └─► redirect to /booking/<id>

5. Confirmation page fetches the booking and renders:
   GET /api/bookings/<id>  → booking + eventType + user + answers (with question labels)
```

The same flow drives **rescheduling** — the public booking page accepts `?reschedule=<id>` and the new slot pick goes to `PUT /api/bookings/:id` instead of `POST /api/bookings`, which moves the existing row instead of creating a new one.

---

## Slot generation (the interesting bit)

Given a date `YYYY-MM-DD` and a user, the server:

1. Looks up the user's **default `Schedule`** (or any schedule if no default is set)
2. Finds availability rows for that schedule
3. Picks the row(s) matching the requested day-of-week
4. If a `DateOverride` exists for that date it replaces the window (or blocks the day entirely)
5. Walks from `startTime` to `endTime` in steps of `eventType.duration` minutes, in the schedule's **timezone** (using `dayjs.tz`)
6. Filters out slots in the past
7. Filters out slots overlapping any existing `CONFIRMED` booking
8. Returns each slot as a UTC ISO string + a `HH:mm` label

This is in [server/src/slots.js](server/src/slots.js).

---

## Data model

```
User                      ── seeded user (Achyut Gupta)
 ├─ EventType[]           ── bookable templates
 │    └─ Question[]       ── custom booking questions per event type
 ├─ Schedule[]            ── named availability schedules
 │    └─ Availability[]   ── day-of-week + start-end windows
 ├─ DateOverride[]        ── per-day exceptions / blocks
 └─ Booking[]
      └─ BookingAnswer[]  ── answers to a Question on this booking
```

Defined in [server/prisma/schema.prisma](server/prisma/schema.prisma).

Key constraints:

- `EventType.userId + slug` is unique → public URLs stay stable
- Only one `Schedule.isDefault = true` is enforced application-side (the schedule editor flips the previous default off in a transaction)
- `Booking.status` is either `CONFIRMED` or `CANCELLED` — cancellation is a soft update so the row stays in history

---

## Project structure

```
cal.com-clone/
├── client/                  React + Vite frontend
│   ├── src/
│   │   ├── api/             axios instance pointed at VITE_API_URL
│   │   ├── components/      Sidebar, DashboardLayout, Calendar, Toast, Icons
│   │   ├── pages/           Home, EventTypes, Availability, Bookings, public flow
│   │   └── store/           Redux slice for the current (seeded) user
│   ├── Dockerfile           Multi-stage: vite build → nginx
│   ├── Dockerfile.dev       Vite dev server with HMR
│   └── nginx.conf           SPA fallback + asset caching
├── server/                  Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js          Creates the default user, event types, schedule
│   ├── src/
│   │   ├── routes/          me, eventTypes, schedules, bookings, public
│   │   ├── slots.js         Slot-generation logic
│   │   ├── db.js            Prisma client + getDefaultUser helper
│   │   └── index.js         Express app + route mounting
│   └── Dockerfile
├── docker-compose.yml       Production-style local stack
├── docker-compose.dev.yml   Dev stack (vite HMR + nodemon-style)
└── render.yaml              Blueprint config (optional)
```

---

## Running locally

### Option A — full stack via Docker

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:4000
- Postgres → localhost:5432

The server container runs `prisma db push` and the seed on startup, so the database is ready as soon as the logs say `Server listening on 4000`.

### Option B — DB in Docker, server + client on the host

Better for active development (you keep nodemon / vite HMR locally).

```bash
# 1. Postgres
docker run --name calclone-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=calclone \
  -p 5432:5432 -d postgres:15-alpine

# 2. Server
cd server
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev

# 3. Client (new terminal)
cd client
npm install
npm run dev
```

### Option C — dev stack in Docker with HMR

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Environment variables

**`server/.env`**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calclone?schema=public"
PORT=4000
DEFAULT_USER_EMAIL="achyut@example.com"
```

**`client/.env`**

```
VITE_API_URL=http://localhost:4000
```

`VITE_API_URL` is read **at build time** by Vite and inlined into the JS bundle. In Docker it's passed as a build arg.

---

## API reference

All endpoints return JSON. `:username` and `:slug` are public; everything else is implicitly scoped to the seeded user.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness probe |
| GET | `/api/me` | The seeded user |
| GET / POST | `/api/event-types` | List or create event types |
| GET / PUT / DELETE | `/api/event-types/:id` | CRUD on a single event type (with questions) |
| GET / POST | `/api/schedules` | List or create availability schedules |
| GET / PUT / DELETE | `/api/schedules/:id` | CRUD on a single schedule (slots + overrides) |
| GET | `/api/bookings?status=upcoming\|past\|cancelled` | Owner-side booking list |
| GET | `/api/bookings/:id` | Booking detail (with answers + question labels) |
| PUT | `/api/bookings/:id` | Reschedule — moves the booking to a new start time |
| DELETE | `/api/bookings/:id` | Cancel (sets `status = CANCELLED`) |
| GET | `/api/u/:username` | Public profile + visible event types |
| GET | `/api/u/:username/:slug` | Public event type detail (with questions) |
| GET | `/api/u/:username/:slug/slots?date=YYYY-MM-DD` | Available slots for one date |
| GET | `/api/u/:username/:slug/available-dates?month=YYYY-MM` | Bookable dates in a month |
| POST | `/api/bookings` | Create a booking (validates required questions + double-booking) |

---

## Default seed data

On first boot the seed creates:

- **User** — `Achyut Gupta`, username `achyut-gupta-qldpdd`, timezone `Asia/Kolkata`
- **Event types** — `15 min meeting` (`/15min`), `30 min meeting` (`/30min`), `Secret meeting` (`/secret`, hidden)
- **Schedule** — `Working hours`, default, Mon-Fri 09:00-17:00 in `Asia/Kolkata`

The seed is idempotent (uses `upsert` + a guarded create), so re-running it doesn't duplicate anything.

---

## Design decisions / assumptions

- **Single-tenant.** Only one user exists; there is no registration UI. The Login button on the home page just dispatches a Redux action and routes to `/event-types`.
- **No auth on the dashboard.** Anyone reaching `/event-types` is treated as the seeded owner. This keeps the demo focused on the booking flow.
- **UTC at rest, timezone for display.** `Booking.startTime` and `endTime` are stored in UTC. The user's schedule timezone is applied for slot generation and public display.
- **Slot atomicity.** Double-booking is prevented by re-checking for overlap inside `POST /api/bookings`. A race where two requests arrive simultaneously could in theory both pass — for a production system you'd add a unique constraint over `(userId, startTime)` or a serializable transaction. The current check covers the common case.
- **Custom questions are per-event-type.** Required ones are enforced server-side with the question's `label` echoed in the 400 response so the client can show a useful message.
- **Email notifications are not implemented.** The confirmation page is the source of truth.

---

## Scripts

**`server`**

| Script | Purpose |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Production start |
| `npm run seed` | Run the seed |
| `npm run migrate` | `prisma migrate deploy` (if you generate migrations) |
| `npm run generate` | `prisma generate` |

**`client`**

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle |
| `npm run preview` | Serve the built bundle |
