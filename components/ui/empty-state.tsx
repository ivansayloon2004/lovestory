import Link from "next/link";

type EmptyStateProps = {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EmptyState({ title, body, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="paper-panel p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accentSoft text-2xl">
        ♡
      </div>
      <h3 className="font-display text-3xl text-foreground">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/70">{body}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="soft-button mt-6">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
