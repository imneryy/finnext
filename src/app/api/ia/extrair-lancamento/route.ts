import { NextResponse } from "next/server";

import { extrairLancamento } from "@/lib/ai/openai";
import { toDateInputValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const MAX_TEXT_LENGTH = 500;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";

  if (texto.length < 3) {
    return NextResponse.json({ error: "Mensagem muito curta." }, { status: 400 });
  }

  if (texto.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Mensagem muito longa. Seja mais direto." },
      { status: 400 },
    );
  }

  // "hoje" e calculado no cliente (fuso do usuario) e serve de referencia para
  // a IA resolver datas relativas. Caimos no relogio do servidor se vier ausente.
  const hoje =
    typeof body?.hoje === "string" && ISO_DATE.test(body.hoje)
      ? body.hoje
      : toDateInputValue();

  try {
    const extraido = await extrairLancamento(texto, hoje);
    const data = extraido.data && ISO_DATE.test(extraido.data) ? extraido.data : hoje;

    return NextResponse.json({
      ...extraido,
      data,
    });
  } catch (error) {
    console.error("Falha ao extrair lancamento com IA:", error);
    return NextResponse.json(
      { error: "Nao consegui entender. Tente descrever de novo." },
      { status: 502 },
    );
  }
}
