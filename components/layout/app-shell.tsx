import type { ViewerContext } from "@/lib/types";
import { MainNav } from "@/components/layout/main-nav";

export function AppShell({
  viewer,
  children
}: Readonly<{ viewer: ViewerContext; children: React.ReactNode }>) {
  return (
    <div className="section-shell pb-24 pt-6 lg:pb-10">
      <div className="flex gap-8">
        <MainNav
          viewerName={viewer.profile.display_name ?? viewer.email}
          partnerName={viewer.partner?.display_name ?? null}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
