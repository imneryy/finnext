import Link from "next/link";
import { Download, Lock, Save } from "lucide-react";

import { updatePreferences, updateProfile } from "@/app/(app)/configuracoes/actions";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { Toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";

type ConfiguracoesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function ConfiguracoesPage({
  searchParams,
}: ConfiguracoesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: preferences } = user
    ? await supabase
        .from("preferencias_usuario")
        .select("*")
        .eq("usuario_id", user.id)
        .maybeSingle()
    : { data: null };
  const fullName =
    preferences?.nome_completo ??
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "");

  return (
    <PageShell
      title="Configuracoes"
      description="Gerencie perfil, preferencias, exportacao de dados e privacidade."
    >
      {params.success ? <Toast tone="success">{params.success}</Toast> : null}
      {params.error ? <Toast tone="error">{params.error}</Toast> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Conta" value={user?.email ?? "Sem e-mail"} detail="E-mail autenticado" />
        <MetricCard
          label="Resumo mensal"
          value={preferences?.resumo_mensal_email ? "Ativo" : "Inativo"}
          detail="Preferencia de comunicacao"
        />
        <MetricCard
          label="Alerta de orcamento"
          value={preferences?.alerta_orcamento_email ? "Ativo" : "Inativo"}
          detail={`${preferences?.alerta_orcamento_percentual ?? 80}% do planejado`}
        />
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--primary)]">Perfil</h2>
        <form action={updateProfile} className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label>
            <span className="text-sm font-semibold text-[var(--foreground)]">E-mail</span>
            <Input className="mt-1" value={user?.email ?? ""} readOnly />
          </label>
          <label>
            <span className="text-sm font-semibold text-[var(--foreground)]">Nome completo</span>
            <Input className="mt-1" name="nome_completo" defaultValue={fullName ?? ""} />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4" aria-hidden="true" />
              Salvar
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--primary)]">Preferencias</h2>
        <form action={updatePreferences} className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr_160px_auto]">
          <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
            <input
              name="resumo_mensal_email"
              type="checkbox"
              defaultChecked={preferences?.resumo_mensal_email ?? false}
              className="h-4 w-4"
            />
            <span className="text-sm text-[var(--foreground)]">Resumo mensal por e-mail</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
            <input
              name="alerta_orcamento_email"
              type="checkbox"
              defaultChecked={preferences?.alerta_orcamento_email ?? false}
              className="h-4 w-4"
            />
            <span className="text-sm text-[var(--foreground)]">Alerta de limite por e-mail</span>
          </label>
          <label>
            <span className="text-sm font-semibold text-[var(--foreground)]">Limiar</span>
            <Input
              className="mt-1"
              name="alerta_orcamento_percentual"
              type="number"
              min="1"
              max="100"
              defaultValue={preferences?.alerta_orcamento_percentual ?? 80}
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4" aria-hidden="true" />
              Salvar
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--primary)]">
              Exportacao de dados pessoais
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Baixe um JSON com categorias, subcategorias, lancamentos, receitas-base,
              orcamentos e preferencias.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--accent-soft)]"
            href="/configuracoes/export"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar JSON
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-5 py-4 text-[var(--danger)] shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Exclusao de conta
            </h2>
            <p className="mt-1 text-sm leading-5">
              Este fluxo permanece desabilitado ate existir confirmacao forte por
              senha recente ou link por e-mail.
            </p>
          </div>
          <Button type="button" variant="danger" disabled>
            Excluir conta
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
