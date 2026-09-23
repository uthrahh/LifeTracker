import type { SupabaseClient } from "@supabase/supabase-js";
import type { Habit } from "@wayfare/types";
import type { CreateHabitInput } from "@wayfare/validation";
import { snakeToCamel } from "@wayfare/utils";

export async function createHabit(supabase: SupabaseClient, userId: string, input: CreateHabitInput) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      title: input.title,
      category_id: input.categoryId ?? null,
      frequency: input.frequency,
      target_streak: input.targetStreak ?? null,
      start_date: input.startDate,
      reminder_at: input.reminderAt ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return snakeToCamel<Habit>(data);
}

export async function archiveHabit(supabase: SupabaseClient, habitId: string) {
  const { error } = await supabase.from("habits").update({ status: "archived" }).eq("id", habitId);
  if (error) throw error;
}

export async function deleteHabit(supabase: SupabaseClient, habitId: string) {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) throw error;
}
