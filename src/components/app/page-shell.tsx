import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  title,
  description,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--muted)]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex gap-3">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
