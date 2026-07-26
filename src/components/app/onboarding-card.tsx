import Link from "next/link";

import { dismissOnboarding } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function OnboardingCard() {
  return (
    <section className="rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-5 text-[var(--primary)] shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold">Primeiros passos</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6">
            Sua taxonomia inicial ja pode ser criada automaticamente. Comece
            registrando um lancamento ou ajuste categorias antes do primeiro
            orcamento.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
            href="/lancamentos"
          >
            Criar lancamento
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--accent-soft)]"
            href="/categorias"
          >
            Ajustar categorias
          </Link>
          <form action={dismissOnboarding}>
            <Button variant="ghost" type="submit" className="w-full text-[var(--primary)]">
              Pular
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
