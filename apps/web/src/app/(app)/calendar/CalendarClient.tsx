"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchEventsInRange, createEvent, deleteEvent } from "@/lib/queries/calendar";
import { getLocalDateString } from "@luma/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayIso = useMemo(() => getLocalDateString(new Date(), timezone), [timezone]);

  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayIso.split("-").map(Number);
    return { year: y!, month: m! }; // month is 1-12
  });
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [allDay, setAllDay] = useState(false);

  const monthStart = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-01T00:00:00.000Z`;
  const nextMonth = cursor.month === 12 ? { year: cursor.year + 1, month: 1 } : { year: cursor.year, month: cursor.month + 1 };
  const monthEnd = `${nextMonth.year}-${String(nextMonth.month).padStart(2, "0")}-01T00:00:00.000Z`;

  const eventsQuery = useQuery({
    queryKey: ["calendar_events", userId, cursor.year, cursor.month],
    queryFn: () => fetchEventsInRange(supabase, userId, monthStart, monthEnd),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["calendar_events", userId] });

  const addEvent = useMutation({
    mutationFn: () => {
      const startAt = allDay ? `${selectedDate}T00:00:00.000Z` : new Date(`${selectedDate}T${time}:00`).toISOString();
      const endAt = allDay ? `${selectedDate}T23:59:59.000Z` : new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString();
      return createEvent(supabase, userId, { title: title.trim(), startAt, endAt, allDay });
    },
    onSuccess: () => {
      setTitle("");
      setShowForm(false);
      invalidate();
    },
  });

  const removeEvent = useMutation({ mutationFn: (id: string) => deleteEvent(supabase, id), onSuccess: invalidate });

  const eventsByDate = useMemo(() => {
    const events = eventsQuery.data ?? [];
    const map = new Map<string, typeof events>();
    for (const ev of events) {
      const day = getLocalDateString(new Date(ev.startAt), timezone);
      const list = map.get(day) ?? [];
      list.push(ev);
      map.set(day, list);
    }
    return map;
  }, [eventsQuery.data, timezone]);

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor]);
  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setCursor((c) => shiftMonth(c, -1))}>
            ←
          </Button>
          <p className="w-32 text-center font-display text-base text-ink">{monthLabel(cursor.year, cursor.month)}</p>
          <Button size="sm" variant="ghost" onClick={() => setCursor((c) => shiftMonth(c, 1))}>
            →
          </Button>
        </div>
      </header>

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-faint">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const dayEvents = eventsByDate.get(cell.iso) ?? [];
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedDate(cell.iso)}
                className={clsx(
                  "focus-ring flex h-16 flex-col items-center justify-start rounded-xl2 border p-1 text-xs transition-colors",
                  cell.iso === selectedDate ? "border-accent bg-accent/10" : "border-transparent hover:border-border",
                  !cell.inMonth && "opacity-35",
                )}
              >
                <span className={cell.iso === todayIso ? "flex h-5 w-5 items-center justify-center rounded-full bg-accent text-paper" : "text-ink-soft"}>
                  {cell.day}
                </span>
                {dayEvents.length > 0 && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-ink-faint">{selectedDate}</p>
          <Button size="sm" variant="secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add event"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-3 space-y-3">
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                All day
              </label>
              {!allDay && <TextField label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />}
            </div>
            <Button
              onClick={() => {
                if (title.trim()) addEvent.mutate();
              }}
              disabled={addEvent.isPending}
            >
              {addEvent.isPending ? "Saving…" : "Save event"}
            </Button>
          </Card>
        )}

        {selectedEvents.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Nothing scheduled.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {selectedEvents.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-ink">{ev.title}</p>
                  {!ev.allDay && (
                    <p className="text-xs text-ink-faint">
                      {new Date(ev.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => removeEvent.mutate(ev.id)} className="focus-ring text-xs text-ink-faint hover:text-red-500">
                  Remove
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function shiftMonth(cursor: { year: number; month: number }, delta: number) {
  let month = cursor.month + delta;
  let year = cursor.year;
  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }
  return { year, month };
}

function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

interface MonthCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

function buildMonthCells(year: number, month: number): MonthCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const leading = firstOfMonth.getUTCDay();
  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - leading);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i);
    return {
      iso: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1,
    };
  });
}
