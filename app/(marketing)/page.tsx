import Link from "next/link";
import { redirect } from "next/navigation";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Button } from "@/components/ui/button";
import { getViewerContext } from "@/lib/data/queries";

export default async function LandingPage() {
  const viewer = await getViewerContext();
  if (viewer) redirect("/dashboard");

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="section-shell relative flex min-h-screen flex-col justify-center py-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[6%] top-[14%] h-40 w-40 rounded-full bg-[#ffd6e8] blur-3xl" />
          <div className="absolute right-[8%] top-[18%] h-48 w-48 rounded-full bg-[#d9deff] blur-3xl" />
          <div className="absolute bottom-[12%] left-[22%] h-32 w-32 rounded-full bg-[#ffe8c7] blur-3xl" />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Private. Shared. Installable.</p>
            <h1 className="mt-6 max-w-4xl font-display text-[4rem] leading-[0.88] text-foreground sm:text-[5.6rem]">
              A diary for the moments only two hearts should keep.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-foreground/70">
              Our Memory Diary gives couples one secure place for stories, photos, letters, milestones,
              and the quiet little days that become everything later.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="soft-button">
                Create your diary
              </Link>
              <Link href="/login" className="soft-button-secondary">
                Sign in
              </Link>
              <InstallPrompt />
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel rotate-[-5deg] p-8">
              <p className="eyebrow">Timeline</p>
              <h2 className="mt-5 font-display text-4xl text-foreground">March 14, 2026</h2>
              <p className="mt-4 text-sm leading-7 text-foreground/75">
                We got caught in the rain after dinner and laughed the whole walk home. You kept saying
                it felt like a movie, and maybe it did, because even the ordinary parts shimmered.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="aspect-[0.82] rounded-[1.5rem] bg-gradient-to-br from-[#ffe2ef] to-[#fff8fb]" />
                <div className="aspect-[0.82] rounded-[1.5rem] bg-gradient-to-br from-[#dbe4ff] to-[#f8fbff]" />
                <div className="aspect-[0.82] rounded-[1.5rem] bg-gradient-to-br from-[#ffeacc] to-[#fff9f1]" />
              </div>
            </div>
            <div className="paper-panel absolute -bottom-8 -left-6 max-w-xs p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-foreground/40">Special moments</p>
              <p className="mt-3 font-display text-3xl text-foreground">Anniversaries, trips, birthdays, and the tiny magic in between.</p>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Exactly two linked users",
              body: "A couple-only architecture backed by database rules, invites, and RLS."
            },
            {
              title: "Beautiful memory surfaces",
              body: "Timeline, calendar, gallery, letters, special moments, and days-together tracking."
            },
            {
              title: "Mobile-first PWA",
              body: "Installable on phones, with offline-friendly caching and a native-feeling shell."
            }
          ].map((item) => (
            <div key={item.title} className="paper-panel p-6">
              <h3 className="font-display text-3xl text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
