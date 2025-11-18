import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().toLowerCase(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
