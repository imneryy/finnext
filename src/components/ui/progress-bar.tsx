import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const capped = Math.max(0, Math.min(value, 100));
  const tone =
    value > 100
      ? "bg-[var(--danger)]"
      : value > 80
        ? "bg-[var(--warning)]"
        : "bg-[var(--primary)]";

  return (
    <div className="h-2.5 w-full rounded-full bg-[var(--accent)]/70" aria-label={`${value.toFixed(1)}% usado`}>
      <div className={cn("h-2 rounded-full", tone)} style={{ width: `${capped}%` }} />
    </div>
  );
}
