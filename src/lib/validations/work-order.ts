import { z } from "zod";
import { CYLINDER_TIERS } from "@/lib/validations/client";

export const PAYMENT_METHODS = ["DEBITO", "CREDITO", "PIX"] as const;

export const createWorkOrderSchema = z.object({
  clientId: z.string().optional(),
  newClient: z
    .object({
      name: z.string().trim().min(2, "Informe o nome do cliente"),
      phone: z.string().trim().min(8, "Informe um telefone válido"),
    })
    .optional(),

  motorcycleId: z.string().optional(),
  newMotorcycle: z
    .object({
      brand: z.string().trim().min(2, "Informe a marca"),
      model: z.string().trim().min(1, "Informe o modelo"),
      color: z.string().trim().min(2, "Informe a cor"),
      plate: z.string().trim().min(6, "Informe a placa"),
      cylinderTier: z.enum(CYLINDER_TIERS),
      notes: z
        .string()
        .trim()
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
    })
    .optional(),

  scheduledAt: z.string().min(1, "Informe a data/hora"),
  estimatedDeliveryAt: z.string().min(1, "Informe a previsão de entrega"),
  serviceIds: z.array(z.string()).min(1, "Selecione ao menos um serviço"),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  notes: z.string().trim().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

export type CreateWorkOrderInput = z.input<typeof createWorkOrderSchema>;
