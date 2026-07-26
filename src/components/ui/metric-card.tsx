import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: ReactNode;
};

const tones = {
  default: "text-[var(--primary)]",
  success: "text-[var(--primary)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "default",
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
          {label}
        </p>
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--primary)]">
            {icon}
          </span>
        ) : null}
      </div>
      <p className={cn("mt-2 text-2xl font-bold", tones[tone])}>{value}</p>
      {detail ? <p className="mt-1 text-xs text-[var(--muted)]">{detail}</p> : null}
    </div>
  );
}
