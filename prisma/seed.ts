import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [patientUser, doctorUser, adminUser] = await Promise.all([
    prisma.user.upsert({ where: { email: "patient@mediconnect.mn" }, update: {}, create: { email: "patient@mediconnect.mn", passwordHash, firstName: "Саруул", lastName: "Наран", role: Role.PATIENT, patientProfile: { create: { registerNo: "УА00262601" } } } }),
    prisma.user.upsert({ where: { email: "doctor@mediconnect.mn" }, update: {}, create: { email: "doctor@mediconnect.mn", passwordHash, firstName: "Энхтуяа", lastName: "Дорж", role: Role.DOCTOR } }),
    prisma.user.upsert({ where: { email: "admin@mediconnect.mn" }, update: {}, create: { email: "admin@mediconnect.mn", passwordHash, firstName: "Админ", lastName: "MediConnect", role: Role.ADMIN } }),
  ]);

  const hospital = await prisma.hospital.upsert({
    where: { id: "seed-hospital-medicare" },
    update: {},
    create: { id: "seed-hospital-medicare", name: "MediCare Hospital", type: "Нэгдсэн эмнэлэг", district: "Сүхбаатар", address: "Улаанбаатар хот, Сүхбаатар дүүрэг", latitude: 47.9186, longitude: 106.9176, rating: 4.8, description: "Цахим цаг, оношилгоо, онлайн зөвлөгөөний нэгдсэн үйлчилгээтэй эмнэлэг." },
  });

  const department = await prisma.department.create({ data: { hospitalId: hospital.id, name: "Зүрх судасны тасаг", description: "Зүрх судасны үзлэг, ЭКГ, давтан хяналт." } });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: { userId: doctorUser.id, hospitalId: hospital.id, specialty: "Зүрх судас", bio: "12 жилийн туршлагатай зүрх судасны эмч.", experience: 12, fee: 45000, rating: 4.9, online: true, verified: true, departments: { connect: { id: department.id } } },
  });

  const patient = await prisma.patientProfile.update({
    where: { userId: patientUser.id },
    data: {
      gender: "Эмэгтэй",
      dateOfBirth: new Date("1994-04-12T00:00:00.000Z"),
      bloodType: "B+",
      maritalStatus: "Гэрлэсэн",
      heightCm: 168,
      weightKg: 62,
      bmi: 22,
      city: "Улаанбаатар",
      district: "Сүхбаатар",
      khoroo: "1-р хороо",
      addressDetail: "Энхтайваны өргөн чөлөө",
      emergencyRelation: "Гэр бүлийн хүн",
      emergencyName: "Н. Бат",
      emergencyPhone: "99112233",
      hasAllergy: true,
      allergyNote: "Тоосны харшил",
      hasChronicDisease: false,
      chronicDiseaseNote: "",
      hasRegularMedicine: false,
      regularMedicineNote: "",
      hasInjury: false,
      injuryNote: "",
      hasSurgery: false,
      surgeryNote: "",
      smoking: "Татдаггүй",
      alcohol: "Сард 3-аас бага удаа уудаг",
      movement: "Дунд зэргийн идэвхтэй",
      food: "Ердийн",
    },
  });

  const appointment = await prisma.appointment.create({ data: { patientId: patient.id, doctorId: doctor.id, hospitalId: hospital.id, scheduledAt: new Date("2026-05-10T11:30:00.000Z"), reason: "Цээжээр өвдөх", status: "CONFIRMED" } });
  await prisma.labResult.upsert({ where: { code: "CBC-2026-001" }, update: {}, create: { patientId: patient.id, code: "CBC-2026-001", title: "Цусны дэлгэрэнгүй шинжилгээ", resultJson: { hemoglobin: "135 g/L", wbc: "6.1", platelets: "250" }, summary: "Үндсэн үзүүлэлтүүд хэвийн хүрээнд байна." } });
  const room = await prisma.chatRoom.create({ data: { patientId: patient.id, doctorId: doctor.id } });
  await prisma.message.createMany({ data: [{ roomId: room.id, senderId: doctorUser.id, content: "Сайн байна уу, зовиураа дэлгэрэнгүй бичнэ үү." }, { roomId: room.id, senderId: patientUser.id, content: "Цээжээр үе үе өвдөж байна." }] });
  await prisma.notification.create({ data: { userId: patientUser.id, title: "Таны цаг баталгаажлаа", body: `${appointment.scheduledAt.toISOString()} цагт үзлэгтэй.`, type: "APPOINTMENT" } });
  await prisma.aiConversation.upsert({ where: { userId: patientUser.id }, update: {}, create: { userId: patientUser.id } });
  void adminUser;
}

main().finally(async () => prisma.$disconnect());
