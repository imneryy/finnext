"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
  competence?: { mes: number; ano: number },
): never {
  const search = new URLSearchParams({
    [type]: message,
  });

  if (competence) {
    search.set("mes", String(competence.mes));
    search.set("ano", String(competence.ano));
  }

  redirect(`/orcamentos?${search.toString()}`);
}

function parseCompetence(formData: FormData) {
  const mes = Number(formValue(formData, "mes"));
  const ano = Number(formValue(formData, "ano"));

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    redirectWithMessage("error", "Mes invalido.");
  }

  if (!Number.isInteger(ano) || ano < 2020) {
    redirectWithMessage("error", "Ano invalido.");
  }

  return { mes, ano };
}

function friendlyDatabaseError(error: unknown) {
  const message = getFriendlyErrorMessage(error);

  if (message.includes("Total planejado excede")) {
    return "Total planejado excede a receita-base.";
  }

  if (message.includes("Competencia destino ja possui")) {
    return "Competencia destino ja possui orcamento.";
  }

  if (message.includes("Subcategoria invalida")) {
    return "Uma das subcategorias selecionadas nao esta ativa ou nao pertence a sua conta.";
  }

  return message;
}

export async function saveBudget(formData: FormData) {
  const supabase = await createClient();
  const { mes, ano } = parseCompetence(formData);
  const receitaBase = Number(formValue(formData, "receita_base") || 0);
  const alocacoesRaw = formValue(formData, "alocacoes");

  if (!Number.isFinite(receitaBase) || receitaBase < 0) {
    redirectWithMessage("error", "Receita-base deve ser maior ou igual a zero.");
  }

  let alocacoes: Json;
  let alocacoesSelecionadas: Array<{ subcategoria_id: string; valor_planejado: number }>;

  try {
    const parsed = JSON.parse(alocacoesRaw || "[]");

    if (!Array.isArray(parsed)) {
      redirectWithMessage("error", "Alocacoes invalidas.", { mes, ano });
    }

    alocacoesSelecionadas = parsed
      .filter(
        (item): item is { subcategoria_id: string; valor_planejado: number } =>
          typeof item === "object" &&
          item !== null &&
          typeof item.subcategoria_id === "string" &&
          Number.isFinite(Number(item.valor_planejado)),
      )
      .map((item) => ({
        subcategoria_id: item.subcategoria_id,
        valor_planejado: Number(item.valor_planejado),
      }));
    alocacoes = alocacoesSelecionadas;
  } catch {
    redirectWithMessage("error", "Alocacoes invalidas.", { mes, ano });
  }

  const { error } = await supabase.rpc("salvar_orcamento_mensal", {
    p_mes: mes,
    p_ano: ano,
    p_receita_base: receitaBase,
    p_alocacoes: alocacoes,
  });

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error), { mes, ano });
  }

  const subcategoryIds = alocacoesSelecionadas.map((allocation) => allocation.subcategoria_id);

  if (subcategoryIds.length > 0) {
    const { count, error: verificationError } = await supabase
      .from("orcamentos")
      .select("id", { count: "exact", head: true })
      .eq("mes", mes)
      .eq("ano", ano)
      .eq("ativo", true)
      .in("subcategoria_id", subcategoryIds);

    if (verificationError) {
      redirectWithMessage("error", friendlyDatabaseError(verificationError), { mes, ano });
    }

    if ((count ?? 0) < subcategoryIds.length) {
      redirectWithMessage(
        "error",
        "O banco ainda nao esta salvando categorias com valor zero. Rode a migration mais recente do Supabase e tente novamente.",
        { mes, ano },
      );
    }
  }

  revalidatePath("/orcamentos");
  revalidatePath("/dashboard");
  redirect(`/orcamentos?mes=${mes}&ano=${ano}&success=${encodeURIComponent("Orcamento salvo.")}`);
}

export async function duplicateBudget(formData: FormData) {
  const supabase = await createClient();
  const mesOrigem = Number(formValue(formData, "mes_origem"));
  const anoOrigem = Number(formValue(formData, "ano_origem"));
  const mesDestino = Number(formValue(formData, "mes_destino"));
  const anoDestino = Number(formValue(formData, "ano_destino"));

  const { error } = await supabase.rpc("duplicar_orcamento_mensal", {
    p_mes_origem: mesOrigem,
    p_ano_origem: anoOrigem,
    p_mes_destino: mesDestino,
    p_ano_destino: anoDestino,
  });

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/orcamentos");
  revalidatePath("/dashboard");
  redirect(
    `/orcamentos?mes=${mesDestino}&ano=${anoDestino}&success=${encodeURIComponent("Orcamento duplicado.")}`,
  );
}
