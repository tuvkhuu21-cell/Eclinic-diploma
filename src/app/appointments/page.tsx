import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";

export default function AppointmentsPage() {
  return <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]"><div><h1 className="text-3xl font-bold text-navy">Миний цагууд</h1><div className="mt-6 grid gap-3"><AppointmentCard /><AppointmentCard title="City Med Center - Дотрын үзлэг" status="Хүлээгдэж байна" /></div></div><AppointmentCalendar /></section>;
}

