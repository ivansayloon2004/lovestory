import type {
  DashboardSnapshot,
  LetterRecord,
  MemoryRecord,
  MemoryPhoto,
  ReminderPreference,
  Relationship,
  ViewerContext
} from "@/lib/types";
import { MEMORY_BUCKET } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getDaysTogether } from "@/lib/utils";

type TimelineFilters = {
  search?: string;
  mood?: string;
  tag?: string;
  from?: string;
  to?: string;
};

async function attachSignedUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  memories: MemoryRecord[]
) {
  const paths = memories.flatMap((memory) => memory.memory_photos?.map((photo) => photo.storage_path) ?? []);
  if (!paths.length) return memories;

  const uniquePaths = Array.from(new Set(paths));
  const { data } = await supabase.storage.from(MEMORY_BUCKET).createSignedUrls(uniquePaths, 60 * 60);
  const signedMap = new Map<string, string>();

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) {
      signedMap.set(item.path, item.signedUrl);
    }
  }

  return memories.map((memory) => ({
    ...memory,
    memory_photos:
      memory.memory_photos?.map((photo) => ({
        ...photo,
        signed_url: signedMap.get(photo.storage_path)
      })) ?? []
  }));
}

export async function getViewerContext(): Promise<ViewerContext | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  let relationship: Relationship | null = null;
  let partner = null;
  let reminders: ReminderPreference | null = null;

  if (profile.relationship_id) {
    const [relationshipResult, partnerResult, reminderResult] = await Promise.all([
      supabase.from("relationships").select("*").eq("id", profile.relationship_id).single(),
      supabase
        .from("profiles")
        .select("*")
        .eq("relationship_id", profile.relationship_id)
        .neq("id", user.id)
        .maybeSingle(),
      supabase.from("reminder_preferences").select("*").eq("relationship_id", profile.relationship_id).maybeSingle()
    ]);

    relationship = relationshipResult.data ?? null;
    partner = partnerResult.data ?? null;
    reminders = reminderResult.data ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    profile,
    relationship,
    partner,
    reminders
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot | null> {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return null;

  const supabase = await createClient();
  const relationshipId = viewer.relationship.id;

  const [recentMemoriesResult, recentLettersResult, memoryCountResult, specialCountResult] =
    await Promise.all([
      supabase
        .from("memories")
        .select("*, memory_photos(id, storage_path, caption, sort_order)")
        .eq("relationship_id", relationshipId)
        .order("memory_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("letters")
        .select("*")
        .eq("relationship_id", relationshipId)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase.from("memories").select("*", { count: "exact", head: true }).eq("relationship_id", relationshipId),
      supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("relationship_id", relationshipId)
        .eq("is_special_moment", true)
    ]);

  const recentMemories = await attachSignedUrls(
    supabase,
    (recentMemoriesResult.data as MemoryRecord[] | null) ?? []
  );

  return {
    daysTogether: getDaysTogether(viewer.relationship.started_on),
    totalMemories: memoryCountResult.count ?? 0,
    specialMoments: specialCountResult.count ?? 0,
    recentMemories,
    recentLetters: (recentLettersResult.data as LetterRecord[] | null) ?? []
  };
}

export async function getTimelineMemories(filters: TimelineFilters = {}) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return [];

  const supabase = await createClient();
  let query = supabase
    .from("memories")
    .select("*, memory_photos(id, storage_path, caption, sort_order)")
    .eq("relationship_id", viewer.relationship.id)
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.replace(/,/g, " ");
    query = query.or(
      `title.ilike.%${term}%,story_html.ilike.%${term}%,location_label.ilike.%${term}%`
    );
  }

  if (filters.mood) query = query.eq("mood", filters.mood);
  if (filters.tag) query = query.contains("tags", [filters.tag]);
  if (filters.from) query = query.gte("memory_date", filters.from);
  if (filters.to) query = query.lte("memory_date", filters.to);

  const { data } = await query;
  return attachSignedUrls(supabase, (data as MemoryRecord[] | null) ?? []);
}

export async function getMemoryById(memoryId: string) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("*, memory_photos(id, storage_path, caption, sort_order)")
    .eq("relationship_id", viewer.relationship.id)
    .eq("id", memoryId)
    .single();

  const memories = await attachSignedUrls(supabase, data ? [data as MemoryRecord] : []);
  return memories[0] ?? null;
}

export async function getSpecialMoments() {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("*, memory_photos(id, storage_path, caption, sort_order)")
    .eq("relationship_id", viewer.relationship.id)
    .eq("is_special_moment", true)
    .order("memory_date", { ascending: false });

  return attachSignedUrls(supabase, (data as MemoryRecord[] | null) ?? []);
}

export async function getCalendarMemories(month: Date) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return [];

  const supabase = await createClient();
  const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data } = await supabase
    .from("memories")
    .select("id, title, memory_date, mood, is_special_moment")
    .eq("relationship_id", viewer.relationship.id)
    .gte("memory_date", start)
    .lte("memory_date", end)
    .order("memory_date", { ascending: true });

  return data ?? [];
}

export async function getGalleryPhotos() {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("id, title, memory_date, mood, memory_photos(id, storage_path, caption, sort_order)")
    .eq("relationship_id", viewer.relationship.id)
    .order("memory_date", { ascending: false });

  const signed = await attachSignedUrls(supabase, (data as MemoryRecord[] | null) ?? []);
  return signed.flatMap((memory) =>
    (memory.memory_photos ?? []).map((photo: MemoryPhoto) => ({
      ...photo,
      memory: {
        id: memory.id,
        title: memory.title,
        memory_date: memory.memory_date,
        mood: memory.mood
      }
    }))
  );
}

export async function getLetters() {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("letters")
    .select("*")
    .eq("relationship_id", viewer.relationship.id)
    .order("created_at", { ascending: false });

  return (data as LetterRecord[] | null) ?? [];
}
