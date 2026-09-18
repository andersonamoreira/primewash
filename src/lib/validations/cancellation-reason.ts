import { z } from "zod";

export const cancellationReasonSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do motivo"),
});
