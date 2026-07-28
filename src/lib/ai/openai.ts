import OpenAI from "openai";

import { lancamentoExtraidoSchema } from "@/lib/ai/extraction";

// Usamos o SDK da OpenAI apontando para o endpoint compativel do Google Gemini.
// Assim mantemos o mesmo codigo e trocamos apenas baseURL/modelo/chave via env.
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

let cachedClient: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY nao configurada.");
  }

  cachedClient ??= new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL });
  return cachedClient;
}

const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

const SYSTEM_PROMPT = [
  "Voce extrai dados de lancamentos financeiros a partir de texto em portugues do Brasil.",
  "Retorne SOMENTE: valor (numero em reais), descricao (curta), tipo e data.",
  "tipo = 'despesa' para gastos/pagamentos; 'receita' para recebimentos/ganhos.",
  "Interprete valores como '45,90' (virgula decimal) e 'R$ 1.500' (ponto de milhar) corretamente.",
  "descricao deve ser curta e objetiva (ex.: 'jantar', 'salario').",
  "Se o texto nao citar um valor claro, retorne valor 0 e confianca baixa.",
].join(" ");

function buildSystemPrompt(hoje: string) {
  return [
    SYSTEM_PROMPT,
    `A data de hoje e ${hoje} (formato YYYY-MM-DD).`,
    "O campo data deve ser sempre uma data absoluta no formato YYYY-MM-DD.",
    "Resolva expressoes relativas usando a data de hoje como referencia:",
    "'hoje' = a data de hoje; 'ontem' = 1 dia antes; 'anteontem' = 2 dias antes;",
    "'semana passada' = 7 dias antes; 'dia 25' = dia 25 do mes atual.",
    "Se o texto NAO mencionar nenhuma data, use exatamente a data de hoje.",
  ].join(" ");
}

export async function extrairLancamento(texto: string, hoje: string) {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: buildSystemPrompt(hoje) },
      { role: "user", content: texto },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lancamento_extraido",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["valor", "descricao", "tipo", "data", "confianca"],
          properties: {
            valor: { type: "number" },
            descricao: { type: "string" },
            tipo: { type: "string", enum: ["receita", "despesa"] },
            data: { type: "string", description: "Data no formato YYYY-MM-DD" },
            confianca: { type: "number" },
          },
        },
      },
    },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return lancamentoExtraidoSchema.parse(JSON.parse(raw));
}
