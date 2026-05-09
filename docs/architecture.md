# MediConnect Architecture

MediConnect is split into four main layers:

1. Frontend: Next.js App Router renders the Mongolian medical platform UI, dashboards, appointments, chat, notifications, video room screens, and the floating AI assistant.
2. API: Next.js App Router route handlers expose REST endpoints under `/api/*` in the same app on port `3000`, handling JWT authentication, RBAC, and Zod validation.
3. Database: PostgreSQL stores users, role profiles, hospitals, departments, appointments, consultations, lab results, chat, notifications, video calls, and AI conversations through Prisma.
4. Shared: Common TypeScript DTOs, route constants, role constants, and validation schemas.

## Runtime Flow

- Users authenticate through `/api/auth/login` or `/api/auth/register`.
- JWT tokens protect dashboard, appointment, chat, notification, video, AI, and admin endpoints.
- Patients book appointments and request consultations or video calls.
- Doctors and admins update appointment status.
- Chat, notifications, appointment status, and video-call requests are available through REST APIs. WebSocket/WebRTC signaling is a future extension for the single Next.js app.
- The AI assistant exposes role-aware tools so patients, doctors, and admins only access allowed workflows.

## Security

- Passwords use bcrypt hashing.
- JWT payload includes `userId` and role.
- RBAC middleware protects doctor/admin/patient-specific routes.
- Zod validates request bodies.
- Prisma parameterized query APIs protect against SQL injection.
- Environment variables provide secrets and database connection strings.
- Next.js route handlers run in the Node.js runtime with environment-based JWT secrets and Prisma-backed access control.
