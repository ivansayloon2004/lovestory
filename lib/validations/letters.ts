import { z } from "zod";

export const letterSchema = z.object({
  recipientId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000)
});
