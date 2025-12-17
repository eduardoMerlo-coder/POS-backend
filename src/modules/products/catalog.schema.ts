import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .transform((val) => val.toLowerCase()),
  user_id: z.string().uuid("user_id debe ser un UUID válido").optional(),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .transform((val) => val.toLowerCase())
    .optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  description: z.string().trim().optional(),
  user_id: z.string().uuid("user_id debe ser un UUID válido").optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").optional(),
  description: z.string().trim().optional(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
