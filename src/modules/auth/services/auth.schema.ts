import z from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().trim().min(6, "Password is required"),
  role_id: z.number().positive(),
});

export type createUserDTO = z.infer<typeof createUserSchema>;
