import Link from "next/link";

import { ForgotPasswordForm } from "@/app/auth/forgot-password/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">Recuperar senha</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Informe seu e-mail para receber o link de redefinicao de senha.
      </p>
      <ForgotPasswordForm />
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Lembrou a senha?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/auth/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
