import z from "zod";

export const loginSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  password: z.string().trim().min(1, "Password is required"),
});

export type loginDTO = z.infer<typeof loginSchema>;
