import { ChatBox } from "@/components/chat/ChatBox";
import { PatientMedicalInfoPanel } from "@/components/patient/PatientMedicalInfoPanel";

export default function ChatPage() {
  return <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]"><ChatBox /><PatientMedicalInfoPanel /></section>;
}
