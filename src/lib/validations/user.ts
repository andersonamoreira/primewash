import { z } from "zod";

export const ROLES = ["ADMIN", "USER"] as const;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(ROLES),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome"),
  email: z.string().trim().email("E-mail inválido"),
  role: z.enum(ROLES),
  password: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || v.length >= 6, "A senha deve ter ao menos 6 caracteres"),
});
