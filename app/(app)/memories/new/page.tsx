import { redirect } from "next/navigation";

import { MemoryForm } from "@/components/memory/memory-form";
import { getViewerContext } from "@/lib/data/queries";

export default async function NewMemoryPage() {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="eyebrow">New memory</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-foreground">Write today into forever.</h1>
      </section>
      <MemoryForm mode="create" />
    </div>
  );
}
