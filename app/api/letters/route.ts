import { NextResponse } from "next/server";

import { getViewerContext } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";
import { letterSchema } from "@/lib/validations/letters";

export async function POST(request: Request) {
  const viewer = await getViewerContext();
  if (!viewer?.relationship) {
    return NextResponse.json({ error: "Create or join a diary first." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = letterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid letter." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("letters")
    .insert({
      relationship_id: viewer.relationship.id,
      sender_id: viewer.userId,
      recipient_id: parsed.data.recipientId,
      title: parsed.data.title,
      body: parsed.data.body
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}
