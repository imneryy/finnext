"use client";

import { useActionState } from "react";

import { updatePassword } from "@/app/auth/actions";
import { AuthFormSubmit } from "@/app/auth/auth-form-status";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, {});

  return (
    <>
      {state.error ? (
        <Toast tone="error" className="mt-5">
          {state.error}
        </Toast>
      ) : null}
      <form action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--foreground)]">Nova senha</span>
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
            Confirmar nova senha
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
        <AuthFormSubmit>Salvar senha</AuthFormSubmit>
      </form>
    </>
  );
}
