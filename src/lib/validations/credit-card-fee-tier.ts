import { z } from "zod";

export const creditCardFeeTierSchema = z
  .object({
    minInstallments: z.coerce.number().int().min(1, "Mínimo é 1x").max(12, "Máximo é 12x"),
    maxInstallments: z.coerce.number().int().min(1, "Mínimo é 1x").max(12, "Máximo é 12x"),
    feePercent: z
      .string()
      .trim()
      .min(1, "Informe o percentual")
      .transform((v) => Number(v.replace(",", ".")))
      .refine((v) => !Number.isNaN(v) && v >= 0, "Percentual inválido"),
  })
  .refine((data) => data.minInstallments <= data.maxInstallments, {
    message: "A parcela mínima deve ser menor ou igual à máxima",
    path: ["maxInstallments"],
  });
