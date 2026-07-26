"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  redirect(`/configuracoes?${type}=${encodeURIComponent(message)}`);
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  const nomeCompleto = formValue(formData, "nome_completo");

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: nomeCompleto || null,
    },
  });

  if (authError) {
    redirectWithMessage("error", getFriendlyErrorMessage(authError));
  }

  const { error } = await supabase.from("preferencias_usuario").upsert({
    usuario_id: user.id,
    nome_completo: nomeCompleto || null,
  });

  if (error) {
    redirectWithMessage("error", getFriendlyErrorMessage(error));
  }

  revalidatePath("/configuracoes");
  redirectWithMessage("success", "Perfil atualizado.");
}

export async function updatePreferences(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  const resumoMensalEmail = formData.get("resumo_mensal_email") === "on";
  const alertaOrcamentoEmail = formData.get("alerta_orcamento_email") === "on";
  const alertaOrcamentoPercentual = Number(
    formValue(formData, "alerta_orcamento_percentual") || 80,
  );

  if (
    !Number.isInteger(alertaOrcamentoPercentual) ||
    alertaOrcamentoPercentual < 1 ||
    alertaOrcamentoPercentual > 100
  ) {
    redirectWithMessage("error", "Percentual de alerta deve estar entre 1 e 100.");
  }

  const { error } = await supabase.from("preferencias_usuario").upsert({
    usuario_id: user.id,
    resumo_mensal_email: resumoMensalEmail,
    alerta_orcamento_email: alertaOrcamentoEmail,
    alerta_orcamento_percentual: alertaOrcamentoPercentual,
  });

  if (error) {
    redirectWithMessage("error", getFriendlyErrorMessage(error));
  }

  revalidatePath("/configuracoes");
  redirectWithMessage("success", "Preferencias salvas.");
}
