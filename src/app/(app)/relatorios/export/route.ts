import { NextResponse, type NextRequest } from "next/server";

import { formatCurrency } from "@/lib/format";
import { getReportData, normalizeReportFilters } from "@/lib/reports";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const filters = normalizeReportFilters({
    data_inicio: request.nextUrl.searchParams.get("data_inicio") ?? undefined,
    data_fim: request.nextUrl.searchParams.get("data_fim") ?? undefined,
    tipo: request.nextUrl.searchParams.get("tipo") ?? undefined,
  });
  const { data, error } = await getReportData(filters);

  if (error || !data) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const rows: Array<Array<string | number>> = [
    ["Finnext - Relatorio financeiro"],
    ["Periodo", `${filters.dataInicio} a ${filters.dataFim}`],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    ["Moeda", "BRL"],
    [],
  ];

  if (filters.tipo === "resumo") {
    rows.push(["Metrica", "Valor"]);
    rows.push(["Receitas", formatCurrency(data.summary.receitas)]);
    rows.push(["Despesas", formatCurrency(data.summary.despesas)]);
    rows.push(["Saldo liquido", formatCurrency(data.summary.saldo)]);
    rows.push(["Uso do orcamento", `${data.summary.usoOrcamento.toFixed(1)}%`]);
  }

  if (filters.tipo === "categorias") {
    rows.push(["Categoria", "Total de despesas"]);
    data.categories.forEach((row) => rows.push([row.categoria, formatCurrency(row.total)]));
  }

  if (filters.tipo === "tendencia") {
    rows.push(["Mes", "Receitas", "Despesas", "Saldo"]);
    data.trend.forEach((row) =>
      rows.push([
        row.mes,
        formatCurrency(row.receitas),
        formatCurrency(row.despesas),
        formatCurrency(row.saldo),
      ]),
    );
  }

  if (filters.tipo === "orcamento") {
    rows.push(["Categoria", "Subcategoria", "Planejado", "Gasto", "Saldo", "Percentual"]);
    data.budgetVsActual.forEach((row) =>
      rows.push([
        row.categoria,
        row.subcategoria,
        formatCurrency(row.planejado),
        formatCurrency(row.gasto),
        formatCurrency(row.saldo),
        `${row.percentual.toFixed(1)}%`,
      ]),
    );
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${filters.tipo}-${filters.dataInicio}-${filters.dataFim}.csv"`,
    },
  });
}
