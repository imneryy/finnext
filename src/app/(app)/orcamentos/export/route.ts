import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mes = Number(searchParams.get("mes"));
  const ano = Number(searchParams.get("ano"));

  if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano)) {
    return NextResponse.json({ error: "Competencia invalida." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("relatorio_orcamento_realizado", {
    p_mes: mes,
    p_ano: ano,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = [
    ["Categoria", "Subcategoria", "Planejado", "Gasto", "Percentual utilizado", "Saldo"],
    ...(data ?? []).map((row) => [
      row.categoria_nome,
      row.subcategoria_nome,
      row.valor_planejado,
      row.valor_gasto,
      row.percentual_usado,
      row.saldo,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orcamento-${ano}-${String(mes).padStart(2, "0")}.csv"`,
    },
  });
}
