import { NextResponse } from "next/server";

import { getViewerContext } from "@/lib/data/queries";
import { getPhotoFiles, parseMemoryFormData, uploadMemoryPhotos } from "@/lib/data/memory-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) {
    return NextResponse.json({ error: "Create or join a diary first." }, { status: 400 });
  }

  const formData = await request.formData();
  const parsed = parseMemoryFormData(formData);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid memory." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: memory, error } = await supabase
    .from("memories")
    .insert({
      relationship_id: viewer.relationship.id,
      title: parsed.data.title,
      memory_date: parsed.data.memory_date,
      mood: parsed.data.mood,
      story_html: parsed.data.story_html,
      tags: parsed.data.tags,
      location_label: parsed.data.location_label || null,
      is_special_moment: parsed.data.is_special_moment,
      special_type: parsed.data.special_type,
      created_by: viewer.userId,
      updated_by: viewer.userId
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await uploadMemoryPhotos({
      supabase,
      relationshipId: viewer.relationship.id,
      memoryId: memory.id,
      files: getPhotoFiles(formData)
    });
  } catch (caughtError) {
    await supabase.from("memories").delete().eq("id", memory.id).eq("relationship_id", viewer.relationship.id);
    return NextResponse.json(
      { error: caughtError instanceof Error ? caughtError.message : "Photo upload failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: memory.id });
}
