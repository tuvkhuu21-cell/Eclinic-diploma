export function AppointmentCalendar() {
  return <div className="grid grid-cols-7 gap-2 rounded-lg bg-white p-4 shadow-soft">{Array.from({ length: 28 }, (_, i) => <button key={i} className="aspect-square rounded-lg border border-slate-100 text-sm font-semibold hover:bg-cyanSoft">{i + 1}</button>)}</div>;
}

