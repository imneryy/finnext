import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function Dialog({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: DialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-xl",
          className,
        )}
        {...props}
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-[var(--primary)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        ) : null}
        <div className="mt-5">{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </section>
    </div>
  );
}
