import Link from "next/link";

import { ResendConfirmationForm } from "@/app/auth/resend-confirmation/resend-confirmation-form";

export default function ResendConfirmationPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">
        Reenviar confirmacao
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Informe seu e-mail para receber um novo link de confirmacao.
      </p>
      <ResendConfirmationForm />
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Ja confirmou?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/auth/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
