import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type CategoryOption = {
  id: string;
  nome: string;
};

export type CategoryFormData = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  ordem: number;
};

export type SubcategoryFormData = {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
};

type CategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  category?: CategoryFormData;
};

export function CategoryForm({ action, submitLabel, category }: CategoryFormProps) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Nome</span>
        <Input className="mt-1" name="nome" defaultValue={category?.nome ?? ""} required />
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Descricao</span>
        <Input
          className="mt-1"
          name="descricao"
          defaultValue={category?.descricao ?? ""}
        />
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Cor</span>
        <Input
          className="mt-1"
          name="cor"
          type="color"
          defaultValue={category?.cor ?? "#64748b"}
        />
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Ordem</span>
        <Input
          className="mt-1"
          name="ordem"
          type="number"
          min="1"
          placeholder="Auto"
          defaultValue={category?.ordem}
          required={Boolean(category)}
        />
      </label>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

type SubcategoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: CategoryOption[];
  submitLabel: string;
  categoryId?: string;
  subcategory?: SubcategoryFormData;
};

export function SubcategoryForm({
  action,
  categories,
  submitLabel,
  categoryId,
  subcategory,
}: SubcategoryFormProps) {
  const selectedCategoryId = subcategory?.categoria_id ?? categoryId ?? "";

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {subcategory ? <input type="hidden" name="id" value={subcategory.id} /> : null}
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">Categoria</span>
        <Select className="mt-1" name="categoria_id" defaultValue={selectedCategoryId} required>
          <option value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nome}
            </option>
          ))}
        </Select>
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Nome</span>
        <Input
          className="mt-1"
          name="nome"
          defaultValue={subcategory?.nome ?? ""}
          required
        />
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Descricao</span>
        <Input
          className="mt-1"
          name="descricao"
          defaultValue={subcategory?.descricao ?? ""}
        />
      </label>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
