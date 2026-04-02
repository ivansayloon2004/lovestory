import { NextResponse } from "next/server";

import { getViewerContext } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";
import { reminderPreferencesSchema } from "@/lib/validations/settings";

export async function PATCH(request: Request) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) {
    return NextResponse.json({ error: "Create or join a diary first." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reminderPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid reminder settings." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reminder_preferences").upsert({
    relationship_id: viewer.relationship.id,
    ...parsed.data
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
