import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();
const optionalNumber = z.coerce.number().optional().nullable();

export const patientProfileSchema = z.object({
  lastName: optionalText,
  firstName: optionalText,
  registerNo: optionalText,
  gender: optionalText,
  dateOfBirth: optionalText,
  bloodType: optionalText,
  maritalStatus: optionalText,
  phone: optionalText,
  email: z.string().email().optional().nullable(),
  heightCm: optionalNumber,
  weightKg: optionalNumber,
  bmi: optionalNumber,
  city: optionalText,
  district: optionalText,
  khoroo: optionalText,
  addressDetail: optionalText,
  emergencyRelation: optionalText,
  emergencyName: optionalText,
  emergencyPhone: optionalText,
});

export const patientHealthSchema = z.object({
  hasAllergy: z.boolean().optional().nullable(),
  allergyNote: optionalText,
  hasChronicDisease: z.boolean().optional().nullable(),
  chronicDiseaseNote: optionalText,
  hasRegularMedicine: z.boolean().optional().nullable(),
  regularMedicineNote: optionalText,
  hasInjury: z.boolean().optional().nullable(),
  injuryNote: optionalText,
  hasSurgery: z.boolean().optional().nullable(),
  surgeryNote: optionalText,
  smoking: optionalText,
  alcohol: optionalText,
  movement: optionalText,
  food: optionalText,
});

