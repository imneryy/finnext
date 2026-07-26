"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authSchemas } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { getFriendlyErrorMessage } from "@/lib/errors";

export type AuthFormState = {
  error?: string;
  success?: string;
  email?: string;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function getOrigin() {
  const headerStore = await headers();
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.APP_URL;
  const requestOrigin = headerStore.get("origin");
  const forwardedHost =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  if (requestOrigin && !isLocalOrigin(requestOrigin)) {
    return normalizeOrigin(requestOrigin);
  }

  if (forwardedHost && !forwardedHost.startsWith("localhost")) {
    return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
  }

  if (vercelUrl) {
    return normalizeOrigin(`https://${vercelUrl}`);
  }

  return requestOrigin ?? "http://localhost:3000";
}

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return value.startsWith("http://localhost") || value.startsWith("http://127.0.0.1");
  }
}

function sanitizeRedirectTo(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formValue(formData, "email").trim();
  const password = formValue(formData, "password");
  const redirectTo = sanitizeRedirectTo(
    formValue(formData, "redirectTo") || "/dashboard",
  );

  const parsed = authSchemas.login.safeParse({ email, password });

  if (!parsed.success) {
    return {
      email,
      error: parsed.error.issues[0]?.message ?? "Revise os dados de login.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      email,
      error: getFriendlyErrorMessage(error),
    };
  }

  const { error: onboardingError } = await supabase.rpc(
    "criar_categorias_padrao",
  );

  if (onboardingError) {
    console.error("criar_categorias_padrao failed", onboardingError.message);
  }

  redirect(redirectTo);
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formValue(formData, "email").trim();
  const password = formValue(formData, "password");
  const confirmPassword = formValue(formData, "confirmPassword");

  const parsed = authSchemas.signUp.safeParse({
    email,
    password,
    confirmPassword,
  });

  if (!parsed.success) {
    return {
      email,
      error: parsed.error.issues[0]?.message ?? "Revise os dados do cadastro.",
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      email,
      error: getFriendlyErrorMessage(error),
    };
  }

  if (data.session) {
    const { error: onboardingError } = await supabase.rpc(
      "criar_categorias_padrao",
    );

    if (onboardingError) {
      console.error("criar_categorias_padrao failed", onboardingError.message);
    }
  }

  redirect(`/auth/sign-up-success?email=${encodeURIComponent(email)}`);
}

export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formValue(formData, "email").trim();
  const parsed = z.string().email("Informe um e-mail valido.").safeParse(email);

  if (!parsed.success) {
    return { email, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { email, error: getFriendlyErrorMessage(error) };
  }

  return {
    email,
    success: "Enviamos as instrucoes de recuperacao para o seu e-mail.",
  };
}

export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = formValue(formData, "password");
  const confirmPassword = formValue(formData, "confirmPassword");

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas nao coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: getFriendlyErrorMessage(error) };
  }

  redirect("/dashboard");
}

export async function resendConfirmation(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formValue(formData, "email").trim();
  const parsed = z.string().email("Informe um e-mail valido.").safeParse(email);

  if (!parsed.success) {
    return { email, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { email, error: getFriendlyErrorMessage(error) };
  }

  return { email, success: "E-mail de confirmacao reenviado." };
}

export async function dismissOnboarding() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  await supabase.from("preferencias_usuario").upsert({
    usuario_id: user.id,
    onboarding_concluido: true,
  });

  revalidatePath("/dashboard");
}
