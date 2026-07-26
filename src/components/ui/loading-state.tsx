type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Carregando..." }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-40 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]"
      role="status"
    >
      {label}
    </div>
  );
}
