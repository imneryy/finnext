import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
};

const tones = {
  neutral: "bg-[var(--surface-muted)] text-[var(--muted)]",
  success: "bg-[var(--primary)] text-white",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
