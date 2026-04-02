import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { joinRelationshipSchema } from "@/lib/validations/relationship";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = joinRelationshipSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid invite code." }, { status: 400 });
  }

  const { data: relationshipId, error } = await supabase.rpc("join_relationship_space", {
    input_code: parsed.data.code
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: relationshipId });
}
