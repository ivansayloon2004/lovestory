"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { MemoryRecord } from "@/lib/types";
import { moods } from "@/lib/moods";
import { SPECIAL_MOMENT_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type MemoryFormProps = {
  mode: "create" | "edit";
  memory?: MemoryRecord | null;
};

export function MemoryForm({ mode, memory }: MemoryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(memory?.title ?? "");
  const [memoryDate, setMemoryDate] = useState(memory?.memory_date ?? new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState(memory?.mood ?? moods[0].value);
  const [storyHtml, setStoryHtml] = useState(memory?.story_html ?? "");
  const [tags, setTags] = useState(memory?.tags.join(", ") ?? "");
  const [locationLabel, setLocationLabel] = useState(memory?.location_label ?? "");
  const [isSpecialMoment, setIsSpecialMoment] = useState(memory?.is_special_moment ?? false);
  const [specialType, setSpecialType] = useState(memory?.special_type ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const existingPhotos = useMemo(() => memory?.memory_photos ?? [], [memory?.memory_photos]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("memory_date", memoryDate);
      formData.append("mood", mood);
      formData.append("story_html", storyHtml);
      formData.append("tags", tags);
      formData.append("location_label", locationLabel);
      formData.append("is_special_moment", String(isSpecialMoment));
      formData.append("special_type", specialType);
      files.forEach((file) => formData.append("photos", file));

      const endpoint = mode === "create" ? "/api/memories" : `/api/memories/${memory?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save this memory.");

      setStatus(mode === "create" ? "Memory saved." : "Memory updated.");
      if (mode === "create" && payload.id) {
        router.push(`/memories/${payload.id}`);
      } else {
        router.refresh();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save this memory.");
    } finally {
      setBusy(false);
    }
  };

  const removeMemory = async () => {
    if (!memory?.id || !confirm("Delete this memory forever?")) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/memories/${memory.id}`, {
        method: "DELETE"
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not delete this memory.");

      router.push("/memories");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete this memory.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="paper-panel grid gap-5 p-6 lg:grid-cols-2">
        <label className="text-sm text-foreground/70">
          Title
          <Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="text-sm text-foreground/70">
          Date
          <Input className="mt-2" type="date" value={memoryDate} onChange={(event) => setMemoryDate(event.target.value)} />
        </label>
        <label className="text-sm text-foreground/70">
          Mood
          <select className="diary-input mt-2" value={mood} onChange={(event) => setMood(event.target.value)}>
            {moods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.emoji} {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-foreground/70">
          Location
          <Input className="mt-2" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} placeholder="Cebu City, Rooftop, Home..." />
        </label>
        <label className="text-sm text-foreground/70 lg:col-span-2">
          Tags
          <Input className="mt-2" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="trip, sunset, anniversary" />
        </label>
      </div>

      <div className="paper-panel p-6">
        <div className="mb-4">
          <h3 className="font-display text-3xl text-foreground">Story</h3>
          <p className="mt-1 text-sm text-foreground/65">Write it like a memory worth returning to.</p>
        </div>
        <RichTextEditor value={storyHtml} onChange={setStoryHtml} placeholder="Tell the story behind this moment..." />
      </div>

      <div className="paper-panel grid gap-5 p-6 lg:grid-cols-2">
        <div>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={isSpecialMoment}
              onChange={(event) => {
                const checked = event.target.checked;
                setIsSpecialMoment(checked);
                if (!checked) setSpecialType("");
              }}
            />
            Mark as special moment
          </label>
          <select
            className="diary-input mt-4"
            value={specialType}
            onChange={(event) => setSpecialType(event.target.value)}
            disabled={!isSpecialMoment}
          >
            <option value="">Choose a category</option>
            {SPECIAL_MOMENT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-foreground/70">
            Photos
            <input
              className="mt-2 block w-full rounded-[1.25rem] border border-dashed border-border/80 bg-white/70 px-4 py-4 text-sm dark:bg-white/5"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          {files.length ? (
            <p className="mt-3 text-xs text-foreground/55">{files.length} photo(s) ready to upload.</p>
          ) : null}
        </div>

        {existingPhotos.length ? (
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm text-foreground/70">Existing photos</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {existingPhotos.map((photo) =>
                photo.signed_url ? (
                  <img
                    key={photo.id}
                    src={photo.signed_url}
                    alt={memory?.title ?? "Memory photo"}
                    className="aspect-square w-full rounded-[1.25rem] object-cover"
                  />
                ) : null
              )}
            </div>
          </div>
        ) : null}
      </div>

      {(error || status) && (
        <div
          className={`rounded-[1.25rem] px-4 py-3 text-sm ${
            error ? "border border-red-200 bg-red-50 text-red-700" : "border border-accent/20 bg-accentSoft text-foreground/75"
          }`}
        >
          {error ?? status}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={submit} disabled={busy}>
          {busy ? "Saving..." : mode === "create" ? "Save memory" : "Update memory"}
        </Button>
        {mode === "edit" ? (
          <Button type="button" variant="secondary" onClick={removeMemory} disabled={busy}>
            Delete memory
          </Button>
        ) : null}
      </div>
    </div>
  );
}
