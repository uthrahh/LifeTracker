import { BottomNav } from "@/components/home/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-28">
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">{children}</main>
      <BottomNav />
    </div>
  );
}
