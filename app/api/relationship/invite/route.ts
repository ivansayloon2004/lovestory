import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createRelationshipSchema } from "@/lib/validations/relationship";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createRelationshipSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const { data: relationshipId, error } = await supabase.rpc("create_relationship_space", {
    input_started_on: parsed.data.startedOn || null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: relationship } = await supabase
    .from("relationships")
    .select("invite_code")
    .eq("id", relationshipId)
    .single();

  return NextResponse.json({ id: relationshipId, inviteCode: relationship?.invite_code });
}
