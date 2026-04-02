"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { MemoryRecord } from "@/lib/types";
import { moodMap } from "@/lib/moods";
import { formatLongDate, stripHtml } from "@/lib/utils";

export function MemoryCard({ memory }: { memory: MemoryRecord }) {
  const mood = moodMap[memory.mood as keyof typeof moodMap];
  const heroPhoto = memory.memory_photos?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="paper-panel overflow-hidden"
    >
      <Link href={`/memories/${memory.id}`} className="block">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag-chip">{formatLongDate(memory.memory_date)}</span>
              {mood ? (
                <span className="tag-chip">
                  {mood.emoji} {mood.label}
                </span>
              ) : null}
              {memory.is_special_moment ? <span className="tag-chip">Special moment</span> : null}
            </div>
            <h3 className="mt-4 font-display text-4xl leading-none text-foreground">{memory.title}</h3>
            <div
              className="diary-prose mt-4 line-clamp-4 text-foreground/75"
              dangerouslySetInnerHTML={{ __html: memory.story_html }}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/60">
                  #{tag}
                </span>
              ))}
            </div>
            {memory.location_label ? (
              <p className="mt-4 text-sm text-foreground/55">Captured in {memory.location_label}.</p>
            ) : null}
          </div>

          <div className="relative min-h-[220px] bg-muted">
            {heroPhoto?.signed_url ? (
              <img src={heroPhoto.signed_url} alt={memory.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <p className="max-w-xs text-sm text-foreground/55">{stripHtml(memory.story_html).slice(0, 160)}</p>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
