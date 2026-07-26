import Link from "next/link";

import { ErrorState } from "@/components/ui/error-state";

type AuthErrorPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { message } = await searchParams;

  return (
    <div className="space-y-5">
      <ErrorState
        title="Falha de autenticacao"
        message={message ?? "Nao foi possivel concluir o fluxo de autenticacao."}
      />
      <Link className="block text-center text-sm font-semibold text-[var(--primary)]" href="/auth/login">
        Voltar ao login
      </Link>
    </div>
  );
}
