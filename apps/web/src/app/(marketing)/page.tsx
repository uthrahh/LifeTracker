import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ENVIRONMENTS } from "@wayfare/config";

const FEATURES = [
  { title: "One next action", body: "Not a 40-item list — the one thing worth starting with, and why it's first." },
  { title: "Goals that connect", body: "Long-term goals break into milestones, habits, and tasks automatically. Progress rolls up on its own." },
  { title: "A calm daily surface", body: "Tasks, habits, notes, and your calendar in one place — no app-switching required." },
  { title: "A focus timer that survives real life", body: "Close the tab, lock your phone, come back later — it picks up exactly where it left off." },
  { title: "Reset, don't restart", body: "Falling behind happens. Reset Day clears the slate in one tap, without the guilt." },
  { title: "An environment that's actually yours", body: "Five living scenes that shift with your real time of day — Beach, Space, Rainforest, City, Fields." },
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl text-ink">Wayfare</span>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="focus-ring text-sm text-ink-soft hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">One calm place for everything you&apos;re trying to improve.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">Plan less. Do more.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">Start for free</Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="secondary">
              See how it works
            </Button>
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-2xl text-ink">Goals become daily actions, automatically</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-ink-soft">
          {["Goals", "Milestones", "Habits", "Tasks", "Daily actions", "Progress"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-3">
              <span className="glass-surface rounded-full px-4 py-2 text-ink">{step}</span>
              {i < arr.length - 1 && <span aria-hidden>→</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-surface rounded-xl3 p-6">
              <h3 className="font-display text-lg text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-2xl text-ink">Choose the environment that feels like you</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {ENVIRONMENTS.map((env) => (
            <div key={env.scene} className="glass-surface rounded-xl2 p-4 text-center">
              <p className="font-display text-base text-ink">{env.label}</p>
              <p className="mt-1 text-xs text-ink-faint">{env.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl text-ink">Free to start</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Tasks, habits, goals, notes, calendar, and the focus timer — free. Premium adds every environment, AI goal breakdown, and
          advanced calendar sync.
        </p>
        <Link href="/signup" className="mt-6 inline-block">
          <Button size="lg">Start for free</Button>
        </Link>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink-faint sm:flex-row">
        <span>© {new Date().getFullYear()} Wayfare</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="focus-ring hover:text-ink-soft">
            Privacy
          </Link>
          <Link href="/terms" className="focus-ring hover:text-ink-soft">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
