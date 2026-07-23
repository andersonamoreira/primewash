import { z } from "zod";
import { CYLINDER_TIERS } from "@/lib/validations/client";

export const PAYMENT_METHODS = ["DEBITO", "CREDITO", "PIX", "DINHEIRO"] as const;

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const serviceLineItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("catalog"), serviceId: z.string().min(1, "Serviço inválido") }),
  z.object({
    kind: z.literal("custom"),
    name: z.string().trim().min(2, "Informe o nome do serviço avulso"),
    price: z.coerce.number().min(0.01, "Informe um valor válido"),
  }),
]);

export type ServiceLineItemInput = z.input<typeof serviceLineItemSchema>;

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
      plate: optionalText.transform((v) => v?.toUpperCase()),
      cylinderTier: z.enum(CYLINDER_TIERS),
      notes: optionalText,
    })
    .optional(),

  scheduledAt: z.string().min(1, "Informe a data/hora"),
  estimatedDeliveryAt: z.string().min(1, "Informe a previsão de entrega"),
  services: z.array(serviceLineItemSchema).min(1, "Selecione ao menos um serviço"),
  discount: z.coerce.number().min(0, "Desconto inválido").optional().default(0),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  notes: optionalText,
});

export type CreateWorkOrderInput = z.input<typeof createWorkOrderSchema>;

export const updateWorkOrderDetailsSchema = z.object({
  scheduledAt: z.string().min(1, "Informe a data/hora"),
  estimatedDeliveryAt: z.string().min(1, "Informe a previsão de entrega"),
  services: z.array(serviceLineItemSchema).min(1, "Selecione ao menos um serviço"),
  discount: z.coerce.number().min(0, "Desconto inválido").optional().default(0),
  notes: optionalText,
});

export type UpdateWorkOrderDetailsInput = z.input<typeof updateWorkOrderDetailsSchema>;
