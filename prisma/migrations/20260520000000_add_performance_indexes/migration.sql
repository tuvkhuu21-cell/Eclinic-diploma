-- Add indexes for production Supabase/PostgreSQL reads used by chat, notifications, appointments, and video calls.
CREATE INDEX IF NOT EXISTS "Appointment_patientId_scheduledAt_idx" ON "Appointment"("patientId", "scheduledAt");
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_scheduledAt_idx" ON "Appointment"("doctorId", "scheduledAt");
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_scheduledAt_status_idx" ON "Appointment"("doctorId", "scheduledAt", "status");
CREATE INDEX IF NOT EXISTS "Appointment_hospitalId_scheduledAt_idx" ON "Appointment"("hospitalId", "scheduledAt");

CREATE INDEX IF NOT EXISTS "ChatRoom_patientId_idx" ON "ChatRoom"("patientId");
CREATE INDEX IF NOT EXISTS "ChatRoom_doctorId_idx" ON "ChatRoom"("doctorId");
CREATE INDEX IF NOT EXISTS "ChatRoom_patientId_doctorId_idx" ON "ChatRoom"("patientId", "doctorId");

CREATE INDEX IF NOT EXISTS "Message_roomId_createdAt_idx" ON "Message"("roomId", "createdAt");
CREATE INDEX IF NOT EXISTS "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

CREATE INDEX IF NOT EXISTS "VideoCall_patientId_status_startedAt_idx" ON "VideoCall"("patientId", "status", "startedAt");
CREATE INDEX IF NOT EXISTS "VideoCall_doctorId_status_startedAt_idx" ON "VideoCall"("doctorId", "status", "startedAt");
CREATE INDEX IF NOT EXISTS "VideoCall_status_startedAt_idx" ON "VideoCall"("status", "startedAt");
