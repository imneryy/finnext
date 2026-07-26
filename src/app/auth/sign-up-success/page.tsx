import Link from "next/link";

import { ResendConfirmationForm } from "@/app/auth/resend-confirmation/resend-confirmation-form";

type SignUpSuccessPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function SignUpSuccessPage({
  searchParams,
}: SignUpSuccessPageProps) {
  const { email } = await searchParams;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">Conta criada</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Verifique seu e-mail caso a confirmacao esteja habilitada no Supabase.
        Depois, entre para acessar o dashboard.
      </p>
      <ResendConfirmationForm initialEmail={email} compact />
      <Link
        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
        href="/auth/login"
      >
        Ir para login
      </Link>
    </div>
  );
}
