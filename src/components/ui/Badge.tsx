import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-cyanSoft px-3 py-1 text-xs font-semibold text-sky-700", className)} {...props} />;
}

