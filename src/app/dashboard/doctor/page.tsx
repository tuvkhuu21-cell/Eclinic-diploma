import { Card } from "@/components/ui/Card";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { PatientMedicalInfoPanel } from "@/components/patient/PatientMedicalInfoPanel";

export default function DoctorDashboardPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold text-navy">Эмчийн самбар</h1><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]"><div className="grid gap-3"><AppointmentCard title="Өвчтөн: Н. Саруул" status="Ирсэн" /><AppointmentCard title="Өвчтөн: Б. Мөнх" status="Видео хүсэлт" /><Card className="p-5"><p className="text-sm text-slate-500">Өнөөдрийн зөвлөгөө</p><p className="mt-2 text-3xl font-bold text-navy">8</p><p className="mt-3 text-sm text-slate-600">Чат, мэдэгдэл REST API-р шинэчлэгдэнэ.</p></Card></div><PatientMedicalInfoPanel /></div></section>;
}
