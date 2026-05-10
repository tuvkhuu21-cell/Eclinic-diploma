"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FlaskConical, MessageCircle, Search, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PublicAuthModal } from "@/components/auth/PublicAuthModal";
import { NotificationBox } from "@/components/notifications/NotificationBox";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { UserAvatarMenu } from "./UserAvatarMenu";

export function Navbar() {
  const { token, user, role, hasHydrated } = useAuthStore();
  const pathname = usePathname();
  const { items, hydrate: hydrateCart, hasHydrated: cartHasHydrated, removeItem } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const activeRole = user?.role || role;
  const isLoggedIn = Boolean(token && activeRole);
  const isPatient = activeRole === "PATIENT";
  const shouldHidePatientHomeHeader = hasHydrated && pathname === "/" && isLoggedIn && isPatient;
  const shouldHideDoctorAuthHeader = pathname === "/doctor/login" || pathname === "/doctor/register";

  useEffect(() => {
    if (hasHydrated && isLoggedIn && isPatient && !cartHasHydrated) hydrateCart();
  }, [cartHasHydrated, hasHydrated, hydrateCart, isLoggedIn, isPatient]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!cartRef.current?.contains(event.target as Node)) setCartOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  if (!hasHydrated) return null;

  if (shouldHidePatientHomeHeader || shouldHideDoctorAuthHeader) return null;

  if (hasHydrated && isLoggedIn && isPatient) {
    return (
      <header className="sticky top-0 z-40 rounded-b-[30px] bg-[#0b5b86] text-white shadow-[0_18px_52px_rgba(11,91,134,0.20)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/logo/mediconnect.svg" alt="MediConnect" width={180} height={44} className="rounded-xl bg-white px-2 py-1 shadow-sm" priority />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold text-white md:flex">
            <Link href="/" className="transition hover:text-sky-100">Нүүр</Link>
            <Link href="/appointments" className="transition hover:text-sky-100">Захиалга</Link>
          </nav>
          <div className="ml-auto hidden min-w-64 items-center rounded-full bg-white px-4 py-3 text-slate-600 shadow-[0_14px_32px_rgba(8,47,73,0.14)] md:flex">
            <Search size={17} className="text-[#0b6fa4]" />
            <input className="ml-2 w-full bg-transparent text-sm outline-none" placeholder="Эмч, эмнэлэг хайх" />
          </div>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <Link href="/chat" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white text-[#0b5b86] shadow-sm transition hover:bg-sky-50">
              <MessageCircle size={19} />
            </Link>
            <div ref={cartRef} className="relative">
              <button type="button" aria-label="Package cart" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white text-[#0b5b86] shadow-sm transition hover:bg-sky-50" onClick={() => setCartOpen((open) => !open)}>
                <ShoppingCart size={19} />
                {items.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">{items.length}</span>}
              </button>
              {cartOpen && (
                <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-[390px] rounded-3xl border border-sky-100 bg-white p-4 text-slate-700 shadow-[0_24px_70px_rgba(11,91,134,0.22)]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-bold text-navy">Миний сагс({items.length})</h2>
                    <button type="button" aria-label="Close cart" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setCartOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {items.length === 0 && <p className="rounded-lg bg-cyanSoft p-4 text-sm font-semibold text-medical">Сагс хоосон байна.</p>}
                    {items.map((item) => (
                      <article key={item.id} className="flex gap-3 rounded-xl border border-sky-100 p-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cyanSoft text-medical"><FlaskConical size={24} /></div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-navy">{item.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description || "Багц шинжилгээ"}</p>
                          <p className="mt-2 text-sm font-bold text-medical">{item.price}</p>
                        </div>
                        <button type="button" aria-label={`Remove ${item.name}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => removeItem(item.id)}>
                          <X size={15} />
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <NotificationBox variant="dropdown" buttonClassName="h-11 w-11 border-white/20 bg-white text-[#0b5b86] shadow-sm hover:bg-sky-50" />
            <UserAvatarMenu user={user} role={activeRole} buttonClassName="h-11 w-11 bg-white text-[#0b5b86] shadow-sm hover:bg-sky-50" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        {!(hasHydrated && isLoggedIn) && (
          <div className="bg-slate-900 text-xs font-semibold text-slate-200">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
              <div className="flex items-center gap-5">
                <Link href="/doctor/login" className="hover:text-white">Эмч</Link>
                <Link href="/hospitals" className="hover:text-white">Байгууллага</Link>
                <Link href="/dashboard/patient?section=labs" className="hover:text-white">Шинжилгээний хариу</Link>
              </div>
              <div className="hidden items-center gap-5 md:flex">
                <button type="button" className="hover:text-white">Хэл сонгох</button>
                <Link href="/settings" className="hover:text-white">Бидний тухай</Link>
                <Link href="/settings" className="hover:text-white">Нууцлалын бодлого</Link>
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image src="/logo/mediconnect.svg" alt="MediConnect" width={180} height={44} priority />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
            {hasHydrated && isLoggedIn ? (
              <>
                <Link href="/" className="hover:text-medical">Нүүр</Link>
                <Link href="/appointments" className="hover:text-medical">Захиалга</Link>
              </>
            ) : (
              <>
                <Link href="/" className="hover:text-medical">Нүүр</Link>
                <Link href="/doctors" className="hover:text-medical">Эмчийн нийтлэл</Link>
              </>
            )}
          </nav>
          <div className="hidden min-w-52 items-center rounded-xl border border-slate-200 px-3 py-2 md:flex">
            <Search size={16} className="text-medical" />
            <input className="ml-2 w-full text-sm outline-none" placeholder="Хайх" />
          </div>
          {hasHydrated && isLoggedIn && activeRole ? (
            <div className="ml-auto flex items-center gap-3 md:ml-0">
              <Link href="/chat" className="grid h-11 w-11 place-items-center rounded-full border border-sky-100 bg-white text-navy shadow-sm transition hover:bg-cyanSoft">
                <MessageCircle size={19} />
              </Link>
              <NotificationBox variant="dropdown" />
              <UserAvatarMenu user={user} role={activeRole} />
            </div>
          ) : (
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <Button type="button" variant="outline" onClick={() => setAuthMode("login")}>Нэвтрэх</Button>
              <Button type="button" onClick={() => setAuthMode("register")}>Бүртгүүлэх</Button>
            </div>
          )}
        </div>
      </header>
      <PublicAuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} />
    </>
  );
}
