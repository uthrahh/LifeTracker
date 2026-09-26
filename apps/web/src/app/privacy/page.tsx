export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Privacy Policy</h1>
      <p className="mt-4 rounded-xl2 border border-accent/40 bg-accent/10 p-4 text-sm text-ink-soft">
        <strong>Placeholder — requires review by qualified counsel before production launch.</strong> This page is scaffolding for the
        real privacy policy Luma will publish. Do not treat the text below as a binding legal document.
      </p>
      <div className="mt-6 space-y-4 text-sm text-ink-soft">
        <p>
          Luma stores the tasks, habits, goals, notes, and calendar data you create in order to provide the product. Data is isolated
          per account using Postgres Row Level Security — no user can read another user&apos;s data, and Luma staff do not access user
          content except as required to operate or secure the service.
        </p>
        <p>
          You can export your data at any time from Settings → Privacy, and you can permanently delete your account and associated data
          from Settings → Account.
        </p>
        <p>
          Optional integrations (Google Calendar, notifications) only activate with your explicit consent and can be disconnected at any
          time.
        </p>
      </div>
    </div>
  );
}
