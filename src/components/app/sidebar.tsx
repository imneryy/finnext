"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderTree,
  Home,
  LogOut,
  Menu,
  PiggyBank,
  ReceiptText,
  Settings,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/lancamentos", label: "Lancamentos", icon: ReceiptText },
  { href: "/categorias", label: "Categorias", icon: FolderTree },
  { href: "/orcamentos", label: "Orcamentos", icon: PiggyBank },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

type SidebarProps = {
  signOutAction: () => Promise<void>;
};

export function Sidebar({ signOutAction }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold text-[var(--foreground)]">
              Finnext
            </span>
            <span className="block text-xs text-[var(--muted)]">
              Financas pessoais
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-3" aria-label="Principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors",
                active
                  ? "bg-[var(--accent)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--primary)]",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:hidden">
        <Link href="/dashboard" className="text-sm font-bold text-[var(--primary)]">
          Finnext
        </Link>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--primary)] hover:bg-[var(--accent-soft)]"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[var(--app-bg)] lg:block">
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-[var(--app-bg)] shadow-xl">
            <div className="absolute right-3 top-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--primary)] hover:bg-[var(--accent-soft)]"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
