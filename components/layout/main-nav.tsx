"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MainNavProps = {
  viewerName: string;
  partnerName?: string | null;
};

export function MainNav({ viewerName, partnerName }: MainNavProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="sticky top-6 space-y-6">
          <div className="glass-panel p-6">
            <p className="eyebrow">Private diary</p>
            <h1 className="mt-4 font-display text-4xl leading-none text-foreground">Our Memory Diary</h1>
            <p className="mt-3 text-sm text-foreground/70">
              Shared by <span className="font-semibold text-foreground">{viewerName}</span>
              {partnerName ? (
                <>
                  {" "}
                  and <span className="font-semibold text-foreground">{partnerName}</span>
                </>
              ) : (
                " while you wait for your person"
              )}
              .
            </p>
          </div>

          <nav className="paper-panel p-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm font-medium transition",
                        active
                          ? "bg-accent text-white shadow-bloom"
                          : "text-foreground/70 hover:bg-accentSoft hover:text-foreground"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="paper-panel flex items-center justify-between p-4">
            <span className="text-sm text-foreground/70">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full border border-white/60 bg-white/90 px-3 py-2 shadow-paper backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#1c1528]/95">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium",
                active ? "bg-accent text-white" : "text-foreground/70"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
