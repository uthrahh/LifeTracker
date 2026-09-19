"use client";

import { useEffect, useState } from "react";

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function GreetingHeader({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <h1 className="font-display text-3xl text-ink sm:text-4xl">
      {greeting}, {name} <span aria-hidden>♥</span>
    </h1>
  );
}
