"use client";

import { useEffect, useState } from "react";

export interface QuoteItem {
  text: string;
  author: string | null;
}

/** Picks a quote once per app open (not once per render) and remembers it for this tab session. */
export function QuoteOfTheSession({ quotes }: { quotes: QuoteItem[] }) {
  const [quote, setQuote] = useState<QuoteItem | null>(null);

  useEffect(() => {
    if (quotes.length === 0) return;
    try {
      const cached = sessionStorage.getItem("luma:quote-index");
      let index: number;
      if (cached !== null) {
        index = Number(cached);
      } else {
        index = Math.floor(Math.random() * quotes.length);
        sessionStorage.setItem("luma:quote-index", String(index));
      }
      setQuote(quotes[index % quotes.length] ?? quotes[0]!);
    } catch {
      setQuote(quotes[0]!);
    }
  }, [quotes]);

  if (!quote) return null;

  return (
    <p className="max-w-md text-sm italic text-ink-soft">
      &ldquo;{quote.text}&rdquo;{quote.author ? <span className="not-italic text-ink-faint"> — {quote.author}</span> : null}
    </p>
  );
}
