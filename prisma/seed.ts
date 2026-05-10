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

  const department = await prisma.department.upsert({
    where: { id: "seed-department-cardiology" },
    update: { hospitalId: hospital.id, name: "Зүрх судасны тасаг", description: "Зүрх судасны үзлэг, ЭКГ, давтан хяналт." },
    create: { id: "seed-department-cardiology", hospitalId: hospital.id, name: "Зүрх судасны тасаг", description: "Зүрх судасны үзлэг, ЭКГ, давтан хяналт." },
  });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: { userId: doctorUser.id, hospitalId: hospital.id, specialty: "Зүрх судас", gender: "Эмэгтэй", bio: "12 жилийн туршлагатай зүрх судасны эмч.", experience: 12, fee: 45000, rating: 4.9, online: true, supportsOnline: true, supportsInPerson: true, verified: true, departments: { connect: { id: department.id } } },
  });
  await seedHospitalAppointmentDoctors(hospital.id, passwordHash);

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
  await seedLabResults(patient.id);
  const room = await prisma.chatRoom.create({ data: { patientId: patient.id, doctorId: doctor.id } });
  await prisma.message.createMany({ data: [{ roomId: room.id, senderId: doctorUser.id, content: "Сайн байна уу, зовиураа дэлгэрэнгүй бичнэ үү." }, { roomId: room.id, senderId: patientUser.id, content: "Цээжээр үе үе өвдөж байна." }] });
  await prisma.notification.create({ data: { userId: patientUser.id, title: "Таны цаг баталгаажлаа", body: `${appointment.scheduledAt.toISOString()} цагт үзлэгтэй.`, type: "APPOINTMENT" } });
  await prisma.aiConversation.upsert({ where: { userId: patientUser.id }, update: {}, create: { userId: patientUser.id } });
  void adminUser;
}

async function seedLabResults(patientId: string) {
  const rows = [
    ["CBC-2026-001", "Цусны ерөнхий шинжилгээ", "Элиторчи лаборатори", "private", "Бэлэн", "Гемоглобин, цагаан эс, ялтас хэвийн байна. Үрэвслийн идэвхжил ажиглагдсангүй.", [["WBC", "6.1", "10^9/L", "4.0-10.0"], ["HGB", "135", "g/L", "120-160"], ["PLT", "250", "10^9/L", "150-400"]]],
    ["URINE-2026-002", "Шээсний шинжилгээ", "MediLab Diagnostic Center", "private", "Бэлэн", "Бөөр, шээс дамжуулах замын халдварын тод шинж илрээгүй. Ус сайн уухыг зөвлөж байна.", [["PRO", "negative", "", "negative"], ["GLU", "negative", "", "negative"], ["pH", "6.0", "", "5.0-8.0"]]],
    ["LIVER-2026-003", "Элэгний үйл ажиллагаа", "Улсын Нэгдүгээр Төв Эмнэлэг", "state", "Бэлэн", "ALAT, ASAT хэвийн хүрээнд. Элэгний ачаалал нэмэгдсэн шинжгүй.", [["ALAT", "24", "U/L", "0-40"], ["ASAT", "22", "U/L", "0-40"], ["GGT", "31", "U/L", "0-55"]]],
    ["HBA1C-2026-004", "Чихрийн шижин HbA1c", "Элиторчи лаборатори", "private", "Бэлэн", "HbA1c хэвийн түвшинд байна. Чихрийн хэрэглээг тогтмол хянахыг зөвлөе.", [["HbA1c", "5.4", "%", "4.0-5.6"], ["GLU", "5.1", "mmol/L", "3.9-6.1"]]],
    ["VITD-2026-005", "Витамин D", "Нарны шинжилгээний төв", "private", "Бэлэн", "Витамин D бага зэрэг дутагдалтай. Эмчтэй зөвлөн нэмэлт хэрэглэх боломжтой.", [["Vitamin D", "24", "ng/mL", "30-100"], ["Calcium", "2.3", "mmol/L", "2.1-2.6"]]],
    ["PCR-2026-006", "COVID/PCR", "Халдвартын лаборатори", "state", "Бэлэн", "SARS-CoV-2 PCR сөрөг. Халдварын лабораторийн нотолгоо илрээгүй.", [["SARS-CoV-2", "Negative", "", "Negative"], ["Ct", "Not detected", "", ""]]],
    ["CHOL-2026-007", "Холестерин", "MediLab Diagnostic Center", "private", "Бэлэн", "Нийт холестерин бага зэрэг өндөр. Дасгал хөдөлгөөн, хооллолтын зөвлөмж дагана уу.", [["Total cholesterol", "5.8", "mmol/L", "<5.2"], ["HDL", "1.3", "mmol/L", ">1.0"], ["LDL", "3.4", "mmol/L", "<3.0"]]],
    ["KIDNEY-2026-008", "Бөөрний үйл ажиллагаа", "Улсын Хоёрдугаар Төв Эмнэлэг", "state", "Бэлэн", "Креатинин хэвийн. Бөөрний шүүх үйл ажиллагаа тогтвортой байна.", [["Creatinine", "72", "umol/L", "45-90"], ["Uric acid", "310", "umol/L", "150-360"]]],
  ] as const;

  for (const [index, row] of rows.entries()) {
    const [code, title, labName, sourceType, status, doctorNote, values] = row;
    const resultValues = values.map(([name, value, unit, range]) => ({ name, value, unit, range }));
    await prisma.labResult.upsert({
      where: { code },
      update: {
        title,
        summary: doctorNote,
        resultJson: {
          labName,
          sourceType,
          status,
          doctorNote,
          values: resultValues,
          fileUrl: `/sample-lab-results/${code}.pdf`,
          fileName: `${title}.pdf`,
        },
        issuedAt: new Date(Date.UTC(2026, 4, 10 - index, 9, 30)),
      },
      create: {
        patientId,
        code,
        title,
        summary: doctorNote,
        resultJson: {
          labName,
          sourceType,
          status,
          doctorNote,
          values: resultValues,
          fileUrl: `/sample-lab-results/${code}.pdf`,
          fileName: `${title}.pdf`,
        },
        issuedAt: new Date(Date.UTC(2026, 4, 10 - index, 9, 30)),
      },
    });
  }
}

main().finally(async () => prisma.$disconnect());

async function seedHospitalAppointmentDoctors(hospitalId: string, passwordHash: string) {
  const doctorsBySpecialty: Record<string, Array<{ firstName: string; lastName: string; experience: number }>> = {
    "Дотор": [
      { lastName: "Бат", firstName: "Эрдэнэ", experience: 11 },
      { lastName: "Сүх", firstName: "Номин", experience: 8 },
      { lastName: "Очир", firstName: "Тэмүүлэн", experience: 6 },
    ],
    "Зүрх судас": [
      { lastName: "Дорж", firstName: "Энхтуяа", experience: 12 },
      { lastName: "Ган", firstName: "Билгүүн", experience: 9 },
      { lastName: "Цогт", firstName: "Солонго", experience: 7 },
    ],
    "Мэдрэл": [
      { lastName: "Ням", firstName: "Ананд", experience: 10 },
      { lastName: "Лхагва", firstName: "Мөнхзул", experience: 8 },
      { lastName: "Болд", firstName: "Идэр", experience: 5 },
    ],
    "Мэс засал": [
      { lastName: "Жаргал", firstName: "Отгон", experience: 14 },
      { lastName: "Баяр", firstName: "Энхжин", experience: 9 },
      { lastName: "Даваа", firstName: "Төгөлдөр", experience: 6 },
    ],
    "Уушги": [
      { lastName: "Пүрэв", firstName: "Ариун", experience: 13 },
      { lastName: "Сайн", firstName: "Хулан", experience: 7 },
      { lastName: "Мөнх", firstName: "Тэнүүн", experience: 5 },
    ],
    "Арьс, харшил": [
      { lastName: "Сэр", firstName: "Болормаа", experience: 10 },
      { lastName: "Алтан", firstName: "Сувд", experience: 8 },
      { lastName: "Түмэн", firstName: "Оргил", experience: 6 },
    ],
    "Бөөр": [
      { lastName: "Эрдэнэ", firstName: "Марал", experience: 12 },
      { lastName: "Бямба", firstName: "Төгс", experience: 9 },
      { lastName: "Наран", firstName: "Амин", experience: 7 },
    ],
    "Гэмтэл": [
      { lastName: "Ган", firstName: "Тулга", experience: 13 },
      { lastName: "Баатар", firstName: "Энхболд", experience: 9 },
      { lastName: "Дэлгэр", firstName: "Халиун", experience: 6 },
    ],
    "Нүд": [
      { lastName: "Очир", firstName: "Саруул", experience: 11 },
      { lastName: "Цэнгэл", firstName: "Уянга", experience: 8 },
      { lastName: "Мягмар", firstName: "Түвшин", experience: 5 },
    ],
    "Хүүхэд": [
      { lastName: "Энх", firstName: "Мөнхзаяа", experience: 14 },
      { lastName: "Баяр", firstName: "Нандин", experience: 9 },
      { lastName: "Лувсан", firstName: "Ивээл", experience: 6 },
    ],
  };

  for (const [specialty, rows] of Object.entries(doctorsBySpecialty)) {
    const department = await prisma.department.upsert({
      where: { id: `seed-department-${slugify(specialty)}` },
      update: { hospitalId, name: `${specialty} тасаг`, description: `${specialty} чиглэлийн үзлэг.` },
      create: { id: `seed-department-${slugify(specialty)}`, hospitalId, name: `${specialty} тасаг`, description: `${specialty} чиглэлийн үзлэг.` },
    });

    for (const [index, item] of rows.entries()) {
      const email = `hospital.${slugify(specialty)}.${index + 1}@mediconnect.demo`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { firstName: item.firstName, lastName: item.lastName, phone: "7500-2026" },
        create: { email, passwordHash, firstName: item.firstName, lastName: item.lastName, phone: "7500-2026", role: Role.DOCTOR },
      });
      const mode = visitMode(index);
      await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: { hospitalId, specialty, gender: index % 2 === 0 ? "Эрэгтэй" : "Эмэгтэй", experience: item.experience, fee: 30000, verified: true, online: mode.supportsOnline, supportsOnline: mode.supportsOnline, supportsInPerson: mode.supportsInPerson, departments: { set: [{ id: department.id }] } },
        create: { userId: user.id, hospitalId, specialty, gender: index % 2 === 0 ? "Эрэгтэй" : "Эмэгтэй", experience: item.experience, fee: 30000, rating: 4.8, verified: true, online: mode.supportsOnline, supportsOnline: mode.supportsOnline, supportsInPerson: mode.supportsInPerson, bio: `MediCare Hospital-ийн ${specialty} чиглэлийн эмч.`, departments: { connect: { id: department.id } } },
      });
    }
  }
}

function visitMode(index: number) {
  if (index % 3 === 0) return { supportsOnline: true, supportsInPerson: true };
  if (index % 3 === 1) return { supportsOnline: true, supportsInPerson: false };
  return { supportsOnline: false, supportsInPerson: true };
}

function slugify(value: string) {
  return encodeURIComponent(value.toLowerCase().trim()).replace(/%/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "demo";
}
