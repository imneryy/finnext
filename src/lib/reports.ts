import { createClient } from "@/lib/supabase/server";

export type ReportType = "resumo" | "categorias" | "tendencia" | "orcamento";

export type ReportFilters = {
  dataInicio: string;
  dataFim: string;
  tipo: ReportType;
};

export function defaultReportDates() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    dataInicio: toDateValue(start),
    dataFim: toDateValue(today),
  };
}

export function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${month}/${year}`;
}

export function normalizeReportFilters(params: {
  data_inicio?: string;
  data_fim?: string;
  tipo?: string;
}) {
  const defaults = defaultReportDates();
  const tipo = ["resumo", "categorias", "tendencia", "orcamento"].includes(
    params.tipo ?? "",
  )
    ? (params.tipo as ReportType)
    : "resumo";

  return {
    dataInicio: params.data_inicio || defaults.dataInicio,
    dataFim: params.data_fim || defaults.dataFim,
    tipo,
  };
}

export async function getReportData(filters: ReportFilters) {
  if (filters.dataInicio > filters.dataFim) {
    return {
      error: "A data inicial nao pode ser posterior a data final.",
      data: null,
    };
  }

  const supabase = await createClient();
  const startDate = parseDateValue(filters.dataInicio);
  const endDate = parseDateValue(filters.dataFim);
  const days = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
  );
  const previousEnd = addDays(startDate, -1);
  const previousStart = addDays(previousEnd, -(days - 1));
  const previousStartValue = toDateValue(previousStart);
  const previousEndValue = toDateValue(previousEnd);

  const [
    { data: currentTransactions, error: currentError },
    { data: previousTransactions, error: previousError },
    { data: budgets, error: budgetsError },
    { data: categoryRows, error: categoryError },
  ] = await Promise.all([
    supabase
      .from("lancamentos")
      .select("tipo, valor, data")
      .eq("ativo", true)
      .gte("data", filters.dataInicio)
      .lte("data", filters.dataFim),
    supabase
      .from("lancamentos")
      .select("tipo, valor")
      .eq("ativo", true)
      .gte("data", previousStartValue)
      .lte("data", previousEndValue),
    supabase
      .from("orcamentos")
      .select("valor_planejado, valor_gasto, subcategorias(nome, categorias(nome))")
      .eq("ativo", true)
      .eq("mes", endDate.getMonth() + 1)
      .eq("ano", endDate.getFullYear()),
    supabase
      .from("lancamentos")
      .select("valor, subcategorias(nome, categorias(nome))")
      .eq("ativo", true)
      .eq("tipo", "despesa")
      .gte("data", filters.dataInicio)
      .lte("data", filters.dataFim),
  ]);

  const error = currentError ?? previousError ?? budgetsError ?? categoryError;

  if (error) {
    return { error: error.message, data: null };
  }

  const receitas = (currentTransactions ?? [])
    .filter((item) => item.tipo === "receita")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const despesas = (currentTransactions ?? [])
    .filter((item) => item.tipo === "despesa")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const saldo = receitas - despesas;
  const previousReceitas = (previousTransactions ?? [])
    .filter((item) => item.tipo === "receita")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const previousDespesas = (previousTransactions ?? [])
    .filter((item) => item.tipo === "despesa")
    .reduce((sum, item) => sum + Number(item.valor), 0);
  const previousSaldo = previousReceitas - previousDespesas;
  const totalPlanejado = (budgets ?? []).reduce(
    (sum, item) => sum + Number(item.valor_planejado),
    0,
  );
  const totalGastoOrcamento = (budgets ?? []).reduce(
    (sum, item) => sum + Number(item.valor_gasto),
    0,
  );

  const categories = new Map<string, number>();
  for (const row of categoryRows ?? []) {
    const categoryName = row.subcategorias?.categorias?.nome ?? "Nao categorizado";
    categories.set(categoryName, (categories.get(categoryName) ?? 0) + Number(row.valor));
  }

  const monthly = new Map<string, { receitas: number; despesas: number }>();
  const trendStart = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
  for (let index = 0; index < 6; index += 1) {
    const date = new Date(trendStart.getFullYear(), trendStart.getMonth() + index, 1);
    monthly.set(monthKey(date), { receitas: 0, despesas: 0 });
  }
  for (const item of currentTransactions ?? []) {
    const key = monthKey(parseDateValue(item.data));
    if (monthly.has(key)) {
      const entry = monthly.get(key)!;
      if (item.tipo === "receita") entry.receitas += Number(item.valor);
      if (item.tipo === "despesa") entry.despesas += Number(item.valor);
    }
  }

  return {
    error: null,
    data: {
      summary: {
        receitas,
        despesas,
        saldo,
        previousReceitas,
        previousDespesas,
        previousSaldo,
        totalPlanejado,
        totalGastoOrcamento,
        usoOrcamento:
          totalPlanejado === 0 ? 0 : (totalGastoOrcamento / totalPlanejado) * 100,
      },
      categories: Array.from(categories.entries())
        .map(([categoria, total]) => ({ categoria, total }))
        .sort((a, b) => b.total - a.total),
      trend: Array.from(monthly.entries()).map(([key, value]) => ({
        mes: monthLabel(key),
        ...value,
        saldo: value.receitas - value.despesas,
      })),
      budgetVsActual: (budgets ?? []).map((budget) => ({
        categoria: budget.subcategorias?.categorias?.nome ?? "Categoria",
        subcategoria: budget.subcategorias?.nome ?? "Subcategoria",
        planejado: Number(budget.valor_planejado),
        gasto: Number(budget.valor_gasto),
        saldo: Number(budget.valor_planejado) - Number(budget.valor_gasto),
        percentual:
          Number(budget.valor_planejado) === 0
            ? 0
            : (Number(budget.valor_gasto) / Number(budget.valor_planejado)) * 100,
      })),
      previousPeriod: {
        start: previousStartValue,
        end: previousEndValue,
      },
    },
  };
}

export function variation(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatVariation(value: number | null) {
  if (value === null) return "sem base de comparacao";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
