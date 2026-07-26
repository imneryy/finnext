"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  redirect(`/lancamentos?${type}=${encodeURIComponent(message)}`);
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, usuarioId: user.id };
}

function friendlyDatabaseError(error: unknown) {
  const message = getFriendlyErrorMessage(error);

  if (message.includes("subcategoria informada nao pertence")) {
    return "A subcategoria selecionada nao pertence a sua conta.";
  }

  if (message.includes("violates row-level security")) {
    return "Voce nao tem permissao para alterar esse lancamento.";
  }

  return message;
}

function parseTransaction(formData: FormData) {
  const subcategoriaId = formValue(formData, "subcategoria_id");

  return transactionSchema.safeParse({
    tipo: formValue(formData, "tipo") || "despesa",
    origem: formValue(formData, "origem") || "extra",
    valor: formValue(formData, "valor"),
    data: formValue(formData, "data"),
    descricao: formValue(formData, "descricao"),
    subcategoria_id: subcategoriaId || null,
    tags: parseTags(formValue(formData, "tags")),
  });
}

export async function createTransaction(formData: FormData) {
  const { supabase, usuarioId } = await getCurrentUserId();
  const parsed = parseTransaction(formData);

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Lancamento invalido.");
  }

  const { error } = await supabase.from("lancamentos").insert({
    usuario_id: usuarioId,
    tipo: parsed.data.tipo,
    origem: parsed.data.origem,
    valor: parsed.data.valor,
    data: parsed.data.data,
    descricao: parsed.data.descricao,
    subcategoria_id: parsed.data.subcategoria_id ?? null,
    tags: parsed.data.tags,
    ativo: true,
  });

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirectWithMessage("success", "Lancamento criado.");
}

export async function updateTransaction(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");
  const parsed = parseTransaction(formData);

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Lancamento invalido.");
  }

  const { error } = await supabase
    .from("lancamentos")
    .update({
      tipo: parsed.data.tipo,
      origem: parsed.data.origem,
      valor: parsed.data.valor,
      data: parsed.data.data,
      descricao: parsed.data.descricao,
      subcategoria_id: parsed.data.subcategoria_id ?? null,
      tags: parsed.data.tags,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirectWithMessage("success", "Lancamento atualizado.");
}

export async function toggleTransactionStatus(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");
  const ativo = formValue(formData, "ativo") === "true";

  const { error } = await supabase
    .from("lancamentos")
    .update({ ativo })
    .eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirectWithMessage("success", ativo ? "Lancamento reativado." : "Lancamento inativado.");
}
