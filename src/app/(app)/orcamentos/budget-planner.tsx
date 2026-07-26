"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Save, X } from "lucide-react";

import { saveBudget } from "@/app/(app)/orcamentos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { ModalPanel } from "@/components/ui/modal-panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/format";

export type BudgetAllocation = {
  subcategoria_id: string;
  categoria_nome: string;
  subcategoria_nome: string;
  valor_planejado: number;
  valor_gasto: number;
  incluido: boolean;
};

type BudgetPlannerProps = {
  mes: number;
  ano: number;
  receitaBase: number;
  allocations: BudgetAllocation[];
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function SaveBudgetButton({
  disabled,
  compact = false,
}: {
  disabled: boolean;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className={compact ? "h-10 w-full px-3" : undefined}
    >
      <Save className="h-4 w-4" aria-hidden="true" />
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function BudgetPlanner({
  mes,
  ano,
  receitaBase,
  allocations,
}: BudgetPlannerProps) {
  const [baseIncome, setBaseIncome] = useState(receitaBase);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      allocations.map((allocation) => [
        allocation.subcategoria_id,
        allocation.valor_planejado,
      ]),
    ),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () =>
      new Set(
        allocations
          .filter(
            (allocation) =>
              allocation.incluido ||
              allocation.valor_planejado > 0 ||
              allocation.valor_gasto > 0,
          )
          .map((allocation) => allocation.subcategoria_id),
      ),
  );
  const categoryNames = Array.from(
    new Set(allocations.map((allocation) => allocation.categoria_nome)),
  );
  const [dirty, setDirty] = useState(false);
  const selectedAllocations = allocations.filter((allocation) =>
    selectedIds.has(allocation.subcategoria_id),
  );

  const totalPlanned = useMemo(
    () =>
      selectedAllocations.reduce(
        (sum, allocation) => sum + Number(values[allocation.subcategoria_id] || 0),
        0,
      ),
    [selectedAllocations, values],
  );
  const remaining = roundMoney(baseIncome - totalPlanned);
  const exceeded = totalPlanned > baseIncome;
  const hiddenAllocations = selectedAllocations
    .map((allocation) => ({
      subcategoria_id: allocation.subcategoria_id,
      valor_planejado: roundMoney(values[allocation.subcategoria_id] ?? 0),
    }))
    .filter((allocation) => allocation.valor_planejado >= 0);
  const groupedAllocations = selectedAllocations.reduce<
    Array<{ categoria_nome: string; allocations: BudgetAllocation[] }>
  >((groups, allocation) => {
    const group = groups.find((item) => item.categoria_nome === allocation.categoria_nome);

    if (group) {
      group.allocations.push(allocation);
      return groups;
    }

    groups.push({ categoria_nome: allocation.categoria_nome, allocations: [allocation] });
    return groups;
  }, []);
  const availableCategoryGroups = categoryNames
    .map((categoryName) => {
      const categoryAllocations = allocations.filter(
        (allocation) => allocation.categoria_nome === categoryName,
      );
      const availableAllocations = categoryAllocations.filter(
        (allocation) => !selectedIds.has(allocation.subcategoria_id),
      );

      return {
        categoria_nome: categoryName,
        total: categoryAllocations.length,
        availableAllocations,
      };
    })
    .filter((group) => group.availableAllocations.length > 0);

  function addCategory(categoryName: string) {
    const categoryAllocations = allocations.filter(
      (allocation) => allocation.categoria_nome === categoryName,
    );

    if (categoryAllocations.length === 0) {
      return;
    }

    setDirty(true);
    setSelectedIds((current) => {
      const next = new Set(current);
      categoryAllocations.forEach((allocation) => next.add(allocation.subcategoria_id));
      return next;
    });
  }

  function removeAllocation(allocation: BudgetAllocation) {
    if (allocation.valor_gasto > 0) {
      return;
    }

    setDirty(true);
    setValues((current) => ({
      ...current,
      [allocation.subcategoria_id]: 0,
    }));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(allocation.subcategoria_id);
      return next;
    });
  }

  function removeCategory(categoryName: string) {
    const categoryAllocations = selectedAllocations.filter(
      (allocation) => allocation.categoria_nome === categoryName,
    );
    const removableAllocations = categoryAllocations.filter(
      (allocation) => allocation.valor_gasto <= 0,
    );

    if (removableAllocations.length === 0) {
      return;
    }

    setDirty(true);
    setValues((current) => ({
      ...current,
      ...Object.fromEntries(
        removableAllocations.map((allocation) => [allocation.subcategoria_id, 0]),
      ),
    }));
    setSelectedIds((current) => {
      const next = new Set(current);
      removableAllocations.forEach((allocation) => next.delete(allocation.subcategoria_id));
      return next;
    });
  }

  function updateValue(subcategoriaId: string, value: number) {
    setDirty(true);
    setValues((current) => ({
      ...current,
      [subcategoriaId]: Math.max(0, roundMoney(value || 0)),
    }));
  }

  function updatePercent(subcategoriaId: string, percent: number) {
    const nextValue = baseIncome <= 0 ? 0 : (baseIncome * Math.max(0, percent || 0)) / 100;
    updateValue(subcategoriaId, nextValue);
  }

  return (
    <form action={saveBudget} className="space-y-5">
      <input type="hidden" name="mes" value={mes} />
      <input type="hidden" name="ano" value={ano} />
      <input type="hidden" name="alocacoes" value={JSON.stringify(hiddenAllocations)} />

      <section className="sticky top-0 z-20 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-5 py-4 shadow-sm backdrop-blur lg:grid-cols-[minmax(180px,1fr)_1fr_1fr_1fr_auto]">
        <label>
          <span className="text-sm font-semibold text-[var(--foreground)]">Receita-base</span>
          <Input
            className="mt-1"
            name="receita_base"
            type="number"
            min="0"
            step="0.01"
            value={baseIncome}
            onChange={(event) => {
              setDirty(true);
              setBaseIncome(Math.max(0, Number(event.target.value || 0)));
            }}
          />
        </label>
        <MetricCard label="Planejado" value={formatCurrency(totalPlanned)} />
        <MetricCard
          label="Restante"
          value={formatCurrency(remaining)}
          tone={remaining < 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Uso da receita"
          value={`${baseIncome > 0 ? ((totalPlanned / baseIncome) * 100).toFixed(1) : "0.0"}%`}
          tone={exceeded ? "danger" : "default"}
        />
        <div className="flex flex-col justify-end gap-2">
          <span
            className={
              dirty
                ? "text-xs font-semibold text-[var(--warning)]"
                : "text-xs font-semibold text-[var(--muted)]"
            }
          >
            {dirty ? "Alteracoes pendentes" : "Tudo salvo"}
          </span>
          <SaveBudgetButton disabled={exceeded} compact />
        </div>
      </section>

      {exceeded ? (
        <div className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          Total planejado maior que a receita-base. Ajuste os valores antes de salvar.
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--primary)]">
              Montar orcamento
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Adicione categorias ativas; as subcategorias ativas entram juntas.
            </p>
            <span className="mt-1 inline-block text-xs font-semibold text-[var(--muted)]">
              {groupedAllocations.length} de {categoryNames.length} categorias no mes
            </span>
          </div>
          <ModalPanel
            title="Adicionar categoria"
            description="Escolha uma categoria ativa para incluir todas as subcategorias ativas no orcamento."
            size="md"
            trigger={
              <Button type="button" className="h-9 px-3">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Categoria
              </Button>
            }
          >
            {availableCategoryGroups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                <h3 className="text-sm font-semibold text-[var(--primary)]">
                  Todas as categorias ja foram adicionadas
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Remova uma categoria do orcamento para poder adiciona-la novamente.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableCategoryGroups.map((group) => (
                  <button
                    key={group.categoria_nome}
                    type="button"
                    onClick={() => addCategory(group.categoria_nome)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-left hover:bg-[var(--accent-soft)]"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {group.categoria_nome}
                      </span>
                      <span className="block text-xs text-[var(--muted)]">
                        {group.availableAllocations.length} subcategorias disponiveis
                      </span>
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ModalPanel>
        </div>
      </section>

      {selectedAllocations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
          <h2 className="text-base font-semibold text-[var(--primary)]">
            Nenhuma subcategoria no orcamento
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
            Selecione pelo menos uma subcategoria acima para planejar valores deste mes.
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          {groupedAllocations.map((group) => {
          const categoryPlanned = group.allocations.reduce(
            (sum, allocation) => sum + Number(values[allocation.subcategoria_id] ?? 0),
            0,
          );
          const categorySpent = group.allocations.reduce(
            (sum, allocation) => sum + Number(allocation.valor_gasto),
            0,
          );
          const categoryPercent =
            categoryPlanned === 0 ? 0 : (categorySpent / categoryPlanned) * 100;

          return (
            <div
              key={group.categoria_nome}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="grid gap-3 bg-[var(--accent-soft)] px-5 py-4 lg:grid-cols-[1fr_140px_140px_140px_44px] lg:items-center">
                <div>
                  <h2 className="text-base font-semibold text-[var(--primary)]">
                    {group.categoria_nome}
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    {group.allocations.length} subcategorias
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {formatCurrency(categoryPlanned)}
                </span>
                <span className="text-sm text-[var(--muted)]">
                  {formatCurrency(categorySpent)}
                </span>
                <ProgressBar value={categoryPercent} />
                <button
                  type="button"
                  onClick={() => removeCategory(group.categoria_nome)}
                  disabled={group.allocations.every((allocation) => allocation.valor_gasto > 0)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-white hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Remover categoria do orcamento"
                  aria-label="Remover categoria do orcamento"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-[1.5fr_120px_120px_120px_120px_44px] gap-3 border-y border-[var(--border)] px-5 py-2 text-xs font-semibold uppercase text-[var(--muted)] max-lg:hidden">
                <span>Subcategoria</span>
                <span>Planejado</span>
                <span>Percentual</span>
                <span>Gasto</span>
                <span>Saldo</span>
                <span className="sr-only">Acoes</span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {group.allocations.map((allocation) => {
                  const planned = values[allocation.subcategoria_id] ?? 0;
                  const percent = baseIncome > 0 ? (planned / baseIncome) * 100 : 0;
                  const balance = planned - allocation.valor_gasto;

                  return (
                    <div
                      key={allocation.subcategoria_id}
                      className="grid gap-3 px-5 py-3 lg:grid-cols-[1.5fr_120px_120px_120px_120px_44px] lg:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {allocation.subcategoria_nome}
                        </p>
                      </div>
                      <label>
                        <span className="sr-only">Valor planejado</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={planned}
                          onChange={(event) =>
                            updateValue(allocation.subcategoria_id, Number(event.target.value))
                          }
                        />
                      </label>
                      <label>
                        <span className="sr-only">Percentual</span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={roundMoney(percent)}
                          onChange={(event) =>
                            updatePercent(allocation.subcategoria_id, Number(event.target.value))
                          }
                        />
                      </label>
                      <span className="text-sm text-[var(--muted)]">
                        {formatCurrency(allocation.valor_gasto)}
                      </span>
                      <div>
                        <span
                          className={
                            balance < 0
                              ? "text-sm font-semibold text-[var(--danger)]"
                              : "text-sm font-semibold text-[var(--primary)]"
                          }
                        >
                          {formatCurrency(balance)}
                        </span>
                        <div className="mt-1">
                          <ProgressBar
                            value={planned === 0 ? 0 : (allocation.valor_gasto / planned) * 100}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAllocation(allocation)}
                        disabled={allocation.valor_gasto > 0}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          allocation.valor_gasto > 0
                            ? "Nao e possivel remover item com gasto realizado"
                            : "Remover do orcamento"
                        }
                        aria-label="Remover do orcamento"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </section>
      )}

      <div className="sticky bottom-3 z-20 flex justify-end">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 shadow-lg backdrop-blur">
          <span
            className={
              dirty
                ? "text-xs font-semibold text-[var(--warning)]"
                : "text-xs font-semibold text-[var(--muted)]"
            }
          >
            {dirty ? "Revise e salve as alteracoes" : "Sem alteracoes pendentes"}
          </span>
          <SaveBudgetButton disabled={exceeded} />
        </div>
      </div>
    </form>
  );
}
