"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { login } from "@/app/auth/actions";
import { AuthFormSubmit } from "@/app/auth/auth-form-status";
import { Toast } from "@/components/ui/toast";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, action] = useActionState(login, {});

  return (
    <>
      {state.error ? (
        <Toast tone="error" className="mt-5">
          {state.error}
        </Toast>
      ) : null}

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="block">
          <span className="text-sm font-semibold text-[var(--foreground)]">E-mail</span>
          <Input
            className="mt-1"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[var(--foreground)]">Senha</span>
          <Input
            className="mt-1"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <AuthFormSubmit>Entrar</AuthFormSubmit>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <Link className="font-semibold text-[var(--primary)]" href="/auth/forgot-password">
          Esqueci minha senha
        </Link>
        <Link className="font-semibold text-[var(--primary)]" href="/auth/resend-confirmation">
          Reenviar confirmacao
        </Link>
      </div>
    </>
  );
}
