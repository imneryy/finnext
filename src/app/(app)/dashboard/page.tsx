import Link from "next/link";
import { BarChart3, CalendarDays, Plus, WalletCards } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { OnboardingCard } from "@/components/app/onboarding-card";
import { DashboardCharts } from "@/app/(app)/dashboard/dashboard-charts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDatePtBr } from "@/lib/format";
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

type DashboardPageProps = {
  searchParams: Promise<{
    mes?: string;
    ano?: string;
  }>;
};

function dateInput(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthPeriod(mes: number, ano: number) {
  const lastDay = new Date(ano, mes, 0).getDate();
  return {
    start: dateInput(ano, mes, 1),
    end: dateInput(ano, mes, lastDay),
  };
}

function previousMonth(mes: number, ano: number) {
  return mes === 1 ? { mes: 12, ano: ano - 1 } : { mes: mes - 1, ano };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatChange(value: number | null) {
  if (value === null) {
    return "sem base";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function budgetTone(percent: number) {
  if (percent > 100) {
    return "danger";
  }

  if (percent > 80) {
    return "warning";
  }

  return "default";
}

function buildCashflow(
  transactions: Array<{ tipo: string; valor: number | string; data: string }>,
  mes: number,
  ano: number,
) {
  const lastDay = new Date(ano, mes, 0).getDate();
  const byDay = new Map(
    Array.from({ length: lastDay }, (_, index) => [
      String(index + 1).padStart(2, "0"),
      { dia: String(index + 1).padStart(2, "0"), receitas: 0, despesas: 0 },
    ]),
  );

  transactions.forEach((transaction) => {
    const day = transaction.data.slice(8, 10);
    const current = byDay.get(day);

    if (!current) {
      return;
    }

    if (transaction.tipo === "receita") {
      current.receitas += Number(transaction.valor);
    } else {
      current.despesas += Number(transaction.valor);
    }
  });

  return Array.from(byDay.values());
}

function buildCategoryBreakdown(
  transactions: Array<{
    tipo: string;
    valor: number | string;
    subcategorias: { categorias: { nome: string } | null } | null;
  }>,
) {
  const totals = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.tipo === "despesa")
    .forEach((transaction) => {
      const category = transaction.subcategorias?.categorias?.nome ?? "Nao categorizado";
      totals.set(category, (totals.get(category) ?? 0) + Number(transaction.valor));
    });

  return Array.from(totals.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const mes = Math.min(Math.max(Number(params.mes ?? currentMonth), 1), 12);
  const ano = Number(params.ano ?? currentYear);
  const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);
  const period = monthPeriod(mes, ano);
  const previous = previousMonth(mes, ano);
  const previousPeriod = monthPeriod(previous.mes, previous.ano);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: preferences },
    { data: currentTransactions },
    { data: previousTransactions },
    { data: latestTransactions },
    { data: budgets },
  ] = await Promise.all([
    user
      ? supabase
          .from("preferencias_usuario")
          .select("onboarding_concluido")
          .eq("usuario_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("lancamentos")
      .select("tipo, valor, data, subcategorias(categorias(nome))")
      .eq("ativo", true)
      .gte("data", period.start)
      .lte("data", period.end),
    supabase
      .from("lancamentos")
      .select("tipo, valor")
      .eq("ativo", true)
      .gte("data", previousPeriod.start)
      .lte("data", previousPeriod.end),
    supabase
      .from("lancamentos")
      .select("id, tipo, valor, data, descricao, criado_em, subcategorias(nome, categorias(nome))")
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(5),
    supabase
      .from("orcamentos")
      .select("id, valor_planejado, valor_gasto, subcategorias(nome, categorias(nome))")
      .eq("ativo", true)
      .eq("mes", mes)
      .eq("ano", ano)
      .gt("valor_planejado", 0)
      .order("valor_gasto", { ascending: false })
      .limit(6),
  ]);

  const totalReceitas = (currentTransactions ?? [])
    .filter((transaction) => transaction.tipo === "receita")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  const totalDespesas = (currentTransactions ?? [])
    .filter((transaction) => transaction.tipo === "despesa")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const previousReceitas = (previousTransactions ?? [])
    .filter((transaction) => transaction.tipo === "receita")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  const previousDespesas = (previousTransactions ?? [])
    .filter((transaction) => transaction.tipo === "despesa")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  const previousSaldo = previousReceitas - previousDespesas;
  const totalPlanejado = (budgets ?? []).reduce(
    (sum, budget) => sum + Number(budget.valor_planejado),
    0,
  );
  const totalGastoOrcamento = (budgets ?? []).reduce(
    (sum, budget) => sum + Number(budget.valor_gasto),
    0,
  );
  const percentualGasto =
    totalPlanejado === 0 ? 0 : (totalGastoOrcamento / totalPlanejado) * 100;
  const cashflow = buildCashflow(currentTransactions ?? [], mes, ano);
  const categoryBreakdown = buildCategoryBreakdown(currentTransactions ?? []);

  const cards = [
    {
      label: "Receitas",
      value: formatCurrency(totalReceitas),
      detail: formatChange(percentChange(totalReceitas, previousReceitas)),
    },
    {
      label: "Despesas",
      value: formatCurrency(totalDespesas),
      detail: formatChange(percentChange(totalDespesas, previousDespesas)),
    },
    {
      label: "Saldo",
      value: formatCurrency(saldo),
      detail: formatChange(percentChange(saldo, previousSaldo)),
    },
    {
      label: "Orcamento usado",
      value: `${percentualGasto.toFixed(1)}%`,
      detail: `${formatCurrency(totalGastoOrcamento)} de ${formatCurrency(totalPlanejado)}`,
      tone: budgetTone(percentualGasto),
    },
  ];

  return (
    <PageShell
      title="Dashboard"
      description={`Resumo de ${monthNames[mes - 1]} de ${ano}.`}
      actions={
        <>
          <Link
            href="/lancamentos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo lancamento
          </Link>
          <Link
            href={`/orcamentos?mes=${mes}&ano=${ano}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
          >
            <WalletCards className="h-4 w-4" aria-hidden="true" />
            Orcamento
          </Link>
        </>
      }
    >
      {preferences?.onboarding_concluido ? null : <OnboardingCard />}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Periodo
        </h2>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Select name="mes" defaultValue={String(mes)}>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </Select>
          <Select name="ano" defaultValue={String(ano)}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Aplicar
          </Button>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.label === "Orcamento usado" ? card.detail : `vs anterior: ${card.detail}`}
            tone={
              card.tone === "danger"
                ? "danger"
                : card.tone === "warning"
                  ? "warning"
                  : "default"
            }
          />
        ))}
      </section>

      <DashboardCharts cashflow={cashflow} categories={categoryBreakdown} />

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--primary)]">
            Ultimos lancamentos
          </h2>
          {!latestTransactions?.length ? (
            <EmptyState
              title="Nenhum lancamento"
              description="Crie seu primeiro lancamento para preencher o resumo."
            />
          ) : (
            <div className="mt-2 divide-y divide-[var(--border)]">
              {latestTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {transaction.descricao}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatDatePtBr(transaction.data)} ·{" "}
                      {transaction.subcategorias
                        ? `${transaction.subcategorias.categorias?.nome ?? "Categoria"} / ${transaction.subcategorias.nome}`
                        : "Sem subcategoria"}
                    </p>
                  </div>
                  <p
                    className={
                      transaction.tipo === "receita"
                        ? "text-sm font-semibold text-[var(--primary)]"
                        : "text-sm font-semibold text-[var(--danger)]"
                    }
                  >
                    {formatCurrency(transaction.valor)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--primary)]">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Orcamentos prioritarios
          </h2>
          {!budgets?.length ? (
            <EmptyState
              title="Nenhum orcamento planejado"
              description="Defina uma receita-base e aloque valores para acompanhar o realizado."
            />
          ) : (
            <div className="mt-3 space-y-3">
              {budgets.map((budget) => {
                const planned = Number(budget.valor_planejado);
                const spent = Number(budget.valor_gasto);
                const percent = planned === 0 ? 0 : (spent / planned) * 100;

                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {budget.subcategorias?.nome ?? "Subcategoria"}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {budget.subcategorias?.categorias?.nome ?? "Categoria"}
                        </p>
                      </div>
                      <StatusBadge
                        tone={percent > 100 ? "danger" : percent > 80 ? "warning" : "success"}
                      >
                        {percent.toFixed(1)}%
                      </StatusBadge>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={percent} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatCurrency(spent)} de {formatCurrency(planned)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <Link className="text-sm font-semibold text-[var(--primary)]" href="/relatorios">
          Abrir relatorios
        </Link>
      </div>
    </PageShell>
  );
}
