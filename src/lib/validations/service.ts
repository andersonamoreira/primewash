import { z } from "zod";

const priceField = z
  .string()
  .trim()
  .min(1, "Informe o preço")
  .transform((v) => Number(v.replace(",", ".")))
  .refine((v) => !Number.isNaN(v) && v >= 0, "O preço deve ser um número positivo");

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço"),
  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  groupId: z.string().min(1, "Selecione um grupo"),
  priceBaixa: priceField,
  priceMedia: priceField,
  priceAlta: priceField,
});
