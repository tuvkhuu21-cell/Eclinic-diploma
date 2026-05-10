"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, ChevronDown, Info, MapPin, Phone, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { healthPackages, priceNumber } from "./packageData";

type SortDirection = "desc" | "asc" | null;

export function HealthPackagePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(healthPackages[0].id);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const { hydrate, addItem, hasItem } = useCartStore();
  const selectedPackage = healthPackages.find((item) => item.id === selectedId) || healthPackages[0];
  const sortedPackages = useMemo(() => {
    if (!sortDirection) return healthPackages;
    return [...healthPackages].sort((a, b) => sortDirection === "asc" ? priceNumber(a.price) - priceNumber(b.price) : priceNumber(b.price) - priceNumber(a.price));
  }, [sortDirection]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-navy">Урьдчилан сэргийлэх багц шинжилгээнүүд</h1>
          <div className="relative">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-sky-100 bg-white px-4 text-sm font-bold text-medical shadow-sm hover:bg-cyanSoft" onClick={() => setSortOpen((open) => !open)}>
              Эрэмбэлэх
              <ChevronDown size={16} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-sky-100 bg-white p-3 text-sm font-semibold text-medical shadow-soft">
                <div className="group relative rounded-lg px-3 py-2 hover:bg-cyanSoft">
                  Үнээр
                  <div className="mt-2 grid gap-1 group-hover:grid md:absolute md:right-full md:top-0 md:mt-0 md:mr-2 md:hidden md:w-36 md:rounded-xl md:border md:border-sky-100 md:bg-white md:p-2 md:shadow-soft">
                    <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-cyanSoft" onClick={() => { setSortDirection("desc"); setSortOpen(false); }}>Ихээс бага</button>
                    <button type="button" className="rounded-lg px-3 py-2 text-left hover:bg-cyanSoft" onClick={() => { setSortDirection("asc"); setSortOpen(false); }}>Багаас их</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {sortedPackages.map((item) => {
              const selected = item.id === selectedId;
              const inCart = hasItem(item.id);
              return (
                <article key={item.id} className={cn("rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-soft", selected ? "border-medical ring-4 ring-sky-100" : "border-sky-100")} onClick={() => setSelectedId(item.id)}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-cyanSoft text-medical">
                      <span className="text-4xl" aria-hidden="true">{item.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-navy">{item.name}</h2>
                        {selected && <span className="inline-flex items-center gap-1 rounded-full bg-cyanSoft px-2 py-1 text-xs font-bold text-medical"><CheckCircle2 size={13} /> Сонгосон</span>}
                      </div>
                      <p className="mt-1 text-sm font-bold text-medical">{item.lab.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <span className="text-sm text-slate-400 line-through">{item.oldPrice}</span>
                        <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">{item.discount}</span>
                        <span className="text-xl font-bold text-medical">{item.price}</span>
                        <button
                          type="button"
                          className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-100 bg-white text-medical shadow-sm hover:bg-cyanSoft"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/patient/home/health-checkup/${item.id}`);
                          }}
                          aria-label={`${item.name} дэлгэрэнгүй`}
                        >
                          <Info size={16} />
                          <span className="pointer-events-none absolute bottom-10 left-1/2 z-20 hidden w-72 -translate-x-1/2 rounded-xl border border-sky-100 bg-white p-3 text-left text-xs font-semibold leading-5 text-slate-600 shadow-soft group-hover:block">
                            <b className="block text-medical">Дэлгэрэнгүй</b>
                            {item.summary}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button className="h-10 px-4" onClick={(event) => { event.stopPropagation(); router.push(packagePaymentUrl(item)); }}>Захиалах</Button>
                      <Button
                        variant="outline"
                        className="h-10 px-4"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(item.id);
                          addItem({ id: item.id, name: item.name, price: item.price, description: item.description });
                        }}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {inCart ? "Сагслагдсан" : "Сагслах"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-bold text-navy">Шинжилгээ өгөх лаборатори</h2>
              <div className="mt-5 grid gap-4 text-sm text-slate-600">
                <p className="flex gap-3"><Building2 className="shrink-0 text-medical" size={18} /><span><b>Лаборатори:</b> {selectedPackage.lab.name}</span></p>
                <p><b>Цаг:</b> {selectedPackage.lab.hours}</p>
                <p className="flex gap-3"><MapPin className="shrink-0 text-medical" size={18} /><span><b>Хаяг:</b> {selectedPackage.lab.address}</span></p>
                <p className="flex gap-3"><Phone className="shrink-0 text-medical" size={18} /><span><b>Утас:</b> {selectedPackage.lab.phone}</span></p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function packagePaymentUrl(item: typeof healthPackages[number]) {
  const params = new URLSearchParams({
    type: "PACKAGE_ORDER",
    packageId: item.id,
    packageName: item.name,
    labName: item.lab.name,
    price: String(priceNumber(item.price)),
    scheduledAt: new Date().toISOString(),
  });
  return `/patient/home/appointment/payment?${params.toString()}`;
}
