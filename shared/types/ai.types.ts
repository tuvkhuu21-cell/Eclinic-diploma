export type AiToolName = "recommendDoctorBySymptom" | "searchDoctors" | "searchHospitals" | "helpFillAppointmentForm" | "explainLabResult" | "notifyAppointmentStatus";
export type AiTool = { name: AiToolName; description: string; roles: string[] };

