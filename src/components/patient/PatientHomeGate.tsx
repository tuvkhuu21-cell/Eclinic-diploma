"use client";

import { useEffect, useState } from "react";
import { AppointmentFlowModal } from "@/components/appointments/AppointmentFlowModal";
import { FeatureCards } from "@/components/home/FeatureCards";
import { HeroSection } from "@/components/home/HeroSection";
import { HospitalSection } from "@/components/home/HospitalSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PopularDoctors } from "@/components/home/PopularDoctors";
import { SearchSection } from "@/components/home/SearchSection";
import { PatientHome } from "./PatientHome";
import { useAuthStore } from "@/store/auth.store";

export function PatientHomeGate() {
  const { hasHydrated, token, role, user } = useAuthStore();
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("appointment") === "select") setAppointmentOpen(true);
  }, []);

  if (!hasHydrated) {
    return <div className="min-h-[60vh] bg-[#eef7fb]" />;
  }

  if (hasHydrated && token && (role === "PATIENT" || user?.role === "PATIENT")) return <PatientHome />;
  return (
    <>
      <HeroSection />
      <SearchSection />
      <FeatureCards />
      <PopularDoctors />
      <HospitalSection />
      <HowItWorks />
      <AppointmentFlowModal open={appointmentOpen} onClose={() => setAppointmentOpen(false)} />
    </>
  );
}
