import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/app/sidebar";
import { signOut } from "@/app/(app)/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient().catch(() => null);

  if (!supabase) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--foreground)]">
      <Sidebar signOutAction={signOut} />
      <main className="min-h-screen bg-[var(--content-bg)] px-3 py-4 sm:px-5 lg:ml-64 lg:rounded-l-[32px] lg:px-6 lg:py-6">
        <div className="mx-auto max-w-[1560px]">{children}</div>
      </main>
    </div>
  );
}
