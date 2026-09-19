"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ITEMS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/goals", label: "Goals", icon: GoalIcon },
  { href: "/habits", label: "Habits", icon: HabitIcon },
  { href: "/notes", label: "Notes", icon: NoteIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="glass-surface fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit gap-1 rounded-xl3 p-1.5 shadow-soft sm:bottom-6"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "focus-ring flex h-12 w-12 flex-col items-center justify-center rounded-xl2 transition-colors duration-200 sm:h-12 sm:w-16",
              active ? "bg-ink text-paper dark:bg-paper dark:text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            <Icon />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M4 11.5L12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
function GoalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}
function HabitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M6 4h9l4 4v12H6z" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h6M9 18h3" strokeLinecap="round" />
    </svg>
  );
}
