import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ToastProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "success" | "error" | "info";
};

const tones = {
  success: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--primary)]",
  error: "border-[var(--danger)]/25 bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
};

export function Toast({ tone = "info", className, ...props }: ToastProps) {
  return (
    <div
      role="status"
      className={cn("rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm", tones[tone], className)}
      {...props}
    />
  );
}
