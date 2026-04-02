import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <div className="paper-panel max-w-xl p-8 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 font-display text-5xl text-foreground">This page slipped between diary pages.</h1>
        <p className="mt-4 text-sm leading-7 text-foreground/70">
          The memory you were looking for might have been removed, or the link may be out of date.
        </p>
        <Link href="/dashboard" className="soft-button mt-8">
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
