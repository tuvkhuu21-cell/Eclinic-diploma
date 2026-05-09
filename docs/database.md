# MediConnect Database

MediConnect uses PostgreSQL with Prisma. The connection string is read from `DATABASE_URL`.

## Entities

- `User`: authentication and core identity.
- `PatientProfile`: patient-specific medical profile.
- `DoctorProfile`: doctor specialty, fee, verification, rating, hospital relation.
- `Hospital`: healthcare organization with latitude and longitude.
- `Department`: hospital department, optionally connected to doctors.
- `Appointment`: booking between patient, doctor, and optionally hospital.
- `Consultation`: online medical consultation request.
- `LabResult`: laboratory result linked to a patient and lookup code.
- `ChatRoom`: doctor-patient room.
- `Message`: chat messages.
- `Notification`: user notifications.
- `VideoCall`: room metadata for video consultation workflow.
- `AiConversation`: AI assistant conversation per user.
- `AiMessage`: user, assistant, and tool messages.

## Relationships

- A `User` can have one `PatientProfile` or one `DoctorProfile`.
- A `Hospital` has many `Department` records and many `DoctorProfile` records.
- `Appointment`, `Consultation`, `ChatRoom`, and `VideoCall` connect patients and doctors.
- `LabResult` belongs to a patient.
- `Notification` belongs to a user.
- `AiConversation` belongs to one user and has many `AiMessage` rows.

## Migration

Run migrations after configuring `.env`:

```bash
npm run prisma:migrate
npm run prisma:seed
```
