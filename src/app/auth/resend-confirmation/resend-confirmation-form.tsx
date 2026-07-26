"use client";

import { useActionState } from "react";

import { resendConfirmation } from "@/app/auth/actions";
import { AuthFormSubmit } from "@/app/auth/auth-form-status";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";

type ResendConfirmationFormProps = {
  initialEmail?: string;
  compact?: boolean;
};

export function ResendConfirmationForm({
  initialEmail,
  compact = false,
}: ResendConfirmationFormProps) {
  const [state, action] = useActionState(resendConfirmation, {
    email: initialEmail,
  });

  return (
    <>
      {state.error ? (
        <Toast tone="error" className="mt-5">
          {state.error}
        </Toast>
      ) : null}
      {state.success ? (
        <Toast tone="success" className="mt-5">
          {state.success}
        </Toast>
      ) : null}
      <form action={action} className={compact ? "mt-5 space-y-3" : "mt-6 space-y-4"}>
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
        <AuthFormSubmit>Reenviar confirmacao</AuthFormSubmit>
      </form>
    </>
  );
}
