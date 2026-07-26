import Link from "next/link";
import { Copy, Download } from "lucide-react";

import { duplicateBudget } from "@/app/(app)/orcamentos/actions";
import { BudgetPlanner, type BudgetAllocation } from "@/app/(app)/orcamentos/budget-planner";
import { PageShell } from "@/components/app/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type OrcamentosPageProps = {
  searchParams: Promise<{
    mes?: string;
    ano?: string;
    success?: string;
    error?: string;
  }>;
};

export default async function OrcamentosPage({ searchParams }: OrcamentosPageProps) {
  const params = await searchParams;
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const mes = Math.min(Math.max(Number(params.mes ?? currentMonth), 1), 12);
  const ano = Number(params.ano ?? currentYear);
  const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);
  const supabase = await createClient();

  const [{ data: receitaBase }, { data: subcategories }, { data: budgets }] =
    await Promise.all([
      supabase
        .from("receitas_base")
        .select("receita_base")
        .eq("mes", mes)
        .eq("ano", ano)
        .eq("ativo", true)
        .maybeSingle(),
      supabase
        .from("subcategorias")
        .select("id, nome, categorias!inner(nome, ordem, ativo)")
        .eq("ativo", true)
        .eq("categorias.ativo", true)
        .order("nome", { ascending: true }),
      supabase
        .from("orcamentos")
        .select("subcategoria_id, valor_planejado, valor_gasto")
        .eq("mes", mes)
        .eq("ano", ano)
        .eq("ativo", true),
    ]);

  const budgetBySubcategory = new Map(
    (budgets ?? []).map((budget) => [budget.subcategoria_id, budget]),
  );
  const allocations: BudgetAllocation[] = (subcategories ?? [])
    .map((subcategory) => {
      const budget = budgetBySubcategory.get(subcategory.id);

      return {
        subcategoria_id: subcategory.id,
        categoria_nome: subcategory.categorias?.nome ?? "Sem categoria",
        subcategoria_nome: subcategory.nome,
        valor_planejado: Number(budget?.valor_planejado ?? 0),
        valor_gasto: Number(budget?.valor_gasto ?? 0),
        incluido: Boolean(budget),
      };
    })
    .sort((a, b) => {
      const categoryCompare = a.categoria_nome.localeCompare(b.categoria_nome, "pt-BR");
      return categoryCompare || a.subcategoria_nome.localeCompare(b.subcategoria_nome, "pt-BR");
    });

  return (
    <PageShell
      title="Orcamentos"
      description="Defina receita-base, distribua limites e acompanhe realizado por competencia."
      actions={
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
          href={`/orcamentos/export?mes=${mes}&ano=${ano}`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </Link>
      }
    >
      {params.success ? <Toast tone="success">{params.success}</Toast> : null}
      {params.error ? <Toast tone="error">{params.error}</Toast> : null}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto_1fr] xl:items-end">
          <form className="grid gap-2 sm:grid-cols-[auto_160px_120px_auto] sm:items-end">
            <div className="sm:pb-2">
              <h2 className="text-sm font-semibold text-[var(--primary)]">Competencia</h2>
              <p className="text-xs text-[var(--muted)]">{monthNames[mes - 1]} / {ano}</p>
            </div>
            <label>
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Mes</span>
              <Select className="h-9" name="mes" defaultValue={String(mes)}>
                {monthNames.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Ano</span>
              <Select className="h-9" name="ano" defaultValue={String(ano)}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </label>
            <Button className="h-9 px-3" type="submit">
              Carregar
            </Button>
          </form>

          <div className="hidden h-12 w-px bg-[var(--border)] xl:block" />

          <form
            action={duplicateBudget}
            className="grid gap-2 sm:grid-cols-[auto_160px_120px_auto] sm:items-end"
          >
            <input type="hidden" name="mes_origem" value={mes} />
            <input type="hidden" name="ano_origem" value={ano} />
            <div className="sm:pb-2">
              <h2 className="text-sm font-semibold text-[var(--primary)]">Duplicar</h2>
              <p className="text-xs text-[var(--muted)]">Copiar para outro mes</p>
            </div>
            <label>
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Destino</span>
              <Select
                className="h-9"
                name="mes_destino"
                defaultValue={String(mes === 12 ? 1 : mes + 1)}
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">Ano</span>
              <Input
                className="h-9"
                name="ano_destino"
                type="number"
                min="2020"
                defaultValue={mes === 12 ? ano + 1 : ano}
              />
            </label>
            <Button className="h-9 px-3" type="submit" variant="secondary">
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicar
            </Button>
          </form>
        </div>
      </section>

      {allocations.length === 0 ? (
        <EmptyState
          title="Nenhuma subcategoria ativa"
          description="Crie categorias e subcategorias ativas antes de planejar o orcamento mensal."
        />
      ) : (
        <BudgetPlanner
          mes={mes}
          ano={ano}
          receitaBase={Number(receitaBase?.receita_base ?? 0)}
          allocations={allocations}
        />
      )}
    </PageShell>
  );
}
