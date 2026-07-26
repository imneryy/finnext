import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const [
    { data: categorias },
    { data: subcategorias },
    { data: lancamentos },
    { data: receitasBase },
    { data: orcamentos },
    { data: preferencias },
  ] = await Promise.all([
    supabase.from("categorias").select("*").order("ordem", { ascending: true }),
    supabase.from("subcategorias").select("*").order("nome", { ascending: true }),
    supabase.from("lancamentos").select("*").order("data", { ascending: false }),
    supabase.from("receitas_base").select("*").order("ano", { ascending: false }),
    supabase.from("orcamentos").select("*").order("ano", { ascending: false }),
    supabase
      .from("preferencias_usuario")
      .select("*")
      .eq("usuario_id", user.id)
      .maybeSingle(),
  ]);

  const payload = {
    formato: "finnext-export",
    versao: 1,
    gerado_em: new Date().toISOString(),
    usuario: {
      id: user.id,
      email: user.email,
    },
    dados: {
      categorias: categorias ?? [],
      subcategorias: subcategorias ?? [],
      lancamentos: lancamentos ?? [],
      receitas_base: receitasBase ?? [],
      orcamentos: orcamentos ?? [],
      preferencias: preferencias ?? null,
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename="finnext-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
