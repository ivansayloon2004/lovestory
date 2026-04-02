import { createClient } from "@/lib/supabase/server";
import { MEMORY_BUCKET } from "@/lib/constants";
import { parseBooleanValue, memoryPayloadSchema } from "@/lib/validations/memory";
import { parseTagInput, slugifyFilename } from "@/lib/utils";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function parseMemoryFormData(formData: FormData) {
  const isSpecialMoment = parseBooleanValue(formData.get("is_special_moment"));

  return memoryPayloadSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    memory_date: String(formData.get("memory_date") ?? ""),
    mood: String(formData.get("mood") ?? ""),
    story_html: String(formData.get("story_html") ?? ""),
    tags: parseTagInput(String(formData.get("tags") ?? "")),
    location_label: String(formData.get("location_label") ?? ""),
    is_special_moment: isSpecialMoment,
    special_type: isSpecialMoment && formData.get("special_type") ? String(formData.get("special_type")) : null
  });
}

export function getPhotoFiles(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function uploadMemoryPhotos({
  supabase,
  relationshipId,
  memoryId,
  files
}: {
  supabase: SupabaseServerClient;
  relationshipId: string;
  memoryId: string;
  files: File[];
}) {
  const photoRows: Array<{ memory_id: string; storage_path: string; caption: null; sort_order: number }> = [];

  for (const [index, file] of files.entries()) {
    const filePath = `${relationshipId}/${memoryId}/${Date.now()}-${index}-${slugifyFilename(file.name)}`;
    const { error } = await supabase.storage.from(MEMORY_BUCKET).upload(filePath, file, {
      upsert: false,
      contentType: file.type || "image/jpeg"
    });

    if (error) {
      throw new Error(error.message);
    }

    photoRows.push({
      memory_id: memoryId,
      storage_path: filePath,
      caption: null,
      sort_order: index
    });
  }

  if (photoRows.length) {
    const { error } = await supabase.from("memory_photos").insert(photoRows);
    if (error) throw new Error(error.message);
  }

  return photoRows;
}

export async function removeMemoryPhotos({
  supabase,
  storagePaths
}: {
  supabase: SupabaseServerClient;
  storagePaths: string[];
}) {
  if (!storagePaths.length) return;
  const { error } = await supabase.storage.from(MEMORY_BUCKET).remove(storagePaths);
  if (error) throw new Error(error.message);
}
