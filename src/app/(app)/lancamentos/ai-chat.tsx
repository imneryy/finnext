"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import {
  TransactionForm,
  type SubcategoryOption,
  type TransactionFormData,
} from "@/app/(app)/lancamentos/transaction-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toDateInputValue } from "@/lib/format";

type Sugestao = {
  valor: number;
  descricao: string;
  tipo: "receita" | "despesa";
  data: string;
  confianca?: number;
};

type AiChatProps = {
  action: (formData: FormData) => Promise<void>;
  subcategories: SubcategoryOption[];
};

function sugestaoParaFormulario(sugestao: Sugestao): TransactionFormData {
  return {
    id: "",
    tipo: sugestao.tipo,
    origem: "extra",
    valor: String(sugestao.valor),
    data: sugestao.data,
    descricao: sugestao.descricao,
    subcategoria_id: null,
    tags: [],
  };
}

export function AiChat({ action, subcategories }: AiChatProps) {
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestao, setSugestao] = useState<Sugestao | null>(null);

  async function interpretar() {
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/ia/extrair-lancamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, hoje: toDateInputValue() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Nao foi possivel interpretar a mensagem.");
      }

      setSugestao(data as Sugestao);
    } catch (e) {
      setSugestao(null);
      setErro(e instanceof Error ? e.message : "Erro ao interpretar.");
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!carregando && texto.trim().length >= 3) {
        void interpretar();
      }
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--primary)]">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Lancar com IA
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Descreva em uma frase e a IA preenche o lancamento para voce revisar.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ex.: "gastei 200 reais num jantar"'
          disabled={carregando}
        />
        <Button
          type="button"
          onClick={() => void interpretar()}
          disabled={carregando || texto.trim().length < 3}
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {carregando ? "Interpretando..." : "Interpretar"}
        </Button>
      </div>

      {erro ? (
        <p className="mt-2 text-sm font-medium text-[var(--danger)]">{erro}</p>
      ) : null}

      {sugestao ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Revise os dados sugeridos, ajuste origem, subcategoria ou tags e salve.
          </p>
          <TransactionForm
            key={`${sugestao.descricao}-${sugestao.valor}-${sugestao.data}`}
            action={action}
            subcategories={subcategories}
            submitLabel="Criar lancamento"
            transaction={sugestaoParaFormulario(sugestao)}
          />
        </div>
      ) : null}
    </section>
  );
}
