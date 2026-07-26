import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--primary)]/15",
        className,
      )}
      {...props}
    />
  );
}
