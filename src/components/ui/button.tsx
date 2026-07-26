import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] hover:bg-[var(--accent-soft)]",
  ghost:
    "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)]",
  danger: "bg-[var(--danger)] text-white hover:bg-red-600",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&>svg]:shrink-0",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
