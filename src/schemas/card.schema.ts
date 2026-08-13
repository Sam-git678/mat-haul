import { z } from 'zod';
export const cardSchema = z.object({
  amount: z.string().min(1, "Amount is required")
});

export type CardTopupFormData = z.infer<typeof cardSchema>;

