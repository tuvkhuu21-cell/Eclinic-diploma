import { DoctorProfile } from "@/components/doctors/DoctorProfile";

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section className="mx-auto max-w-7xl px-4 py-10"><DoctorProfile id={id} /></section>;
}
