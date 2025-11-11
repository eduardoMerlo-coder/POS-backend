import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase()),
  password: z.string().trim(),
  rol: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase()),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
