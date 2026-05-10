import { redirect } from "next/navigation";

export default function NewAppointmentPage() {
  redirect("/?appointment=select");
}
