"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchNotes, createNote, updateNote, togglePinNote, deleteNote, readNoteText } from "@/lib/queries/notes";
import type { Note } from "@wayfare/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";

export function NotesClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  const notesQuery = useQuery({ queryKey: ["notes", userId], queryFn: () => fetchNotes(supabase, userId) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notes", userId] });

  const create = useMutation({
    mutationFn: () => createNote(supabase, userId, newTitle.trim() || "Untitled", newText),
    onSuccess: () => {
      setNewTitle("");
      setNewText("");
      setShowForm(false);
      invalidate();
    },
  });

  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data]);
  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q) || readNoteText(n.content).toLowerCase().includes(q));
  }, [notes, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Notes</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New note"}
        </Button>
      </header>

      {notes.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="focus-ring h-11 w-full rounded-xl2 border border-border bg-paper-raised px-4 text-sm"
        />
      )}

      {showForm && (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <TextField label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Textarea label="Note" value={newText} onChange={(e) => setNewText(e.target.value)} rows={4} />
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Save note"}
            </Button>
          </form>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <p className="font-display text-lg text-ink">{search ? "No notes match." : "Nothing written down yet."}</p>
          {!search && <p className="mt-1 text-sm text-ink-soft">Capture a thought before it slips away.</p>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} onChanged={invalidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onChanged }: { note: Note; onChanged: () => void }) {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(readNoteText(note.content));

  const save = useMutation({
    mutationFn: () => updateNote(supabase, note.id, title.trim() || "Untitled", text),
    onSuccess: () => {
      setIsEditing(false);
      onChanged();
    },
  });
  const togglePin = useMutation({ mutationFn: () => togglePinNote(supabase, note.id, !note.isPinned), onSuccess: onChanged });
  const remove = useMutation({ mutationFn: () => deleteNote(supabase, note.id), onSuccess: onChanged });

  if (isEditing) {
    return (
      <Card className="space-y-3">
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Note" value={text} onChange={(e) => setText(e.target.value)} rows={5} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => setIsEditing(true)} className="focus-ring flex-1 text-left">
          <p className="font-display text-base text-ink">{note.title || "Untitled"}</p>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-ink-soft">{readNoteText(note.content)}</p>
        </button>
        <button type="button" onClick={() => togglePin.mutate()} aria-label={note.isPinned ? "Unpin" : "Pin"} className="focus-ring text-ink-faint hover:text-accent">
          {note.isPinned ? "★" : "☆"}
        </button>
      </div>
      <button type="button" onClick={() => remove.mutate()} className="focus-ring mt-3 text-xs text-ink-faint hover:text-red-500">
        Delete
      </button>
    </Card>
  );
}
