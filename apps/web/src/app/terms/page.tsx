export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Terms of Service</h1>
      <p className="mt-4 rounded-xl2 border border-accent/40 bg-accent/10 p-4 text-sm text-ink-soft">
        <strong>Placeholder — requires review by qualified counsel before production launch.</strong> This page is scaffolding for the
        real terms of service Wayfare will publish.
      </p>
      <div className="mt-6 space-y-4 text-sm text-ink-soft">
        <p>By creating an account you agree to use Wayfare for personal life-management purposes and not to misuse the service.</p>
        <p>The free plan and Premium subscription terms are described on the Pricing page and may change with notice.</p>
        <p>You may cancel a Premium subscription at any time from Settings → Subscription; cancellation takes effect at period end.</p>
      </div>
    </div>
  );
}
