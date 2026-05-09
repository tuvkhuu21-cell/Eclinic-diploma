# MediConnect API

Base URL: `http://localhost:3000/api`

## Auth

- `POST /auth/register`: create user account.
- `POST /auth/login`: login and receive JWT.
- `GET /auth/me`: current JWT user.

## Users

- `GET /users/me`: profile for current user.
- `PATCH /users/me`: update current user.
- `GET /users`: admin-only user list.

## Doctors

- `GET /doctors`: list verified doctors, supports `q` and `specialty`.
- `GET /doctors/:id`: doctor profile with hospital, departments, and appointments.

## Hospitals

- `GET /hospitals`: list hospitals, supports `q` and `district`.
- `GET /hospitals/:id`: hospital profile with departments and doctors.

## Appointments

- `GET /appointments`: patient/doctor appointments.
- `POST /appointments`: patient books an appointment.
- `PATCH /appointments/:id/status`: doctor/admin updates status.

## Lab Results

- `POST /lab-results/lookup`: lookup a lab result by code.

## Consultations

- `GET /consultations`: list current user consultations.
- `POST /consultations`: patient creates a consultation request.

## Chat

- `GET /chat/rooms`: current user chat rooms.
- `GET /chat/rooms/:roomId/messages`: messages in a room.
- `POST /chat/messages`: send a message and emit `chat:message`.

## Notifications

- `GET /notifications`: current user notifications.
- `POST /notifications`: admin creates notification.
- `PATCH /notifications/:id/read`: mark notification as read.

## Video Calls

- `POST /video-calls/request`: patient requests a video call.
- `GET /video-calls/:roomId`: video call metadata.

## AI

- `GET /ai/tools`: role-allowed AI tools.
- `POST /ai/ask`: ask the assistant or invoke an allowed tool.

## Admin

- `GET /admin/stats`: admin dashboard counts.

## Realtime Note

The backend is now an API-only Next.js App Router service. Chat, notifications, appointments, and video-call requests remain available through REST APIs. WebSocket/WebRTC signaling can be added later as a dedicated realtime extension.
