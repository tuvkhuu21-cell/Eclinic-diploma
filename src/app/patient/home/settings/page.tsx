"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarClock, Globe2, KeyRound, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Message = { type: "success" | "error"; text: string } | null;

export default function PatientSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [language, setLanguage] = useState("mn");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState<Message>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNotifications(localStorage.getItem("patient_settings_notifications") !== "false");
    setAppointmentReminder(localStorage.getItem("patient_settings_reminder") !== "false");
    setLanguage(localStorage.getItem("patient_settings_language") || "mn");
  }, []);

  function saveToggle(key: string, value: boolean, setter: (value: boolean) => void) {
    setter(value);
    localStorage.setItem(key, String(value));
    setMessage({ type: "success", text: "Тохиргоо хадгалагдлаа." });
  }

  function saveLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem("patient_settings_language", value);
    setMessage({ type: "success", text: "Хэлний тохиргоо хадгалагдлаа." });
  }

  function requestPasswordCode() {
    if (!password || password.length < 8) return setMessage({ type: "error", text: "Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой." });
    if (password !== repeatPassword) return setMessage({ type: "error", text: "Нууц үг давталт таарахгүй байна." });
    setPassword("");
    setRepeatPassword("");
    setMessage({ type: "success", text: "Нууц үг солих хүсэлт илгээгдлээ." });
  }

  function requestDeleteAccount() {
    setConfirmDelete(false);
    setMessage({ type: "success", text: "Хаяг устгах хүсэлт бүртгэгдлээ." });
  }

  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-navy">Тохиргоо</h1>
        <p className="mt-2 text-sm text-slate-500">Мэдэгдэл, сануулга, хэл болон нууц үгийн тохиргоо.</p>
        {message && <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-600"}`}>{message.text}</div>}

        <div className="mt-6 grid gap-5">
          <SettingCard icon={<Bell size={22} />} title="Мэдэгдэл авах" description="Цаг захиалга, төлбөр болон системийн мэдэгдэл хүлээн авах.">
            <Toggle checked={notifications} onChange={(value) => saveToggle("patient_settings_notifications", value, setNotifications)} />
          </SettingCard>
          <SettingCard icon={<CalendarClock size={22} />} title="Цаг захиалгын сануулга" description="Захиалсан цаг ойртоход сануулга харуулах.">
            <Toggle checked={appointmentReminder} onChange={(value) => saveToggle("patient_settings_reminder", value, setAppointmentReminder)} />
          </SettingCard>
          <SettingCard icon={<KeyRound size={22} />} title="Нууц үг солих" description="Шинэ нууц үг оруулаад баталгаажуулах код авах.">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input type="password" className="h-11 rounded-lg border border-sky-100 px-4 text-sm outline-none focus:border-medical" placeholder="Шинэ нууц үг" value={password} onChange={(event) => setPassword(event.target.value)} />
              <input type="password" className="h-11 rounded-lg border border-sky-100 px-4 text-sm outline-none focus:border-medical" placeholder="Шинэ нууц үг давтах" value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} />
              <Button onClick={requestPasswordCode}>Нууц үг солих код авах</Button>
            </div>
          </SettingCard>
          <SettingCard icon={<Globe2 size={22} />} title="Хэл солих" description="Одоогоор сонголтыг хадгална, бүрэн орчуулга хийгдээгүй.">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`rounded-full px-4 py-2 text-sm font-bold ${language === "mn" ? "bg-medical text-white" : "bg-cyanSoft text-medical"}`} onClick={() => saveLanguage("mn")}>Монгол</button>
              <button type="button" className={`rounded-full px-4 py-2 text-sm font-bold ${language === "en" ? "bg-medical text-white" : "bg-cyanSoft text-medical"}`} onClick={() => saveLanguage("en")}>English</button>
            </div>
          </SettingCard>
          <SettingCard icon={<Trash2 size={22} />} title="Хаяг устгах" description="Хаяг устгах хүсэлтийг бүртгэнэ.">
            <Button variant="outline" className="border-rose-100 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>Хаяг устгах</Button>
          </SettingCard>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-700/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-navy">Хаяг устгах хүсэлт</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Одоогоор хаягийг шууд устгахгүй. Зөвхөн хүсэлт бүртгэгдэнэ.</p>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-cyanSoft" onClick={() => setConfirmDelete(false)}><X size={17} /></button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Болих</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={requestDeleteAccount}>Хүсэлт илгээх</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SettingCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyanSoft text-medical">{icon}</div>
          <div>
            <h2 className="font-bold text-navy">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="md:min-w-[220px]">{children}</div>
      </div>
    </article>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-medical" : "bg-slate-200"}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}
