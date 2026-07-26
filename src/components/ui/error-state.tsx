type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({
  title = "Algo saiu do fluxo esperado",
  message,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-5 py-4 text-[var(--danger)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}
