import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendarEvent } from "@wayfare/types";
import { snakeToCamelArray } from "@wayfare/utils";

export async function fetchEventsInRange(supabase: SupabaseClient, userId: string, startIso: string, endIso: string) {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .gte("start_at", startIso)
    .lt("start_at", endIso)
    .order("start_at", { ascending: true });
  if (error) throw error;
  return snakeToCamelArray<CalendarEvent>(data ?? []);
}

export interface NewCalendarEventInput {
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
}

export async function createEvent(supabase: SupabaseClient, userId: string, input: NewCalendarEventInput) {
  const { error } = await supabase.from("calendar_events").insert({
    user_id: userId,
    title: input.title,
    start_at: input.startAt,
    end_at: input.endAt,
    all_day: input.allDay,
  });
  if (error) throw error;
}

export async function deleteEvent(supabase: SupabaseClient, eventId: string) {
  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);
  if (error) throw error;
}
