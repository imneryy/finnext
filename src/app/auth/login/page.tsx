import Link from "next/link";

import { LoginForm } from "@/app/auth/login/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">Entrar</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Acesse sua conta para continuar o controle financeiro.
      </p>

      <LoginForm redirectTo={redirectTo ?? "/dashboard"} />

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Ainda nao tem conta?{" "}
        <Link className="font-semibold text-[var(--primary)]" href="/auth/sign-up">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
