import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const signUpSchema = signInSchema.extend({
  displayName: z.string().min(2).max(40)
});

export const magicLinkSchema = z.object({
  email: z.string().email()
});
