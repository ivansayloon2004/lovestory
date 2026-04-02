import { NextResponse } from "next/server";

import { getViewerContext } from "@/lib/data/queries";
import {
  getPhotoFiles,
  parseMemoryFormData,
  removeMemoryPhotos,
  uploadMemoryPhotos
} from "@/lib/data/memory-service";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { memoryId: string } }
) {
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
  const { error } = await supabase
    .from("memories")
    .update({
      title: parsed.data.title,
      memory_date: parsed.data.memory_date,
      mood: parsed.data.mood,
      story_html: parsed.data.story_html,
      tags: parsed.data.tags,
      location_label: parsed.data.location_label || null,
      is_special_moment: parsed.data.is_special_moment,
      special_type: parsed.data.special_type,
      updated_by: viewer.userId
    })
    .eq("id", params.memoryId)
    .eq("relationship_id", viewer.relationship.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await uploadMemoryPhotos({
      supabase,
      relationshipId: viewer.relationship.id,
      memoryId: params.memoryId,
      files: getPhotoFiles(formData)
    });
  } catch (caughtError) {
    return NextResponse.json(
      { error: caughtError instanceof Error ? caughtError.message : "Photo upload failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { memoryId: string } }
) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) {
    return NextResponse.json({ error: "Create or join a diary first." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: memory, error: loadError } = await supabase
    .from("memories")
    .select("id, memory_photos(storage_path)")
    .eq("id", params.memoryId)
    .eq("relationship_id", viewer.relationship.id)
    .single();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 404 });
  }

  try {
    await removeMemoryPhotos({
      supabase,
      storagePaths:
        memory.memory_photos?.map((photo: { storage_path: string }) => photo.storage_path) ?? []
    });
  } catch (caughtError) {
    return NextResponse.json(
      { error: caughtError instanceof Error ? caughtError.message : "Could not remove photos." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", params.memoryId)
    .eq("relationship_id", viewer.relationship.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
