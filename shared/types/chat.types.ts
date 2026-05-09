export type ChatRoomDto = { id: string; patientId: string; doctorId: string; createdAt: string };
export type MessageDto = { id: string; roomId: string; senderId: string; content: string; createdAt: string };

