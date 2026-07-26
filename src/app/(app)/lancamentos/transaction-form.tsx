import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toDateInputValue } from "@/lib/format";

export type SubcategoryOption = {
  id: string;
  nome: string;
  categoria_nome: string;
};

export type TransactionFormData = {
  id: string;
  tipo: "receita" | "despesa";
  origem: "fixa" | "extra";
  valor: string;
  data: string;
  descricao: string;
  subcategoria_id: string | null;
  tags: string[];
};

type TransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  subcategories: SubcategoryOption[];
  submitLabel: string;
  transaction?: TransactionFormData;
};

function tagsToInput(tags: string[] | null) {
  return (tags ?? []).join(", ");
}

export function TransactionForm({
  action,
  subcategories,
  submitLabel,
  transaction,
}: TransactionFormProps) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Tipo</span>
        <Select className="mt-1" name="tipo" defaultValue={transaction?.tipo ?? "despesa"} required>
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </Select>
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Origem</span>
        <Select className="mt-1" name="origem" defaultValue={transaction?.origem ?? "extra"} required>
          <option value="extra">Extra</option>
          <option value="fixa">Fixa</option>
        </Select>
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Valor</span>
        <Input
          className="mt-1"
          name="valor"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={transaction?.valor ?? ""}
          required
        />
      </label>
      <label>
        <span className="text-sm font-semibold text-[var(--foreground)]">Data</span>
        <Input
          className="mt-1"
          name="data"
          type="date"
          defaultValue={transaction?.data ?? toDateInputValue()}
          required
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">Descricao</span>
        <Input
          className="mt-1"
          name="descricao"
          defaultValue={transaction?.descricao ?? ""}
          required
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">Subcategoria</span>
        <Select className="mt-1" name="subcategoria_id" defaultValue={transaction?.subcategoria_id ?? ""}>
          <option value="">Sem subcategoria</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.categoria_nome} / {subcategory.nome}
            </option>
          ))}
        </Select>
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-semibold text-[var(--foreground)]">Tags</span>
        <Input
          className="mt-1"
          name="tags"
          placeholder="Separadas por virgula"
          defaultValue={tagsToInput(transaction?.tags ?? [])}
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
