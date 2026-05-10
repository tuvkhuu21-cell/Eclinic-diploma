import { redirect } from "next/navigation";

export default function LabResultsPage() {
  redirect("/dashboard/patient?section=labs");
}
