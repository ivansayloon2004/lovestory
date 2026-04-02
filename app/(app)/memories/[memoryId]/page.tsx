import { notFound } from "next/navigation";

import { MemoryForm } from "@/components/memory/memory-form";
import { getMemoryById } from "@/lib/data/queries";

export default async function MemoryDetailPage({
  params
}: Readonly<{ params: { memoryId: string } }>) {
  const memory = await getMemoryById(params.memoryId);
  if (!memory) notFound();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="eyebrow">Edit memory</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-foreground">{memory.title}</h1>
      </section>
      <MemoryForm mode="edit" memory={memory} />
    </div>
  );
}
