"use client";

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
  if (hasHydrated && token && (role === "PATIENT" || user?.role === "PATIENT")) return <PatientHome />;
  return (
    <>
      <HeroSection />
      <SearchSection />
      <FeatureCards />
      <PopularDoctors />
      <HospitalSection />
      <HowItWorks />
    </>
  );
}

