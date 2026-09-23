import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@wayfare/types";
import { snakeToCamelArray } from "@wayfare/utils";

/** Default (user_id null) categories plus the user's own, RLS-scoped. */
export async function fetchCategories(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return snakeToCamelArray<Category>(data ?? []);
}
