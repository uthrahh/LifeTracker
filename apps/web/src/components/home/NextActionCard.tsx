"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { RankedNextAction } from "@wayfare/utils";

export function NextActionCard({ ranked, onComplete }: { ranked: RankedNextAction[]; onComplete: (id: string, kind: "task" | "habit") => void }) {
  const [index, setIndex] = useState(0);

  if (ranked.length === 0) {
    return (
      <Card className="animate-rise-in">
        <p className="text-sm text-ink-faint">Nothing waiting on you right now.</p>
        <p className="font-display text-xl text-ink">What would make today feel worthwhile?</p>
      </Card>
    );
  }

  const current = ranked[index % ranked.length]!;

  return (
    <Card className="animate-rise-in">
      <p className="text-xs uppercase tracking-wide text-ink-faint">Start here</p>
      <p className="mt-1 font-display text-2xl text-ink">{current.candidate.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{current.reasons.join(" · ")}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => onComplete(current.candidate.id, current.candidate.kind)}>
          Mark done
        </Button>
        {ranked.length > 1 && (
          <Button size="sm" variant="ghost" onClick={() => setIndex((i) => i + 1)}>
            Show me something else
          </Button>
        )}
      </div>
    </Card>
  );
}
