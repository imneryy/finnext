import { MoreHorizontal, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ModalPanel } from "@/components/ui/modal-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { Toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";
import {
  CategoryForm,
  SubcategoryForm,
  type CategoryOption,
} from "@/app/(app)/categorias/category-forms";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  toggleCategoryStatus,
  toggleSubcategoryStatus,
  updateCategory,
  updateSubcategory,
} from "@/app/(app)/categorias/actions";

type CategoriasPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type Category = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  ordem: number;
  ativo: boolean;
  subcategorias: Subcategory[];
};

type Subcategory = {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export default async function CategoriasPage({
  searchParams,
}: CategoriasPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select(
      "id, nome, descricao, cor, ordem, ativo, subcategorias(id, categoria_id, nome, descricao, ativo)",
    )
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true })
    .order("nome", { referencedTable: "subcategorias", ascending: true });

  const categories = (data ?? []).map((category) => ({
    ...category,
    subcategorias: [...(category.subcategorias ?? [])].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    ),
  })) as Category[];
  const activeCategories = categories.filter((category) => category.ativo);
  const categoryOptions: CategoryOption[] = activeCategories.map((category) => ({
    id: category.id,
    nome: category.nome,
  }));

  return (
    <PageShell
      title="Categorias"
      description="Organize categorias e subcategorias para classificar sua vida financeira."
    >
      {params.success ? (
        <Toast tone="success">{params.success}</Toast>
      ) : null}
      {params.error || error ? (
        <Toast tone="error">
          {params.error ?? "Nao foi possivel carregar as categorias."}
        </Toast>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <ModalPanel
          title="Nova categoria"
          description="Crie um grupo financeiro para organizar subcategorias."
          trigger={
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova categoria
            </Button>
          }
        >
          <CategoryForm action={createCategory} submitLabel="Criar categoria" />
        </ModalPanel>
        <ModalPanel
          title="Nova subcategoria"
          description="Adicione uma subcategoria dentro de uma categoria ativa."
          trigger={
            <Button variant="secondary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nova subcategoria
            </Button>
          }
        >
          <SubcategoryForm
            action={createSubcategory}
            categories={categoryOptions}
            submitLabel="Criar subcategoria"
          />
        </ModalPanel>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie sua primeira categoria para organizar os lancamentos."
        />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <details
              key={category.id}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: category.cor }}
                      aria-hidden="true"
                    />
                    <h2 className="text-lg font-semibold text-[var(--primary)]">
                      {category.nome}
                    </h2>
                    <StatusBadge tone={category.ativo ? "success" : "neutral"}>
                      {category.ativo ? "Ativa" : "Inativa"}
                    </StatusBadge>
                    <StatusBadge>{`${category.subcategorias.length} subcategorias`}</StatusBadge>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[var(--primary)] group-open:hidden">
                  Abrir
                </span>
                <span className="hidden text-sm font-semibold text-[var(--muted)] group-open:inline">
                  Fechar
                </span>
              </summary>

              <div className="border-t border-[var(--border)] px-5 py-4">
                {category.descricao ? (
                  <p className="mb-3 text-sm text-[var(--muted)]">
                    {category.descricao}
                  </p>
                ) : null}

                <div className="hidden justify-end gap-2 sm:flex">
                  <ModalPanel
                    title="Editar categoria"
                    description="Atualize nome, cor, ordem e descricao."
                    trigger={
                      <Button
                        variant="secondary"
                        className="h-9 w-9 px-0"
                        title="Editar categoria"
                        aria-label="Editar categoria"
                      >
                        <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                        <span className="sr-only">Editar categoria</span>
                      </Button>
                    }
                  >
                    <CategoryForm
                      action={updateCategory}
                      submitLabel="Salvar categoria"
                      category={{
                        id: category.id,
                        nome: category.nome,
                        descricao: category.descricao,
                        cor: category.cor,
                        ordem: category.ordem,
                      }}
                    />
                  </ModalPanel>
                  <form action={toggleCategoryStatus}>
                    <input type="hidden" name="id" value={category.id} />
                    <input
                      type="hidden"
                      name="ativo"
                      value={category.ativo ? "false" : "true"}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="h-9 w-9 px-0"
                      title={category.ativo ? "Inativar" : "Reativar"}
                      aria-label={category.ativo ? "Inativar categoria" : "Reativar categoria"}
                    >
                      <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                      <span className="sr-only">
                        {category.ativo ? "Inativar" : "Reativar"}
                      </span>
                    </Button>
                  </form>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button
                      type="submit"
                      variant="danger"
                      className="h-9 w-9 px-0"
                      title="Excluir"
                      aria-label="Excluir categoria"
                    >
                      <Trash2 className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </form>
                </div>
                <details className="relative flex justify-end sm:hidden">
                  <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
                    <MoreHorizontal className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                    <span className="sr-only">Abrir acoes</span>
                  </summary>
                  <div className="absolute right-0 z-20 mt-10 flex min-w-44 flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                    <ModalPanel
                      title="Editar categoria"
                      description="Atualize nome, cor, ordem e descricao."
                      trigger={
                        <Button variant="ghost" className="h-9 w-full justify-start px-3">
                          <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                          Editar
                        </Button>
                      }
                    >
                      <CategoryForm
                        action={updateCategory}
                        submitLabel="Salvar categoria"
                        category={{
                          id: category.id,
                          nome: category.nome,
                          descricao: category.descricao,
                          cor: category.cor,
                          ordem: category.ordem,
                        }}
                      />
                    </ModalPanel>
                    <form action={toggleCategoryStatus}>
                      <input type="hidden" name="id" value={category.id} />
                      <input
                        type="hidden"
                        name="ativo"
                        value={category.ativo ? "false" : "true"}
                      />
                      <Button type="submit" variant="ghost" className="h-9 w-full justify-start px-3">
                        <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                        {category.ativo ? "Inativar" : "Reativar"}
                      </Button>
                    </form>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <Button type="submit" variant="danger" className="h-9 w-full justify-start px-3">
                        <Trash2 className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                        Excluir
                      </Button>
                    </form>
                  </div>
                </details>

              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--primary)]">
                    Subcategorias
                  </h3>
                {category.ativo ? (
                    <ModalPanel
                      title={`Nova subcategoria em ${category.nome}`}
                      trigger={
                        <Button
                          variant="secondary"
                          className="h-9 w-9 px-0"
                          title="Adicionar subcategoria"
                          aria-label="Adicionar subcategoria"
                        >
                          <Plus className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                          <span className="sr-only">Adicionar</span>
                        </Button>
                      }
                    >
                      <SubcategoryForm
                        action={createSubcategory}
                        categories={categoryOptions}
                        categoryId={category.id}
                        submitLabel="Adicionar"
                      />
                    </ModalPanel>
                ) : null}
                </div>
                {category.subcategorias.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Nenhuma subcategoria cadastrada.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {category.subcategorias.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {subcategory.nome}
                            </p>
                            {subcategory.descricao ? (
                              <p className="text-xs text-[var(--muted)]">
                                {subcategory.descricao}
                              </p>
                            ) : null}
                          </div>
                          <StatusBadge tone={subcategory.ativo ? "success" : "neutral"}>
                            {subcategory.ativo ? "Ativa" : "Inativa"}
                          </StatusBadge>
                          <div className="hidden gap-2 sm:flex">
                            <ModalPanel
                              title="Editar subcategoria"
                              trigger={
                                <Button
                                  variant="secondary"
                                  className="h-9 w-9 px-0"
                                  title="Editar subcategoria"
                                  aria-label="Editar subcategoria"
                                >
                                  <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              }
                            >
                              <SubcategoryForm
                                action={updateSubcategory}
                                categories={categoryOptions}
                                submitLabel="Salvar"
                                subcategory={{
                                  id: subcategory.id,
                                  categoria_id: subcategory.categoria_id,
                                  nome: subcategory.nome,
                                  descricao: subcategory.descricao,
                                }}
                              />
                            </ModalPanel>
                            <form action={toggleSubcategoryStatus}>
                              <input type="hidden" name="id" value={subcategory.id} />
                              <input
                                type="hidden"
                                name="ativo"
                                value={subcategory.ativo ? "false" : "true"}
                              />
                              <Button
                                type="submit"
                                variant="secondary"
                                className="h-9 w-9 px-0"
                                title={subcategory.ativo ? "Inativar" : "Reativar"}
                                aria-label={
                                  subcategory.ativo
                                    ? "Inativar subcategoria"
                                    : "Reativar subcategoria"
                                }
                              >
                                <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                <span className="sr-only">
                                  {subcategory.ativo ? "Inativar" : "Reativar"}
                                </span>
                              </Button>
                            </form>
                            <form action={deleteSubcategory}>
                              <input type="hidden" name="id" value={subcategory.id} />
                              <Button
                                type="submit"
                                variant="danger"
                                className="h-9 w-9 px-0"
                                title="Remover"
                                aria-label="Remover subcategoria"
                              >
                                <Trash2 className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </form>
                          </div>
                          <details className="relative sm:hidden">
                            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
                              <MoreHorizontal className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                              <span className="sr-only">Abrir acoes</span>
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 flex min-w-44 flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                              <ModalPanel
                                title="Editar subcategoria"
                                trigger={
                                  <Button variant="ghost" className="h-9 w-full justify-start px-3">
                                    <Pencil className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                    Editar
                                  </Button>
                                }
                              >
                                <SubcategoryForm
                                  action={updateSubcategory}
                                  categories={categoryOptions}
                                  submitLabel="Salvar"
                                  subcategory={{
                                    id: subcategory.id,
                                    categoria_id: subcategory.categoria_id,
                                    nome: subcategory.nome,
                                    descricao: subcategory.descricao,
                                  }}
                                />
                              </ModalPanel>
                              <form action={toggleSubcategoryStatus}>
                                <input type="hidden" name="id" value={subcategory.id} />
                                <input
                                  type="hidden"
                                  name="ativo"
                                  value={subcategory.ativo ? "false" : "true"}
                                />
                                <Button type="submit" variant="ghost" className="h-9 w-full justify-start px-3">
                                  <RotateCcw className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                  {subcategory.ativo ? "Inativar" : "Reativar"}
                                </Button>
                              </form>
                              <form action={deleteSubcategory}>
                                <input type="hidden" name="id" value={subcategory.id} />
                                <Button type="submit" variant="danger" className="h-9 w-full justify-start px-3">
                                  <Trash2 className="h-4 w-4 stroke-[2.4]" aria-hidden="true" />
                                  Remover
                                </Button>
                              </form>
                            </div>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </PageShell>
  );
}
