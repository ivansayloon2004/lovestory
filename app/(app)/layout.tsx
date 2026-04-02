import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getViewerContext } from "@/lib/data/queries";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewerContext();

  if (!viewer) {
    redirect("/login");
  }

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
