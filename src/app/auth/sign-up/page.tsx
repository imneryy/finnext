import Link from "next/link";

import { SignUpForm } from "@/app/auth/sign-up/sign-up-form";

export default function SignUpPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">Criar conta</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Comece com e-mail e senha. Se a confirmacao estiver habilitada no
        Supabase, voce recebera um link por e-mail.
      </p>

      <SignUpForm />

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Ja possui conta?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/auth/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
