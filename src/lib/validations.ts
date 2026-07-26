import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");
const money = z.coerce.number().positive("Informe um valor maior que zero.");
const nonNegativeMoney = z.coerce
  .number()
  .min(0, "Informe um valor maior ou igual a zero.");

export const authSchemas = {
  login: z.object({
    email: z.string().trim().email("Informe um e-mail valido."),
    password: z.string().min(1, "Informe sua senha."),
  }),
  signUp: z
    .object({
      email: z.string().trim().email("Informe um e-mail valido."),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas nao coincidem.",
      path: ["confirmPassword"],
    }),
};

export const categorySchema = z.object({
  nome: requiredText,
  descricao: z.string().trim().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor hexadecimal."),
  ordem: z.coerce.number().int().min(1, "A ordem deve ser maior que zero."),
});

export const subcategorySchema = z.object({
  categoria_id: z.string().uuid("Categoria invalida."),
  nome: requiredText,
  descricao: z.string().trim().optional(),
});

export const transactionSchema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  origem: z.enum(["fixa", "extra"]),
  valor: money,
  data: requiredText,
  descricao: requiredText,
  subcategoria_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const budgetSchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  ano: z.coerce.number().int().min(2020),
  receita_base: nonNegativeMoney,
  alocacoes: z.array(
    z.object({
      subcategoria_id: z.string().uuid(),
      valor_planejado: nonNegativeMoney,
    }),
  ),
});

export const reportSchema = z
  .object({
    data_inicio: requiredText,
    data_fim: requiredText,
    tipo: z.enum(["resumo", "categorias", "tendencia", "orcamento"]),
  })
  .refine((data) => data.data_inicio <= data.data_fim, {
    message: "A data inicial nao pode ser posterior a data final.",
    path: ["data_fim"],
  });
