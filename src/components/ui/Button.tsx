import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles = {
    primary: "bg-medical text-white hover:bg-sky-600",
    secondary: "bg-navy text-white hover:bg-slate-800",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    outline: "border border-sky-200 bg-white text-navy hover:bg-cyanSoft",
  };
  return <button className={cn("inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition disabled:opacity-60", styles[variant], className)} {...props} />;
}

