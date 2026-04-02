import { z } from "zod";

export const profileUpdateSchema = z.object({
  display_name: z.string().trim().min(2).max(40),
  avatar_url: z.string().url().optional().or(z.literal("")),
  theme_mode: z.enum(["light", "dark", "system"])
});

export const reminderPreferencesSchema = z.object({
  weekly_memory_prompt: z.boolean(),
  weekly_memory_day: z.number().min(0).max(6),
  weekly_memory_hour: z.number().min(0).max(23),
  anniversary_reminders: z.boolean(),
  anniversary_lead_days: z.number().min(1).max(30),
  email_enabled: z.boolean(),
  push_enabled: z.boolean()
});
