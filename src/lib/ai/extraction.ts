import { z } from "zod";

export const lancamentoExtraidoSchema = z.object({
  valor: z.number().positive(),
  descricao: z.string().trim().min(1),
  tipo: z.enum(["receita", "despesa"]).default("despesa"),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  confianca: z.number().min(0).max(1).optional(),
});

export type LancamentoExtraido = z.infer<typeof lancamentoExtraidoSchema>;

export type LancamentoSugestao = LancamentoExtraido & {
  data: string;
};
