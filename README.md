# MediConnect

MediConnect is a production-style diploma project for an eClinic-style Mongolian online medical platform. It is now one fullstack Next.js App Router TypeScript application with UI pages and `/api/*` route handlers in the same root project.

## Tech Stack

- App: Next.js App Router, TypeScript, Tailwind CSS, Zustand, Axios
- API: Next.js route handlers, Prisma, PostgreSQL, JWT, bcrypt, Zod, RBAC
- Infrastructure: Docker Compose with `app` and PostgreSQL `db`

## Setup

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `docker compose up -d db`.
4. Run `npm run prisma:migrate`.
5. Run `npm run prisma:seed`.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

The app uses `DATABASE_URL` from environment variables. Database credentials are not hardcoded in application code.

## Default Demo Accounts

- Patient: `patient@mediconnect.mn` / `Password123!`
- Doctor: `doctor@mediconnect.mn` / `Password123!`
- Admin: `admin@mediconnect.mn` / `Password123!`

## Project Structure

The repository follows the requested monorepo shape:

- `src/app`: UI pages and API route handlers
- `src/components`, `src/hooks`, `src/store`, `src/services`, `src/lib`: shared app code
- `shared`: shared TypeScript types, route constants, and Zod schemas
- `prisma`: Prisma schema and seed data
- `docs`: architecture, API, and database documentation

## Main Features

- Mongolian medical homepage with navy top bar, white navbar, search, service cards, doctors, hospitals, and how-it-works flow
- Doctor and hospital listing/detail pages
- Appointment booking and status management
- Lab result checking
- Consultation request page
- REST chat, notifications, appointments, and video-call request APIs. WebSocket/WebRTC signaling is documented as a future extension for the single Next.js app.
- Floating AI assistant with role-aware tools
- Patient, doctor, and admin dashboards
- JWT auth, RBAC, Zod validation, rate limiting, bcrypt password hashing
