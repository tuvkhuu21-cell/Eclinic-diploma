import { HospitalProfile } from "@/components/hospitals/HospitalProfile";

export default async function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section className="mx-auto max-w-7xl px-4 py-10"><HospitalProfile id={id} /></section>;
}
