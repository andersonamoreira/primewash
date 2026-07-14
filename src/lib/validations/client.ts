import { z } from "zod";
import { BRAZILIAN_STATES } from "@/lib/brazilian-states";

export const REFERRAL_SOURCES = ["INSTAGRAM", "INDICACAO", "CARTAO_VISITA", "FACHADA"] as const;

const STATE_CODES = BRAZILIAN_STATES.map((s) => s.uf) as [string, ...string[]];

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente"),
  phone: z.string().trim().min(8, "Informe um telefone válido"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  document: optionalText,
  city: optionalText,
  state: z
    .enum(STATE_CODES)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  referralSource: z
    .enum(REFERRAL_SOURCES)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  notes: optionalText,
});

export type ClientFormValues = z.input<typeof clientSchema>;

export const CYLINDER_TIERS = ["BAIXA", "MEDIA", "ALTA"] as const;

export const motorcycleSchema = z.object({
  clientId: z.string().min(1, "Selecione o cliente"),
  brand: z.string().trim().min(2, "Informe a marca"),
  model: z.string().trim().min(1, "Informe o modelo"),
  color: z.string().trim().min(2, "Informe a cor"),
  plate: z
    .string()
    .trim()
    .min(6, "Informe a placa")
    .transform((v) => v.toUpperCase()),
  cylinderTier: z.enum(CYLINDER_TIERS),
  notes: optionalText,
});

export type MotorcycleFormValues = z.input<typeof motorcycleSchema>;
