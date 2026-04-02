import { z } from "zod";

import { moods } from "@/lib/moods";

const moodValues = moods.map((mood) => mood.value) as [string, ...string[]];

export const memoryPayloadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(140, "Keep titles under 140 characters."),
    memory_date: z.string().min(1, "Choose a date."),
    mood: z.enum(moodValues),
    story_html: z.string().trim().min(1, "Write a little story."),
    tags: z.array(z.string().trim().min(1)).max(8).default([]),
    location_label: z.string().trim().max(120).optional().or(z.literal("")),
    is_special_moment: z.boolean().default(false),
    special_type: z
      .enum(["anniversary", "birthday", "trip", "important_event"])
      .optional()
      .nullable()
  })
  .superRefine((value, ctx) => {
    if (value.is_special_moment && !value.special_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["special_type"],
        message: "Choose a special moment type."
      });
    }
  });

export function parseBooleanValue(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}
