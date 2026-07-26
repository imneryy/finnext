import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-[var(--app-bg)] px-6 py-16 text-[var(--foreground)]">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase text-[var(--primary)]">
          Finnext
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-[var(--primary)] sm:text-5xl">
          Base tecnica pronta para o controle financeiro pessoal.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Projeto inicial em Next.js com TypeScript, preparado para Supabase,
          Vercel e as proximas tasks de implementacao do produto.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
            href="/auth/login"
          >
            Entrar
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--accent-soft)]"
            href="/dashboard"
          >
            Abrir dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
