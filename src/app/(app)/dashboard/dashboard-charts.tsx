"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

type CashflowPoint = {
  dia: string;
  receitas: number;
  despesas: number;
};

type CategoryPoint = {
  categoria: string;
  total: number;
};

type DashboardChartsProps = {
  cashflow: CashflowPoint[];
  categories: CategoryPoint[];
};

const pieColors = ["#174d43", "#b8f99c", "#a9b2ad", "#ff4f61", "#d18a00", "#6f7975"];

export function DashboardCharts({ cashflow, categories }: DashboardChartsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--primary)]">Fluxo do mes</h2>
            <p className="text-sm text-[var(--muted)]">Receitas e despesas por dia.</p>
          </div>
        </div>
        <div className="mt-4 h-72">
          {cashflow.some((item) => item.receitas > 0 || item.despesas > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e3e9e2" vertical={false} />
                <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#b8f99c" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#174d43" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-sm text-[var(--muted)]">
              Sem movimentacao no periodo.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--primary)]">Despesas por categoria</h2>
        <p className="text-sm text-[var(--muted)]">Distribuicao do periodo selecionado.</p>
        {categories.length > 0 ? (
          <>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="categoria"
                    innerRadius={58}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={entry.categoria} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {categories.slice(0, 5).map((item, index) => (
                <div key={item.categoria} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    {item.categoria}
                  </span>
                  <strong className="text-[var(--primary)]">{formatCurrency(item.total)}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 flex h-72 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-sm text-[var(--muted)]">
            Sem despesas categorizadas.
          </div>
        )}
      </div>
    </section>
  );
}
