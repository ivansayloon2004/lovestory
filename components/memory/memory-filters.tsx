"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { moods } from "@/lib/moods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MemoryFiltersProps = {
  filters: Record<string, string | string[] | undefined>;
};

export function MemoryFilters({ filters }: MemoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(String(filters.search ?? ""));
  const [mood, setMood] = useState(String(filters.mood ?? ""));
  const [tag, setTag] = useState(String(filters.tag ?? ""));
  const [from, setFrom] = useState(String(filters.from ?? ""));
  const [to, setTo] = useState(String(filters.to ?? ""));

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const entries = { search, mood, tag, from, to };

    Object.entries(entries).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    router.push(`/memories?${params.toString()}`);
  };

  return (
    <div className="paper-panel grid gap-3 p-4 md:grid-cols-5 md:items-end">
      <label className="text-sm text-foreground/70 md:col-span-2">
        Search
        <Input className="mt-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, story, place..." />
      </label>
      <label className="text-sm text-foreground/70">
        Mood
        <select className="diary-input mt-2" value={mood} onChange={(event) => setMood(event.target.value)}>
          <option value="">All moods</option>
          {moods.map((item) => (
            <option key={item.value} value={item.value}>
              {item.emoji} {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-foreground/70">
        Tag
        <Input className="mt-2" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="trip" />
      </label>
      <div className="flex gap-2">
        <Button type="button" className="flex-1" onClick={applyFilters}>
          Filter
        </Button>
        <Button variant="secondary" type="button" className="flex-1" onClick={() => router.push("/memories")}>
          Reset
        </Button>
      </div>
      <label className="text-sm text-foreground/70">
        From
        <Input className="mt-2" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      </label>
      <label className="text-sm text-foreground/70">
        To
        <Input className="mt-2" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </label>
    </div>
  );
}
