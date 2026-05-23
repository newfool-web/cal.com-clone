# Cal.com Clone

A scheduling and booking web app inspired by [Cal.com](https://cal.com). A user shares a public link, the invitee picks a time, a booking is created — with timezone-aware slot generation, custom questions, and rescheduling.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS + Redux Toolkit + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| Time | dayjs (utc + timezone) |
| Containers | Docker (multi-stage client → nginx; node:20-slim server) |

## What the app does

**Owner dashboard** (single seeded user, no auth) — manage event types, availability schedules, and bookings.

**Public booking flow** — anyone with the link can book a time:

1. `/<username>` lists visible event types
2. `/<username>/<slug>` shows a calendar with available slots
3. Pick a slot → fill a form (name, email, custom questions) → submit
4. Redirects to `/booking/<id>` with **Add to calendar** (Google/Outlook/Office 365/ICS) and reschedule/cancel controls

Slot generation, double-booking prevention, and timezone handling live in [server/src/slots.js](server/src/slots.js) and [server/src/routes/public.js](server/src/routes/public.js).

## Data model

```
User
 ├─ EventType[]           bookable templates
 │    └─ Question[]       custom questions per event type
 ├─ Schedule[]            named availability schedules (one isDefault)
 │    └─ Availability[]   day-of-week start/end windows
 ├─ DateOverride[]        per-day exceptions
 └─ Booking[]
      └─ BookingAnswer[]
```

See [server/prisma/schema.prisma](server/prisma/schema.prisma).

## Project structure

```
cal.com-clone/
├── client/                  React + Vite frontend (Dockerfile, Dockerfile.dev, nginx.conf)
├── server/                  Express + Prisma backend (Dockerfile, seed.js)
├── docker-compose.yml       Production-style local stack
└── docker-compose.dev.yml   Dev stack (vite HMR + nodemon-style)
```

## Running locally

### Full stack via Docker

```bash
docker compose up --build
```

Frontend → http://localhost:5173 · Backend → http://localhost:4000 · Postgres → 5432

The server runs `prisma db push` + seed on startup.

### Native dev with DB in Docker

```bash
docker run --name calclone-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=calclone \
  -p 5432:5432 -d postgres:15-alpine

cd server && npm install && cp .env.example .env && npx prisma db push && npm run seed && npm run dev
# new terminal
cd client && npm install && npm run dev
```

## Environment variables

`server/.env`

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calclone?schema=public"
PORT=4000
DEFAULT_USER_EMAIL="achyut@example.com"
```

`client/.env`

```
VITE_API_URL=http://localhost:4000
```

`VITE_API_URL` is inlined at build time by Vite.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness |
| GET | `/api/me` | Seeded user |
| GET/POST | `/api/event-types` | List / create |
| GET/PUT/DELETE | `/api/event-types/:id` | CRUD (with questions) |
| GET/POST | `/api/schedules` | List / create |
| GET/PUT/DELETE | `/api/schedules/:id` | CRUD (slots + overrides) |
| GET | `/api/bookings?status=upcoming\|past\|cancelled` | Owner list |
| GET | `/api/bookings/:id` | Detail (with answers) |
| PUT | `/api/bookings/:id` | Reschedule |
| DELETE | `/api/bookings/:id` | Cancel |
| GET | `/api/u/:username` | Public profile |
| GET | `/api/u/:username/:slug` | Event type detail |
| GET | `/api/u/:username/:slug/slots?date=YYYY-MM-DD` | Slots for a date |
| GET | `/api/u/:username/:slug/available-dates?month=YYYY-MM` | Bookable dates |
| POST | `/api/bookings` | Create a booking |

## Seed data

- **User** — Achyut Gupta · `achyut-gupta-qldpdd` · `Asia/Kolkata`
- **Event types** — `15 min meeting`, `30 min meeting`, `Secret meeting` (hidden)
- **Schedule** — `Working hours`, default, Mon-Fri 09:00-17:00

Idempotent — re-runs don't duplicate.

## Assumptions

- Single-tenant, no auth. Login button just routes to the dashboard.
- Times stored in UTC; the schedule's timezone is used for display and slot math.
- Double-booking prevented by an overlap re-check inside `POST /api/bookings`.
- Email notifications are not implemented — the confirmation page is the source of truth.

## Scripts

**server** — `dev` · `start` · `seed` · `migrate` · `generate`
**client** — `dev` · `build` · `preview`
