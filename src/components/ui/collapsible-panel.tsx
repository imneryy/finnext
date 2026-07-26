import type { ReactNode } from "react";

type CollapsiblePanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsiblePanel({
  title,
  description,
  children,
  defaultOpen = false,
}: CollapsiblePanelProps) {
  return (
    <details
      className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-[var(--primary)]">{title}</span>
          {description ? (
            <span className="block text-xs text-[var(--muted)]">{description}</span>
          ) : null}
        </span>
        <span className="text-sm font-semibold text-[var(--primary)] group-open:hidden">
          Abrir
        </span>
        <span className="hidden text-sm font-semibold text-[var(--muted)] group-open:inline">
          Fechar
        </span>
      </summary>
      <div className="border-t border-[var(--border)] p-4">{children}</div>
    </details>
  );
}
