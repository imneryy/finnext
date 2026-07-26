import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-10 text-[var(--foreground)]">
      <section className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center text-xl font-bold text-[var(--primary)]"
        >
          Finnext
        </Link>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          {children}
        </div>
      </section>
    </main>
  );
}
