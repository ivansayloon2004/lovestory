import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth/auth-panel";
import { getViewerContext } from "@/lib/data/queries";

export default async function SignupPage() {
  const viewer = await getViewerContext();
  if (viewer) redirect("/dashboard");

  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-12">
      <AuthPanel mode="signup" />
    </main>
  );
}
