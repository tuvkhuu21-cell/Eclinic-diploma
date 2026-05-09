export const aiTools = [
  { name: "recommendDoctorBySymptom", roles: ["PATIENT", "DOCTOR", "ADMIN"], description: "Suggests a specialty and doctor based on symptoms." },
  { name: "searchDoctors", roles: ["PATIENT", "DOCTOR", "ADMIN"], description: "Searches verified doctors." },
  { name: "searchHospitals", roles: ["PATIENT", "DOCTOR", "ADMIN"], description: "Searches hospitals by service or district." },
  { name: "helpFillAppointmentForm", roles: ["PATIENT"], description: "Prepares appointment form fields." },
  { name: "explainLabResult", roles: ["PATIENT", "DOCTOR"], description: "Explains lab result values in plain Mongolian." },
  { name: "notifyAppointmentStatus", roles: ["DOCTOR", "ADMIN"], description: "Sends appointment status notification." },
] as const;

export function allowedToolsForRole(role: string) {
  return aiTools.filter((tool) => (tool.roles as readonly string[]).includes(role));
}

