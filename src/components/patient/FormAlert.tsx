export function FormAlert({ type, text }: { type: "success" | "error"; text: string }) {
  const styles = type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-rose-100 bg-rose-50 text-rose-800";
  return <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${styles}`}>{text}</div>;
}

