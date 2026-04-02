import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <div className="paper-panel max-w-xl p-8 text-center">
        <p className="eyebrow">Offline</p>
        <h1 className="mt-4 font-display text-5xl text-foreground">Your diary is resting offline.</h1>
        <p className="mt-4 text-sm leading-7 text-foreground/70">
          Previously visited pages and cached memories can still be available, but fresh data needs a
          connection. Reconnect when you're ready and we'll pull your latest moments back in.
        </p>
        <Link href="/dashboard" className="soft-button mt-8">
          Try dashboard again
        </Link>
      </div>
    </main>
  );
}
