"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { formatLongDate } from "@/lib/utils";

type GalleryPhoto = {
  id: string;
  caption: string | null;
  signed_url?: string;
  memory: {
    id: string;
    title: string;
    memory_date: string;
    mood: string;
  };
};

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePhoto = photos.find((photo) => photo.id === activeId) ?? null;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo) =>
          photo.signed_url ? (
            <motion.button
              key={photo.id}
              type="button"
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveId(photo.id)}
              className="paper-panel mb-4 block w-full overflow-hidden text-left"
            >
              <img src={photo.signed_url} alt={photo.memory.title} className="w-full object-cover" />
              <div className="p-4">
                <p className="font-display text-2xl text-foreground">{photo.memory.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-foreground/45">
                  {formatLongDate(photo.memory.memory_date)}
                </p>
              </div>
            </motion.button>
          ) : null
        )}
      </div>

      {activePhoto?.signed_url ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveId(null)}
        >
          <div className="max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-paper" onClick={(event) => event.stopPropagation()}>
            <img src={activePhoto.signed_url} alt={activePhoto.memory.title} className="max-h-[78vh] w-full object-contain bg-black/5" />
            <div className="p-6">
              <p className="font-display text-4xl text-foreground">{activePhoto.memory.title}</p>
              <p className="mt-2 text-sm text-foreground/65">{formatLongDate(activePhoto.memory.memory_date)}</p>
              {activePhoto.caption ? <p className="mt-4 text-sm text-foreground/75">{activePhoto.caption}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
