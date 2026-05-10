import { HealthPackageDetailPage } from "@/components/packages/HealthPackageDetailPage";

export default async function PatientHealthCheckupDetailPage({ params }: { params: Promise<{ packageId: string }> }) {
  const { packageId } = await params;
  return <HealthPackageDetailPage packageId={packageId} />;
}
