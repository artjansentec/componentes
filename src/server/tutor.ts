import OpenAI from "openai";
import PQueue from "p-queue";
import { loadUserContext, saveUserContext } from "./context";

const queue = new PQueue({ concurrency: 8 });

let _client: OpenAI | null = null;
function getClient() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");
  _client = new OpenAI({ apiKey });
  return _client;
}

const regras_principais = `
Você é um AUXILIADOR de um sistema de gestão (ERP/CRM/Financeiro/Operações).
Seu objetivo é ajudar o usuário a entender cenários, analisar dados e tomar decisões, com clareza.

Estilo obrigatório (para leigos):
- Linguagem simples, direta e calma. Evite jargões; quando inevitável, explique em no máximo 3 linhas.
- Frases curtas. Use listas quando melhorar a leitura.
- Se faltar dado, faça até 3 perguntas objetivas e siga com hipóteses explícitas (sem inventar fatos).

Qualidade da análise (complexa e precisa, em vários níveis):
- Sempre entregue pelo menos 2 níveis quando o usuário pedir análise/decisão:
  1) Resumo executivo (1-3 parágrafos).
  2) Análise detalhada (causas/efeitos, opções, trade-offs).
- Quando fizer sentido, inclua níveis extras:
  - Impacto por área (Financeiro, Operações, Comercial, Fiscal, TI).
  - Riscos e controles.
  - Indicadores/KPIs recomendados.
  - Próximos passos (curtos e acionáveis).

Regras de resposta:
1. Seja sucinto por padrão; aumente detalhe só quando melhorar a decisão.
2. Não invente fatos do negócio. Se algo for suposição, marque como "Hipótese".
3. Se o usuário pedir “melhor opção”, traga alternativas (A/B/C) com prós e contras.
4. Se o usuário pedir “o que fazer agora”, devolva um passo-a-passo curto.
5. Se houver números, cheque consistência (unidade, período, totais) e destaque incoerências.
6. Se envolver conformidade (LGPD/fiscal/segurança), aponte riscos e boas práticas.
7. Mantenha foco no objetivo do usuário (reduzir custo, melhorar prazo, aumentar margem, reduzir erros).
`;

function getDayFromTimestamp(ts: string): string | null {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function writerPrompt(
  rootDir: string,
  userMessage: string,
  jid: string,
  feedback_inicial?: string | null,
  feedback?: string | null,
  historicoDia?: string | null
) {
  const fullContext = await loadUserContext(rootDir, jid);
  const hoje = new Date().toISOString().slice(0, 10);
  const alvo = historicoDia || hoje;

  const conversasFiltradas = (fullContext.conversas ?? []).filter((c) => {
    const dia = getDayFromTimestamp(c.timestamp);
    return dia === alvo;
  });

  const context = { conversas: conversasFiltradas };

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: "Você é um auxiliador de um sistema de gestão. Responda em pt-BR." },
    { role: "system", content: `Regras de comportamento:\n${regras_principais}` },
    { role: "system", content: `Histórico do usuário (dia ${alvo}):\n${JSON.stringify(context, null, 2)}` },
    { role: "user", content: userMessage },
  ];

  if (feedback) {
    messages.push({
      role: "system",
      content: `Ajuste conforme o feedback: ${feedback}. Regra: ${feedback_inicial ?? ""}`,
    });
  }

  return queue.add(async () => {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
    return response.choices[0]?.message?.content ?? "";
  });
}

async function validatorPrompt(answer: string) {
  const context = `
Você é um validador.
Verifique rapidamente se a resposta segue as regras:
${regras_principais}

Critérios de checagem rápida:
- Linguagem simples, direta e compreensível para leigos.
- Tem resumo executivo + análise detalhada quando a pergunta pede análise/decisão.
- Não inventa fatos; marca hipóteses quando necessário.
- Se faltam dados, faz perguntas objetivas (até 3) ou explicita suposições.
- Feedback deve ser direto, curto e fácil de aplicar (ex: "simplifique linguagem", "adicione resumo executivo", "não assuma dados").

Responda apenas em JSON:
{
  "status": "approved" | "rejected",
  "feedback": "Se rejeitado, breve explicação clara e simples"
}
  `;

  return queue.add(async () => {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: context },
        { role: "user", content: answer },
      ],
    });

    try {
      return JSON.parse(response.choices[0]?.message?.content ?? "") as {
        status: "approved" | "rejected";
        feedback?: string;
      };
    } catch {
      return { status: "rejected" as const, feedback: "Resposta inválida" };
    }
  });
}

export async function generateWithValidation(params: {
  rootDir: string;
  userMessage: string;
  jid: string;
  instrucao_desafio?: string | null;
  historicoDia?: string | null;
}) {
  const { rootDir, userMessage, jid, instrucao_desafio, historicoDia } = params;

  let attempt = 0;
  const feedback_inicial = `
Você é um auxiliador de um sistema de gestão.
Regras principais:
${regras_principais}

Contexto do sistema (se houver): ${instrucao_desafio ?? "(não informado)"}
  `;

  let feedback = "Lembre da regra majoritária";

  while (attempt < 5) {
    attempt++;
    const writerAnswer = await writerPrompt(
      rootDir,
      userMessage,
      jid,
      feedback_inicial,
      feedback,
      historicoDia
    );
    const validation = await validatorPrompt(writerAnswer);

    if (validation.status === "approved") {
      const context = await loadUserContext(rootDir, jid);
      context.conversas.push({
        pergunta: userMessage,
        resposta: writerAnswer,
        status: "approved",
        timestamp: new Date().toISOString(),
      });
      await saveUserContext(rootDir, jid, context);

      return { success: true as const, answer: writerAnswer };
    }

    feedback = validation.feedback ?? "Ajuste a resposta";
  }

  return { success: false as const, answer: "❌ Não foi possível validar a resposta." };
}

