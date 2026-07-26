import Link from "next/link";
import { Download } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  formatVariation,
  getReportData,
  normalizeReportFilters,
  variation,
} from "@/lib/reports";

type RelatoriosPageProps = {
  searchParams: Promise<{
    data_inicio?: string;
    data_fim?: string;
    tipo?: string;
  }>;
};

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
  const params = await searchParams;
  const filters = normalizeReportFilters(params);
  const { data, error } = await getReportData(filters);
  const exportHref = `/relatorios/export?data_inicio=${filters.dataInicio}&data_fim=${filters.dataFim}&tipo=${filters.tipo}`;

  return (
    <PageShell
      title="Relatorios"
      description="Analise periodos, categorias, tendencia e orcamento versus realizado."
      actions={
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
          href={exportHref}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV
        </Link>
      }
    >
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--primary)]">Filtros</h2>
        <form className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Input name="data_inicio" type="date" defaultValue={filters.dataInicio} />
          <Input name="data_fim" type="date" defaultValue={filters.dataFim} />
          <Select name="tipo" defaultValue={filters.tipo}>
            <option value="resumo">Resumo</option>
            <option value="categorias">Categorias</option>
            <option value="tendencia">Tendencia</option>
            <option value="orcamento">Orcamento vs realizado</option>
          </Select>
          <Button type="submit">Aplicar</Button>
        </form>
      </section>

      {error || !data ? (
        <Toast tone="error">{error ?? "Nao foi possivel carregar o relatorio."}</Toast>
      ) : null}

      {data && filters.tipo === "resumo" ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Receitas"
            value={formatCurrency(data.summary.receitas)}
            detail={formatVariation(
              variation(data.summary.receitas, data.summary.previousReceitas),
            )}
          />
          <MetricCard
            label="Despesas"
            value={formatCurrency(data.summary.despesas)}
            detail={formatVariation(
              variation(data.summary.despesas, data.summary.previousDespesas),
            )}
          />
          <MetricCard
            label="Saldo liquido"
            value={formatCurrency(data.summary.saldo)}
            detail={formatVariation(variation(data.summary.saldo, data.summary.previousSaldo))}
          />
          <MetricCard
            label="Uso do orcamento"
            value={`${data.summary.usoOrcamento.toFixed(1)}%`}
            detail={`${formatCurrency(data.summary.totalGastoOrcamento)} de ${formatCurrency(data.summary.totalPlanejado)}`}
          />
        </section>
      ) : null}

      {data && filters.tipo === "categorias" ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--primary)]">Despesas por categoria</h2>
          {data.categories.length === 0 ? (
            <EmptyState title="Sem despesas" description="Nao ha despesas no periodo selecionado." />
          ) : (
            <div className="mt-4 divide-y divide-[var(--border)]">
              {data.categories.map((row) => (
                <div key={row.categoria} className="flex justify-between gap-4 py-3">
                  <span className="text-sm text-[var(--foreground)]">{row.categoria}</span>
                  <strong className="text-sm text-[var(--primary)]">{formatCurrency(row.total)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {data && filters.tipo === "tendencia" ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--primary)]">Evolucao mensal</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.trend.map((row) => (
              <div key={row.mes} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-sm font-semibold text-[var(--primary)]">{row.mes}</p>
                <p className="mt-2 text-sm text-[var(--primary)]">
                  Receitas: {formatCurrency(row.receitas)}
                </p>
                <p className="text-sm text-[var(--danger)]">
                  Despesas: {formatCurrency(row.despesas)}
                </p>
                <p className="text-sm text-[var(--muted)]">Saldo: {formatCurrency(row.saldo)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data && filters.tipo === "orcamento" ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--primary)]">Orcamento vs realizado</h2>
          {data.budgetVsActual.length === 0 ? (
            <EmptyState
              title="Sem orcamento"
              description="Nao ha orcamentos planejados para a competencia da data final."
            />
          ) : (
            <div className="mt-4 divide-y divide-[var(--border)]">
              {data.budgetVsActual.map((row) => (
                <div key={`${row.categoria}-${row.subcategoria}`} className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{row.subcategoria}</p>
                      <p className="text-xs text-[var(--muted)]">{row.categoria}</p>
                    </div>
                    <strong className={row.saldo < 0 ? "text-sm text-[var(--danger)]" : "text-sm text-[var(--primary)]"}>
                      {row.percentual.toFixed(1)}%
                    </strong>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatCurrency(row.gasto)} de {formatCurrency(row.planejado)} · saldo{" "}
                    {formatCurrency(row.saldo)}
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={row.percentual} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </PageShell>
  );
}
