import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { getSupabaseEnv } from "@/lib/env";

const privateRoutes = [
  "/dashboard",
  "/lancamentos",
  "/categorias",
  "/orcamentos",
  "/relatorios",
  "/configuracoes",
];

const authRoutes = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/error",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/resend-confirmation",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let supabaseUrl: string;
  let supabaseAnonKey: string;

  try {
    const env = getSupabaseEnv();
    supabaseUrl = env.supabaseUrl;
    supabaseAnonKey = env.supabaseAnonKey;
  } catch {
    if (isPrivateRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set(
        "redirectTo",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({
    data: { user: null },
  }));

  if (isPrivateRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set(
      "redirectTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthRoute &&
    user &&
    pathname !== "/auth/sign-up-success" &&
    pathname !== "/auth/update-password"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
