"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { DoctorSummary } from "./AppointmentBookingPage";

type DoctorDetail = {
  id: string;
  specialty: string;
  experience: number;
  fee: number;
  rating: number;
  user: { firstName: string; lastName?: string };
};

const paymentOptions = ["QPAY", "Social Pay", "Pass", "Toki"];
const DEFAULT_ONLINE_PRICE = 30000;

export function AppointmentPaymentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("ONLINE");
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [room, setRoom] = useState("");
  const [packageId, setPackageId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [labName, setLabName] = useState("");
  const [price, setPrice] = useState(0);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [method, setMethod] = useState("QPAY");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPrice = Number(params.get("price") || "");
    setMounted(true);
    setDoctorId(params.get("service") || params.get("doctorId") || "");
    setHospitalId(params.get("hospitalId") || "");
    setHospitalName(params.get("hospitalName") || "");
    setSpecialty(params.get("specialty") || "");
    setRoom(params.get("room") || "");
    setPackageId(params.get("packageId") || "");
    setPackageName(params.get("packageName") || "");
    setLabName(params.get("labName") || "");
    setTime(params.get("scheduledAt") || params.get("time") || "");
    setType(params.get("type") || "ONLINE");
    setPrice(queryPrice > 0 ? queryPrice : 0);
  }, []);

  useEffect(() => {
    if (!doctorId || type === "PACKAGE_ORDER") return;
    api.get(`/doctors/${doctorId}`).then((response) => setDoctor(response.data.data as DoctorDetail)).catch(() => setDoctor(null));
  }, [doctorId, type]);

  async function pay() {
    if ((type !== "PACKAGE_ORDER" && (!doctorId || !time)) || (type === "PACKAGE_ORDER" && !packageId)) return;
    setPaying(true);
    setMessage("");
    try {
      await api.post("/payments/mock", { doctorId, hospitalId, hospitalName, specialty, room, packageId, packageName, labName, scheduledAt: time, paymentStatus: "PAID", type, price: displayPrice });
      setMessage("Цаг амжилттай захиалагдлаа");
      setTimeout(() => router.push("/patient/home"), 700);
    } catch (error) {
      const status = typeof error === "object" && error && "response" in error ? (error as { response?: { status?: number } }).response?.status : undefined;
      setMessage(status === 409 ? "Энэ цаг аль хэдийн захиалагдсан байна. Өөр цаг сонгоно уу." : "Төлбөр бүртгэх үед алдаа гарлаа");
    } finally {
      setPaying(false);
    }
  }

  const displayPrice = price > 0 ? price : getOnlinePrice(doctor?.fee);
  const isHospitalVisit = type === "HOSPITAL_VISIT";
  const isPackageOrder = type === "PACKAGE_ORDER";

  if (!mounted) {
    return <section className="bg-slate-50 px-4 py-8" suppressHydrationWarning />;
  }

  return (
    <section className="bg-slate-50 px-4 py-8" suppressHydrationWarning>
      <div className="mx-auto max-w-6xl">
        <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-medical hover:text-sky-600" onClick={() => router.back()}><ChevronLeft size={18} />Буцах</button>
        <h1 className="text-3xl font-bold text-navy">Төлбөр төлөх</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">Төлбөрийн хэрэгсэл</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {paymentOptions.map((option) => (
                <button key={option} type="button" className={`rounded-xl border p-4 text-left font-bold transition ${method === option ? "border-medical bg-cyanSoft text-medical ring-4 ring-sky-100" : "border-sky-100 text-slate-700 hover:bg-cyanSoft"}`} onClick={() => setMethod(option)}>
                  <CreditCard className="mb-3 text-medical" />{option}
                </button>
              ))}
            </div>
            <div className="mt-6 grid min-h-56 place-items-center rounded-2xl border border-dashed border-sky-200 bg-cyanSoft p-6 text-center">
              <div>
                <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-white text-sm font-black tracking-[0.24em] text-medical shadow-sm">QR</div>
                <p className="mt-4 text-sm font-semibold text-slate-600">{method} mock payment</p>
              </div>
            </div>
          </div>
          <aside className="rounded-2xl border border-sky-100 bg-white p-5 shadow-soft">
            {isPackageOrder ? (
              <div className="rounded-xl bg-cyanSoft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-medical">Багц шинжилгээ</p>
                <h2 className="mt-2 text-lg font-bold text-navy">{packageName || "Урьдчилан сэргийлэх багц"}</h2>
                <p className="mt-1 text-sm font-semibold text-medical">{labName || "Лаборатори"}</p>
              </div>
            ) : doctor ? <DoctorSummary doctor={doctor} /> : <p className="rounded-xl bg-cyanSoft p-4 text-sm font-semibold text-medical">Эмчийн мэдээлэл ачаалж байна...</p>}
            <input className="mt-5 h-11 w-full rounded-lg border border-sky-100 px-4 text-sm outline-none focus:border-medical" placeholder="Купон код" />
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              {hospitalName && <div className="rounded-xl bg-cyanSoft p-3 text-sm font-semibold text-medical">{hospitalName}{room ? ` · Өрөө ${room}` : ""}</div>}
              <div className="flex justify-between"><span>{isPackageOrder ? "Багц шинжилгээ" : isHospitalVisit ? "Биечлэн үзүүлэх" : "Онлайн зөвлөгөө"}</span><b>{formatCurrency(displayPrice)}₮</b></div>
              <div className="flex justify-between"><span>Купоны хөнгөлөлт</span><b>0₮</b></div>
              <div className="flex justify-between"><span>Даатгалын хөнгөлөлт</span><b>0₮</b></div>
              <div className="flex justify-between border-t border-sky-100 pt-3 text-lg font-bold text-navy"><span>Төлөх дүн</span><span>{formatCurrency(displayPrice)}₮</span></div>
            </div>
            {message && <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${message.includes("амжилттай") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{message}</p>}
            <Button className="mt-5 w-full" disabled={(type !== "PACKAGE_ORDER" && (!doctorId || !time)) || (type === "PACKAGE_ORDER" && !packageId) || paying} onClick={pay}>{paying ? "Бүртгэж байна..." : "Төлбөр төлсөн"}</Button>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getOnlinePrice(fee?: number) {
  return fee && fee > 0 ? fee : DEFAULT_ONLINE_PRICE;
}

function formatCurrency(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
