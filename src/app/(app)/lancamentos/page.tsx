import Link from "next/link";
import {
  CircleDollarSign,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { ModalPanel } from "@/components/ui/modal-panel";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Toast } from "@/components/ui/toast";
import { formatCurrency, formatDatePtBr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AiChat } from "@/app/(app)/lancamentos/ai-chat";
import {
  TransactionForm,
  type SubcategoryOption,
} from "@/app/(app)/lancamentos/transaction-form";
import {
  createTransaction,
  toggleTransactionStatus,
  updateTransaction,
} from "@/app/(app)/lancamentos/actions";

const PAGE_SIZE = 50;

type LancamentosPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    q?: string;
    tipo?: string;
    origem?: string;
    subcategoria_id?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: string;
  }>;
};

function pageHref(page: number, params: Awaited<LancamentosPageProps["searchParams"]>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "success" && key !== "error" && key !== "page") {
      search.set(key, value);
    }
  });

  search.set("page", String(page));
  return `/lancamentos?${search.toString()}`;
}

export default async function LancamentosPage({
  searchParams,
}: LancamentosPageProps) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? 1), 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createClient();

  const { data: subcategoriesData } = await supabase
    .from("subcategorias")
    .select("id, nome, ativo, categorias(nome)")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  const subcategories: SubcategoryOption[] = (subcategoriesData ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    categoria_nome: item.categorias?.nome ?? "Sem categoria",
  }));

  let query = supabase
    .from("lancamentos")
    .select(
      "id, tipo, origem, valor, data, descricao, tags, ativo, criado_em, subcategoria_id, subcategorias(nome, categorias(nome))",
      { count: "exact" },
    )
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false })
    .range(from, to);

  if (params.tipo === "receita" || params.tipo === "despesa") {
    query = query.eq("tipo", params.tipo);
  }

  if (params.origem === "fixa" || params.origem === "extra") {
    query = query.eq("origem", params.origem);
  }

  if (params.subcategoria_id) {
    query = query.eq("subcategoria_id", params.subcategoria_id);
  }

  if (params.data_inicio) {
    query = query.gte("data", params.data_inicio);
  }

  if (params.data_fim) {
    query = query.lte("data", params.data_fim);
  }

  if (params.q) {
    const term = params.q.replaceAll("%", "").replaceAll(",", " ").trim();
    if (term) {
      query = query.or(`descricao.ilike.%${term}%,tags.cs.{${term}}`);
    }
  }

  const { data: transactions, error, count } = await query;
  const totalPages = Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1);
  const filteredReceitas = (transactions ?? [])
    .filter((transaction) => transaction.tipo === "receita")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  const filteredDespesas = (transactions ?? [])
    .filter((transaction) => transaction.tipo === "despesa")
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);

  return (
    <PageShell
      title="Lancamentos"
      description="Registre, filtre e acompanhe receitas e despesas."
    >
      {params.success ? <Toast tone="success">{params.success}</Toast> : null}
      {params.error || error ? (
        <Toast tone="error">
          {params.error ?? "Nao foi possivel carregar os lancamentos."}
        </Toast>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Receitas filtradas" value={formatCurrency(filteredReceitas)} tone="success" />
        <MetricCard label="Despesas filtradas" value={formatCurrency(filteredDespesas)} tone="danger" />
        <MetricCard label="Saldo filtrado" value={formatCurrency(filteredReceitas - filteredDespesas)} />
      </section>

      <AiChat action={createTransaction} subcategories={subcategories} />

      <div className="flex justify-end">
        <ModalPanel
          title="Novo lancamento"
          description="Registre uma receita ou despesa sem sair da lista."
          trigger={
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo lancamento
            </Button>
          }
        >
          <TransactionForm
            action={createTransaction}
            subcategories={subcategories}
            submitLabel="Criar"
          />
        </ModalPanel>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--primary)]">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filtros
        </h2>
        <form className="mt-3 grid gap-2 lg:grid-cols-6">
          <Input name="q" placeholder="Descricao ou tag" defaultValue={params.q ?? ""} />
          <Select name="tipo" defaultValue={params.tipo ?? ""}>
            <option value="">Todos os tipos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </Select>
          <Select name="origem" defaultValue={params.origem ?? ""}>
            <option value="">Todas as origens</option>
            <option value="fixa">Fixa</option>
            <option value="extra">Extra</option>
          </Select>
          <Select name="subcategoria_id" defaultValue={params.subcategoria_id ?? ""}>
            <option value="">Todas subcategorias</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.categoria_nome} / {subcategory.nome}
              </option>
            ))}
          </Select>
          <Input name="data_inicio" type="date" defaultValue={params.data_inicio ?? ""} />
          <Input name="data_fim" type="date" defaultValue={params.data_fim ?? ""} />
          <div className="flex gap-2 lg:col-span-6">
            <Button type="submit">Aplicar</Button>
            <Link
              href="/lancamentos"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
            >
              Limpar
            </Link>
          </div>
        </form>
      </section>

      {!transactions?.length ? (
        <EmptyState
          title="Nenhum lancamento encontrado"
          description="Crie um lancamento ou ajuste os filtros para consultar outro periodo."
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_120px_130px_130px_150px] gap-4 border-b border-[var(--border)] bg-[var(--accent-soft)] px-5 py-3 text-xs font-semibold uppercase text-[var(--primary)] max-xl:hidden">
            <span>Lancamento</span>
            <span>Categoria</span>
            <span>Data</span>
            <span>Valor</span>
            <span>Status</span>
            <span className="text-right">Acoes</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid gap-3 px-5 py-3 transition hover:bg-[var(--surface-muted)] xl:grid-cols-[2fr_1fr_120px_130px_130px_150px] xl:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)]">
                    <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {transaction.descricao}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {transaction.tipo} - {transaction.origem}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-[var(--foreground)]">
                  {transaction.subcategorias
                    ? `${transaction.subcategorias.categorias?.nome ?? "Categoria"} / ${transaction.subcategorias.nome}`
                    : "Sem subcategoria"}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  {formatDatePtBr(transaction.data)}
                </div>
                <div
                  className={
                    transaction.tipo === "receita"
                      ? "text-sm font-bold text-[var(--primary)]"
                      : "text-sm font-bold text-[var(--danger)]"
                  }
                >
                  {formatCurrency(transaction.valor)}
                </div>
                <div>
                  <StatusBadge tone={transaction.ativo ? "success" : "neutral"}>
                    {transaction.ativo ? "Ativo" : "Inativo"}
                  </StatusBadge>
                </div>
                <div className="hidden justify-end gap-2 sm:flex">
                  <ModalPanel
                    title="Editar lancamento"
                    description="Atualize dados do lancamento. O impacto no orcamento e recalculado pelo banco."
                    trigger={
                      <Button
                        variant="secondary"
                        className="h-9 w-9 px-0"
                        title="Editar lancamento"
                        aria-label="Editar lancamento"
                      >
                        <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    }
                  >
                    <TransactionForm
                      action={updateTransaction}
                      subcategories={subcategories}
                      submitLabel="Salvar"
                      transaction={{
                        id: transaction.id,
                        tipo: transaction.tipo,
                        origem: transaction.origem,
                        valor: transaction.valor,
                        data: transaction.data,
                        descricao: transaction.descricao,
                        subcategoria_id: transaction.subcategoria_id,
                        tags: transaction.tags,
                      }}
                    />
                  </ModalPanel>
                  <form action={toggleTransactionStatus}>
                    <input type="hidden" name="id" value={transaction.id} />
                    <input
                      type="hidden"
                      name="ativo"
                      value={transaction.ativo ? "false" : "true"}
                    />
                    <Button
                      type="submit"
                      variant={transaction.ativo ? "danger" : "secondary"}
                      className="h-9 w-9 px-0"
                      title={transaction.ativo ? "Inativar" : "Reativar"}
                      aria-label={
                        transaction.ativo ? "Inativar lancamento" : "Reativar lancamento"
                      }
                    >
                      <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                      <span className="sr-only">
                        {transaction.ativo ? "Inativar" : "Reativar"}
                      </span>
                    </Button>
                  </form>
                </div>
                <details className="relative sm:hidden">
                  <summary className="ml-auto flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
                    <MoreHorizontal className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                    <span className="sr-only">Abrir acoes</span>
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 flex min-w-44 flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                    <ModalPanel
                      title="Editar lancamento"
                      description="Atualize dados do lancamento. O impacto no orcamento e recalculado pelo banco."
                      trigger={
                        <Button variant="ghost" className="h-9 w-full justify-start px-3">
                          <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                          Editar
                        </Button>
                      }
                    >
                      <TransactionForm
                        action={updateTransaction}
                        subcategories={subcategories}
                        submitLabel="Salvar"
                        transaction={{
                          id: transaction.id,
                          tipo: transaction.tipo,
                          origem: transaction.origem,
                          valor: transaction.valor,
                          data: transaction.data,
                          descricao: transaction.descricao,
                          subcategoria_id: transaction.subcategoria_id,
                          tags: transaction.tags,
                        }}
                      />
                    </ModalPanel>
                    <form action={toggleTransactionStatus}>
                      <input type="hidden" name="id" value={transaction.id} />
                      <input
                        type="hidden"
                        name="ativo"
                        value={transaction.ativo ? "false" : "true"}
                      />
                      <Button
                        type="submit"
                        variant={transaction.ativo ? "danger" : "ghost"}
                        className="h-9 w-full justify-start px-3"
                      >
                        <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                        {transaction.ativo ? "Inativar" : "Reativar"}
                      </Button>
                    </form>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>
          Pagina {page} de {totalPages} - {count ?? 0} registros
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link className="font-semibold text-[var(--primary)]" href={pageHref(page - 1, params)}>
              Anterior
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link className="font-semibold text-[var(--primary)]" href={pageHref(page + 1, params)}>
              Proxima
            </Link>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
