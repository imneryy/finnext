"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { getSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
