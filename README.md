# Cal.com Clone

A scheduling and booking web application inspired by Cal.com.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Redux Toolkit + React Router
- **Backend:** Node.js + Express
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Docker + docker-compose, with a Render.com blueprint

## Features

- Event Types — create, edit, delete, toggle visibility, custom booking questions
- Availability — multiple named schedules with weekly working hours, timezones, date overrides
- Public booking page — calendar, time-slot picker, custom questions, double-booking prevention
- Booking confirmation page — calendar download (Google / Outlook / Office 365 / ICS), reschedule, cancel
- Bookings dashboard — upcoming, past, cancelled with filtering
- Toast notifications for copy actions
- Fully responsive (mobile drawer nav)

## Project Structure

```
cal.com-clone/
├── client/                  # React + Vite frontend
│   ├── Dockerfile           # Production (nginx serving built static files)
│   ├── Dockerfile.dev       # Dev (vite dev server, HMR)
│   └── nginx.conf
├── server/                  # Express + Prisma backend
│   └── Dockerfile           # Production
├── docker-compose.yml       # Production-style local stack
├── docker-compose.dev.yml   # Dev stack with HMR
├── render.yaml              # Render Blueprint (one-click deploy)
└── README.md
```

## Quick Start (Docker, production-style)

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:4000
- Database → localhost:5432

The first start runs `prisma db push` and the seed inside the server container automatically.

## Local Development

### Database only via Docker

```bash
docker run --name calclone-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=calclone \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Backend

```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Or run the whole dev stack in containers (HMR for the client):

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Environment Variables

### `server/.env`

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calclone?schema=public"
PORT=4000
DEFAULT_USER_EMAIL="achyut@example.com"
```

### `client/.env`

```
VITE_API_URL=http://localhost:4000
```

`VITE_API_URL` is read **at build time**. In Docker it's passed via the `args:` block in `docker-compose.yml` and as a build arg on Render.

## Default User

The app is single-user — there is no signup/login UI. On first start the seed creates:

- Name: Achyut Gupta
- Username: achyut-gupta-qldpdd
- Email: achyut@example.com

The home page has a single **Login** button that drops you straight into this user's dashboard.

## Database Schema (highlights)

- `User` — single seeded user
- `EventType` — bookable event with title, slug, duration, location
- `Question` — custom question attached to an event type (text / textarea / select / checkbox)
- `Schedule` + `Availability` — named schedules with day-of-week working hours; one marked `isDefault`
- `DateOverride` — exceptions to the default weekly hours
- `Booking` + `BookingAnswer` — confirmed/cancelled bookings with attendee details and answers

## API Overview

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness probe |
| GET | `/api/me` | Default logged-in user |
| GET/POST | `/api/event-types` | List or create event types |
| GET/PUT/DELETE | `/api/event-types/:id` | Manage a single event type (with questions) |
| GET/POST | `/api/schedules` | List or create availability schedules |
| GET/PUT/DELETE | `/api/schedules/:id` | Manage a single schedule |
| GET | `/api/bookings?status=upcoming\|past\|cancelled` | List bookings |
| GET | `/api/bookings/:id` | Booking detail (with answers) |
| PUT | `/api/bookings/:id` | Reschedule |
| DELETE | `/api/bookings/:id` | Cancel |
| GET | `/api/u/:username` | Public profile |
| GET | `/api/u/:username/:slug` | Public event-type detail (with questions) |
| GET | `/api/u/:username/:slug/slots?date=YYYY-MM-DD` | Available slots for a date |
| GET | `/api/u/:username/:slug/available-dates?month=YYYY-MM` | Bookable dates in a month |
| POST | `/api/bookings` | Create a booking (public) |

---

## Deployment

### Recommended platform — **Render.com** (free tier)

**Why Render:**
- Native Docker support — uses your existing `Dockerfile`s as-is
- Free PostgreSQL database (90 days, then $7/mo) — or pair with **Neon** for always-free Postgres
- Free web services (auto-sleep after 15 min of inactivity, ~30 s cold start)
- Auto-deploys from GitHub
- Free HTTPS

A `render.yaml` blueprint is included.

### One-click deploy via Blueprint

1. Push this repo to GitHub.
2. Log in to [Render](https://render.com) → **New +** → **Blueprint** → connect your repo.
3. Render reads `render.yaml` and provisions:
   - `calclone-db` — Postgres (free)
   - `calclone-server` — backend Docker service
   - `calclone-client` — frontend Docker service (nginx)
4. After the first server deploy, copy the server URL (e.g. `https://calclone-server.onrender.com`) and set it as the `VITE_API_URL` env var on `calclone-client`, then redeploy the client.

The server runs `prisma db push` and seeds on every boot — idempotent, so it's safe.

### Alternative — Vercel + Render + Neon

If you want zero cold-start on the frontend:

- **Frontend** on [Vercel](https://vercel.com) — `Root Directory: client`, framework: Vite. Set `VITE_API_URL` to your backend URL.
- **Backend** on [Render](https://render.com) — web service, Docker, root dir `server`.
- **Database** on [Neon](https://neon.tech) — always-free Postgres. Paste the connection string into Render's `DATABASE_URL` env var.

### Alternative — Fly.io

`fly launch` from inside `server/` and `client/` separately. Pair with Neon for the database.

## Assumptions

- Single-tenant — only one user exists. No registration UI is exposed.
- All times are stored in UTC; the schedule's timezone is used for display.
- A confirmed booking blocks the slot for everyone (no per-attendee scheduling).
- Email sending is not implemented — the booking is the source of truth.

## Scripts

`server`

- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm run seed` — seed the database
- `npm run migrate` — apply prisma migrations (if you generate them)

`client`

- `npm run dev` — start vite
- `npm run build` — production bundle
- `npm run preview` — serve the built bundle
