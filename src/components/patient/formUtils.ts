export type ProfileFormState = {
  lastName?: string; firstName?: string; registerNo?: string; gender?: string; dateOfBirth?: string; bloodType?: string; maritalStatus?: string; phone?: string; email?: string; heightCm?: string; weightKg?: string; bmi?: string; city?: string; district?: string; khoroo?: string; addressDetail?: string; emergencyRelation?: string; emergencyName?: string; emergencyPhone?: string;
};

export type HealthFormState = {
  hasAllergy?: boolean; allergyNote?: string; hasChronicDisease?: boolean; chronicDiseaseNote?: string; hasRegularMedicine?: boolean; regularMedicineNote?: string; hasInjury?: boolean; injuryNote?: string; hasSurgery?: boolean; surgeryNote?: string; smoking?: string; alcohol?: string; movement?: string; food?: string;
};

export function unwrap<T>(response: { data: { data: T } }) {
  return response.data.data;
}

export function toInputDate(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

