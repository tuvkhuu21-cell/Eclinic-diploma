"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HeartPulse, History, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthRole, AuthUser, useAuthStore } from "@/store/auth.store";

const roleLabel: Record<AuthRole, string> = {
  PATIENT: "Үйлчлүүлэгчийн профайл",
  DOCTOR: "Эмчийн профайл",
  ADMIN: "Админ профайл",
};

const menuItems = [
  { label: "Эрүүл мэндийн түүх", href: "/dashboard/patient", icon: HeartPulse },
  { label: "Захиалгын түүх", href: "/appointments", icon: History },
  { label: "Тохиргоо", href: "/patient/home/settings", icon: Settings },
];

export function UserAvatarMenu({ user, role, buttonClassName }: { user?: AuthUser; role?: AuthRole; buttonClassName?: string }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRole = user?.role || role || "PATIENT";
  const initials = `${user?.lastName?.[0] || ""}${user?.firstName?.[0] || "Х"}`;
  const fullName = `${user?.lastName || ""} ${user?.firstName || "Хэрэглэгч"}`.trim();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative z-[120]">
      <button
        type="button"
        aria-label="User menu"
        className={cn("grid h-11 w-11 place-items-center rounded-full bg-medical text-sm font-extrabold text-white shadow-sm ring-2 ring-white/70 transition hover:scale-[1.03] hover:bg-sky-600", buttonClassName)}
        onClick={() => setOpen((current) => !current)}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[130] w-[min(330px,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_24px_70px_rgba(14,165,233,0.24)] ring-1 ring-white">
          <Link href="/dashboard/patient?section=profile" onClick={() => setOpen(false)} className="flex items-center gap-3 border-b border-sky-100 bg-gradient-to-br from-cyanSoft to-white px-4 py-4 text-left transition hover:from-sky-50 hover:to-cyanSoft">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-medical font-extrabold text-white shadow-sm">{initials}</div>
            <div className="min-w-0">
              <p className="truncate font-bold text-navy">{fullName}</p>
              <p className="mt-0.5 text-xs font-semibold text-medical">{roleLabel[activeRole]}</p>
            </div>
          </Link>
          <div className="max-h-[min(70vh,560px)] overflow-y-auto py-2">
            {menuItems.map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="mx-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-cyanSoft hover:text-medical">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-50 text-medical"><Icon size={16} /></span>
                {label}
              </Link>
            ))}
            <button type="button" onClick={handleLogout} className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-cyanSoft hover:text-medical">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-50 text-medical"><LogOut size={16} /></span>
              Системээс гарах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
