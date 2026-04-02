import { z } from "zod";

export const createRelationshipSchema = z.object({
  startedOn: z.string().optional().or(z.literal(""))
});

export const joinRelationshipSchema = z.object({
  code: z
    .string()
    .min(6, "Invite code is too short.")
    .max(12, "Invite code is too long.")
    .transform((value) => value.trim().toUpperCase())
});
