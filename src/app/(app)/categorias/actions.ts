"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getFriendlyErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, subcategorySchema } from "@/lib/validations";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: string) {
  return value.length > 0 ? value : null;
}

function redirectWithMessage(type: "success" | "error", message: string): never {
  redirect(`/categorias?${type}=${encodeURIComponent(message)}`);
}

function friendlyDatabaseError(error: unknown) {
  const message = getFriendlyErrorMessage(error);

  if (
    message.includes("categorias_usuario_nome_unico_idx") ||
    message.includes("duplicate key")
  ) {
    return "Ja existe uma categoria ou subcategoria com esse nome.";
  }

  if (message.includes("violates row-level security")) {
    return "Voce nao tem permissao para alterar esse registro.";
  }

  if (message.includes("foreign key")) {
    return "Este registro possui vinculos e nao pode ser removido fisicamente.";
  }

  return message;
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

async function getNextCategoryOrder(usuarioId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categorias")
    .select("ordem")
    .eq("usuario_id", usuarioId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.ordem ?? 0) + 1;
}

export async function createCategory(formData: FormData) {
  const { supabase, usuarioId } = await getCurrentUserId();
  const ordemValue = formValue(formData, "ordem");
  const ordem = ordemValue ? Number(ordemValue) : await getNextCategoryOrder(usuarioId);

  const parsed = categorySchema.safeParse({
    nome: formValue(formData, "nome"),
    descricao: formValue(formData, "descricao"),
    cor: formValue(formData, "cor") || "#64748b",
    ordem,
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Categoria invalida.");
  }

  const { error } = await supabase.from("categorias").insert({
    usuario_id: usuarioId,
    nome: parsed.data.nome,
    descricao: nullableText(parsed.data.descricao ?? ""),
    cor: parsed.data.cor,
    ordem: parsed.data.ordem,
    ativo: true,
  });

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Categoria criada.");
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");

  const parsed = categorySchema.safeParse({
    nome: formValue(formData, "nome"),
    descricao: formValue(formData, "descricao"),
    cor: formValue(formData, "cor") || "#64748b",
    ordem: formValue(formData, "ordem"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Categoria invalida.");
  }

  const { error } = await supabase
    .from("categorias")
    .update({
      nome: parsed.data.nome,
      descricao: nullableText(parsed.data.descricao ?? ""),
      cor: parsed.data.cor,
      ordem: parsed.data.ordem,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Categoria atualizada.");
}

export async function toggleCategoryStatus(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");
  const ativo = formValue(formData, "ativo") === "true";

  const { error } = await supabase.from("categorias").update({ ativo }).eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", ativo ? "Categoria reativada." : "Categoria inativada.");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");

  const { count, error: countError } = await supabase
    .from("subcategorias")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", id);

  if (countError) {
    redirectWithMessage("error", friendlyDatabaseError(countError));
  }

  if ((count ?? 0) > 0) {
    redirectWithMessage(
      "error",
      "Categoria com subcategorias nao pode ser excluida. Inative-a ou remova as subcategorias primeiro.",
    );
  }

  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Categoria excluida.");
}

export async function createSubcategory(formData: FormData) {
  const { supabase, usuarioId } = await getCurrentUserId();

  const parsed = subcategorySchema.safeParse({
    categoria_id: formValue(formData, "categoria_id"),
    nome: formValue(formData, "nome"),
    descricao: formValue(formData, "descricao"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Subcategoria invalida.");
  }

  const { data: category } = await supabase
    .from("categorias")
    .select("id, ativo")
    .eq("id", parsed.data.categoria_id)
    .maybeSingle();

  if (!category?.ativo) {
    redirectWithMessage("error", "Selecione uma categoria ativa.");
  }

  const { error } = await supabase.from("subcategorias").insert({
    usuario_id: usuarioId,
    categoria_id: parsed.data.categoria_id,
    nome: parsed.data.nome,
    descricao: nullableText(parsed.data.descricao ?? ""),
    ativo: true,
  });

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Subcategoria criada.");
}

export async function updateSubcategory(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");

  const parsed = subcategorySchema.safeParse({
    categoria_id: formValue(formData, "categoria_id"),
    nome: formValue(formData, "nome"),
    descricao: formValue(formData, "descricao"),
  });

  if (!parsed.success) {
    redirectWithMessage("error", parsed.error.issues[0]?.message ?? "Subcategoria invalida.");
  }

  const { data: category } = await supabase
    .from("categorias")
    .select("id, ativo")
    .eq("id", parsed.data.categoria_id)
    .maybeSingle();

  if (!category?.ativo) {
    redirectWithMessage("error", "Selecione uma categoria ativa.");
  }

  const { error } = await supabase
    .from("subcategorias")
    .update({
      categoria_id: parsed.data.categoria_id,
      nome: parsed.data.nome,
      descricao: nullableText(parsed.data.descricao ?? ""),
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Subcategoria atualizada.");
}

export async function toggleSubcategoryStatus(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");
  const ativo = formValue(formData, "ativo") === "true";

  const { error } = await supabase
    .from("subcategorias")
    .update({ ativo })
    .eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", ativo ? "Subcategoria reativada." : "Subcategoria inativada.");
}

export async function deleteSubcategory(formData: FormData) {
  const { supabase } = await getCurrentUserId();
  const id = formValue(formData, "id");

  const [{ count: lancamentosCount, error: lancamentosError }, { count: orcamentosCount, error: orcamentosError }] =
    await Promise.all([
      supabase
        .from("lancamentos")
        .select("id", { count: "exact", head: true })
        .eq("subcategoria_id", id),
      supabase
        .from("orcamentos")
        .select("id", { count: "exact", head: true })
        .eq("subcategoria_id", id),
    ]);

  if (lancamentosError || orcamentosError) {
    redirectWithMessage("error", friendlyDatabaseError(lancamentosError ?? orcamentosError));
  }

  if ((lancamentosCount ?? 0) > 0 || (orcamentosCount ?? 0) > 0) {
    const { error } = await supabase
      .from("subcategorias")
      .update({ ativo: false })
      .eq("id", id);

    if (error) {
      redirectWithMessage("error", friendlyDatabaseError(error));
    }

    revalidatePath("/categorias");
    redirectWithMessage(
      "success",
      "Subcategoria possui historico financeiro e foi inativada.",
    );
  }

  const { error } = await supabase.from("subcategorias").delete().eq("id", id);

  if (error) {
    redirectWithMessage("error", friendlyDatabaseError(error));
  }

  revalidatePath("/categorias");
  redirectWithMessage("success", "Subcategoria excluida.");
}
