# MediConnect Realtime

## Why not Socket.io on Vercel

Vercel serverless functions are short lived and should not host a custom long-running Socket.io server. A separate realtime provider is safer for deployment because the Next.js app can stay serverless while realtime traffic goes through a managed websocket service.

MediConnect uses Supabase Realtime for realtime events and WebRTC signaling. Prisma/PostgreSQL remains the main source of truth for users, appointments, chat messages, notifications, and video-call rows.

## Environment variables

Add these variables locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by browser clients for realtime channels. Supabase's new `sb_publishable_...` key works with `supabase-js` `createClient()` here.

`SUPABASE_SERVICE_ROLE_KEY` is server-side only and is used by API/services when broadcasting notifications or doctor status changes after database writes. With Supabase's new key format this value can be an `sb_secret_...` key.

If these variables are missing, the app still loads, but realtime broadcasts/subscriptions are disabled.

## Channels

- `chat-room-{roomId}`
  - event: `new-message`
  - after a message is saved through the existing API, the saved message is broadcast to the active chat room.

- `user-notifications-{userId}`
  - event: `new-notification`
  - used for appointment, payment, and chat notifications.
  - event: `incoming-video-call`
  - used to show the incoming call popup.

- `doctor-status`
  - event: `status-changed`
  - used when a doctor switches Active/Offline so patient pages update without refresh.

- `video-call-{roomId}`
  - events: `call-ringing`, `call-accepted`, `call-declined`, `call-ended`
  - events: `offer`, `answer`, `ice-candidate`
  - WebRTC signaling payloads are broadcast only as metadata. Webcam/audio streams are never stored.

## Chat Test

1. Open one browser as a patient and another as the selected doctor.
2. Open the same chat room from both accounts.
3. Send a message.
4. The message is saved through `/api/chat/messages` and appears in the other browser through Supabase Realtime without REST polling.

## Notification Test

1. Create/pay an appointment or send a chat message.
2. The API saves the notification in the database.
3. The notification is broadcast on `user-notifications-{userId}`.
4. The bell badge updates immediately for the recipient.

## Video Call Test

1. Use a paid ONLINE appointment.
2. Open the patient and doctor accounts in two browsers.
3. Click the video icon from chat or an online appointment card.
4. The app creates/reuses a valid `VideoCall` row, broadcasts `incoming-video-call`, and opens `/video-call/{roomId}`.
5. The receiver accepts the popup.
6. WebRTC offer/answer/ICE candidates are exchanged through `video-call-{roomId}`.

For LAN/IP testing, browsers may require HTTPS for camera and microphone access. `localhost` usually works over HTTP, but another device opening `http://LAN-IP:3000` may block media permissions.

## Vercel Notes

- Do not run a custom websocket server inside Next.js.
- Keep all realtime communication on Supabase Realtime.
- Keep persistent data in the existing Prisma database.
- Add all Supabase env variables in Vercel Project Settings.
- Make sure Supabase Realtime is enabled for the project.
