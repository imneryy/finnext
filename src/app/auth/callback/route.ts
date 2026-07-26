import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { error: rpcError } = await supabase.rpc("criar_categorias_padrao");

      if (rpcError) {
        console.error("criar_categorias_padrao failed", rpcError.message);
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/auth/error?message=Link%20de%20autenticacao%20invalido.", requestUrl.origin),
  );
}
