import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().trim().min(6, "Password is required"),
  role_id: z.number().positive(),
});

export type createUserDTO = z.infer<typeof createUserSchema>;

export const updateUserMetadataSchema = z.object({
  user_id: z.string().uuid("user_id debe ser un UUID válido"),
  metadata: z.record(z.string(), z.any()).refine(
    (val) => Object.keys(val).length > 0,
    { message: "metadata debe tener al menos un campo" }
  ),
});

export type updateUserMetadataDTO = z.infer<typeof updateUserMetadataSchema>;
