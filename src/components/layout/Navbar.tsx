"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search, UserCircle } from "lucide-react";
import { navItems } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { AuthRole, useAuthStore } from "@/store/auth.store";

const dashboardByRole: Record<AuthRole, string> = {
  PATIENT: "/dashboard/patient",
  DOCTOR: "/dashboard/doctor",
  ADMIN: "/dashboard/admin",
};

const roleLabel: Record<AuthRole, string> = {
  PATIENT: "Өвчтөн",
  DOCTOR: "Эмч",
  ADMIN: "Админ",
};

export function Navbar() {
  const { token, user, role, hasHydrated, logout } = useAuthStore();
  const pathname = usePathname();
  const activeRole = user?.role || role;
  const isLoggedIn = Boolean(token && activeRole);
  if (hasHydrated && pathname === "/" && isLoggedIn && activeRole === "PATIENT") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image src="/logo/mediconnect.svg" alt="MediConnect" width={180} height={44} priority />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold text-slate-700 lg:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className="hover:text-medical">{item.label}</Link>)}
        </nav>
        <div className="hidden min-w-52 items-center rounded-lg border border-slate-200 px-3 py-2 md:flex">
          <Search size={16} className="text-slate-400" /><input className="ml-2 w-full text-sm outline-none" placeholder="Эмч, эмнэлэг хайх" />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {hasHydrated && isLoggedIn && activeRole ? (
            <>
              <Link href={dashboardByRole[activeRole]} className="inline-flex h-11 items-center gap-2 rounded-lg border border-sky-100 bg-cyanSoft px-4 text-sm font-semibold text-navy">
                <UserCircle size={17} />
                <span>{user?.firstName || roleLabel[activeRole]}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-medical">{roleLabel[activeRole]}</span>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Гарах
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login"><Button variant="outline">Нэвтрэх</Button></Link>
              <Link href="/auth/register"><Button>Бүртгүүлэх</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
