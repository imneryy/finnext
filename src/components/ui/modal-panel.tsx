"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalPanelProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
};

const sizes = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function ModalPanel({
  title,
  description,
  trigger,
  children,
  size = "lg",
}: ModalPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <span className="inline-flex" onClick={() => dialogRef.current?.showModal()}>
        {trigger}
      </span>
      <dialog
        ref={dialogRef}
        className={cn(
          "fixed inset-0 m-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-black/40",
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--primary)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <form method="dialog">
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)]"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </dialog>
    </>
  );
}

export function ModalButton({ children }: { children: ReactNode }) {
  return <Button>{children}</Button>;
}
