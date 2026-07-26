"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { signUp } from "@/app/auth/actions";
import { AuthFormSubmit } from "@/app/auth/auth-form-status";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, {});

  return (
    <>
      {state.error ? (
        <Toast tone="error" className="mt-5">
          {state.error}
        </Toast>
      ) : null}

      <form action={action} className="mt-6 space-y-4">
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Confirmar senha
          </span>
          <Input
            className="mt-1"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <AuthFormSubmit>Criar conta</AuthFormSubmit>
      </form>
    </>
  );
}
