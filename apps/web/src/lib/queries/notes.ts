import type { SupabaseClient } from "@supabase/supabase-js";
import type { Note } from "@wayfare/types";
import { snakeToCamel, snakeToCamelArray } from "@wayfare/utils";

/**
 * v1 note content shape — plain text only. `content` is jsonb so this can
 * grow into a real rich-text document (Tiptap JSON) later without a
 * migration; every reader/writer should go through this shape until then.
 */
export interface PlainNoteContent {
  text: string;
}

export function readNoteText(content: unknown): string {
  if (content && typeof content === "object" && "text" in content) {
    return String((content as PlainNoteContent).text ?? "");
  }
  return "";
}

export async function fetchNotes(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return snakeToCamelArray<Note>(data ?? []);
}

export async function createNote(supabase: SupabaseClient, userId: string, title: string, text: string) {
  const { data, error } = await supabase
    .from("notes")
    .insert({ user_id: userId, title, content: { text } satisfies PlainNoteContent, tags: [] })
    .select()
    .single();
  if (error) throw error;
  return snakeToCamel<Note>(data);
}

export async function updateNote(supabase: SupabaseClient, noteId: string, title: string, text: string) {
  const { error } = await supabase
    .from("notes")
    .update({ title, content: { text } satisfies PlainNoteContent })
    .eq("id", noteId);
  if (error) throw error;
}

export async function togglePinNote(supabase: SupabaseClient, noteId: string, isPinned: boolean) {
  const { error } = await supabase.from("notes").update({ is_pinned: isPinned }).eq("id", noteId);
  if (error) throw error;
}

export async function deleteNote(supabase: SupabaseClient, noteId: string) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}
