/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini Client to avoid crashing if key is not set at startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave de API do Gemini (GEMINI_API_KEY) não está configurada nos segredos ou variáveis de ambiente.");
  }
  
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
  
  return aiClient;
}

// Healthy endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Categorize a single note text using Gemini 3.5 Flash
app.post("/api/categorize-note", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "O texto da anotação é obrigatório." });
      return;
    }

    const ai = getGeminiClient();
    
    const prompt = `Analise a seguinte anotação de atividade corporativa do Departamento de Terceiros e categorize-a em exatamente uma das seguintes categorias disponíveis:
- "Liberações" (se refere a liberação de empresas, funcionários, acessos, integridade de documentos aceita para iniciar tarefas)
- "Pendências" (anotações de tarefas incompletas, atrasos de terceiros, documentos rejeitados que faltam resolver)
- "Cobranças" (atos de cobrar documentação, assinaturas, certidões ou retornos de empresas ou parceiros)
- "Reuniões" (alinhamento, encontros virtuais ou presenciais com engenharia, gerência, terceiros ou integradores)
- "Atendimentos" (solicitações diretas respondidas, suporte aos canteiros de obras ou engenheiros)
- "Melhorias de processo" (criação de fluxos novos, novas regras, automações, otimização das análises)
- "Riscos" (alertas de descumprimento legal, perigos de paralisação de obra, passivos trabalhistas identificados)
- "Resultados" (metas atingidas, números consolidados do dia/semana, relatórios fechados de sucesso)
- "Outros" (atividades diversas que não se encaixam acima)

Anotação do usuário:
"${text.substring(0, 1000)}"

Retorne a resposta respondendo EXCLUSIVAMENTE com o objeto JSON estruturado contendo a propriedade "category".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "A categoria selecionada que melhor se ajusta à anotação. Deve ser exatamente um dos valores especificados no prompt.",
            }
          },
          required: ["category"]
        }
      }
    });

    const bodyText = response.text?.trim() || "";
    const parsed = JSON.parse(bodyText);
    
    // Ensure it is a valid category or fall back to Outros
    const validCategories = [
      "Liberações", "Pendências", "Cobranças", "Reuniões", 
      "Atendimentos", "Melhorias de processo", "Riscos", "Resultados", "Outros"
    ];
    let category = parsed.category;
    if (!validCategories.includes(category)) {
      category = "Outros";
    }

    res.json({ category });
  } catch (error: any) {
    console.error("Erro em /api/categorize-note:", error);
    res.json({ category: "Outros", error: error.message });
  }
});

// Endpoint: Generate the entire multi-mode release from a list of notes
app.post("/api/generate-release", async (req, res) => {
  try {
    const { notes, startDate, endDate } = req.body;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      res.status(400).json({ error: "Uma lista de anotações é obrigatória para gerar o release." });
      return;
    }

    const ai = getGeminiClient();

    // Prepare note data with categorized context
    const groupedNotesStr = notes
      .map((n: any, idx: number) => {
        const dateStr = n.date ? `[Data: ${n.date}]` : "";
        const catStr = n.category ? `[Categoria: ${n.category}]` : "";
        return `${idx + 1}. ${dateStr}${catStr} ${n.text}`;
      })
      .join("\n");

    const systemInstruction = `Você é um Gerente Executivo Sênior especialista em Terceirização, Gestão de Terceiros e Compliance Corporativo. 
Sua missão é transformar um conjunto de anotações diárias brutas, rápidas e coloquiais feitas por analistas do departamento em comunicações gerenciais e executivas profissionais de alto nível.

A linguagem gerada deve ser:
- Estritamente corporativa, técnica, formal, elegante e fluida.
- Focada em resultados tangíveis, eficiência operacional, redução de riscos legais, agilidade de mobilização e alinhamento com a engenharia.
- Livre de jargões clichês de IA (evite palavras vazias como "revolucionário", "espera-se que", "além disso", "olá", "este relatório visa").
- Orientada para a ação e para tomada de decisão pela gerência e diretoria.

Destaque o papel ativo do "Departamento de Terceiros" em resolver gargalos, garantir compliance documental das empresas contratadas e manter as obras seguras e sem interrupções operacionais.`;

    const userPrompt = `Período do Relatório: De ${startDate || "Início da semana"} até ${endDate || "Fim da semana"}.

Anotações de Atividade da Semana:
${groupedNotesStr}

Por favor, analise as anotações do período acima e elabore as 4 saídas de comunicação solicitadas no formato JSON especificado. 

Orientações para as saídas:
1. "reportComplete" (Relatório Executivo Completo):
   - Deve ser estruturado em Markdown com os seguintes títulos exatamente nesta ordem:
     # Release Semanal - Gestão de Terceiros
     ## Período: ${startDate || ""} a ${endDate || ""}
     ### 1. Resumo Executivo
     (Uma visão geral estratégica da semana, destacando o fluxo documental e mobilização)
     ### 2. Principais Entregas
     (Destaque o que foi finalizado ou conquistado, use listas organizadas por relevância)
     ### 3. Destaques da Semana
     (Momentos críticos positivos ou números expressivos da semana)
     ### 4. Pontos de Atenção & Gestão de Riscos
     (Empresas retidas, atrasos graves de terceiros, potenciais passivos ou riscos de parada de obra)
     ### 5. Próximas Ações e Estratégias
     (Planejamento prioritário para a próxima semana)

2. "reportEmail" (Resumo para E-mail):
   - Um e-mail executivo completo em formato Markdown, contendo campo Assunto:, Saudação formal à Diretoria/Gerência, Corpo explicativo com as informações mais importantes da semana resumidas em tópicos estéticos (usando emojis discretos apenas se ajudarem na leitura), e fechamento corporativo profissional.

3. "reportTeams" (Texto para Teams):
   - Conteúdo formatado especificamente para canais de chat do Microsoft Teams. Use formatações limpas do Teams (negritos, listas) e crie uma visualização dinâmica, direta e organizada por blocos rápidos, facilitando a leitura rápida no aplicativo móvel ou desktop.

4. "reportWhatsApp" (Texto para WhatsApp):
   - Um texto curto, condensado, objetivo e ultra-eficaz para leitura via celular. Use recursos de formatação do WhatsApp (*negrito*, _itálico_, quebras de linha generosas) e emojis profissionais estrategicamente posicionados (como 🟢 para status positivo, ⚠️ para riscos, 📅 para datas) para que o gerente leia em 10 segundos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportComplete: {
              type: Type.STRING,
              description: "Relatório executivo completo em markdown estruturado."
            },
            reportEmail: {
              type: Type.STRING,
              description: "E-mail corporativo formatado em markdown com saudação, assunto e corpo estratégico."
            },
            reportTeams: {
              type: Type.STRING,
              description: "Texto formatado de modo limpo e moderno para canais de Microsoft Teams."
            },
            reportWhatsApp: {
              type: Type.STRING,
              description: "Resumo altamente condensado com formatação em estilo WhatsApp (*negrito*, emojis corporativos)."
            }
          },
          required: ["reportComplete", "reportEmail", "reportTeams", "reportWhatsApp"]
        }
      }
    });

    const responseText = response.text?.trim() || "";
    const parsedResponse = JSON.parse(responseText);

    res.json({
      success: true,
      data: parsedResponse
    });
  } catch (error: any) {
    console.error("Erro ao gerar release semanal:", error);
    res.status(500).json({ error: "Não foi possível gerar o release semanal.", details: error.message });
  }
});

// Configure Vite in development mode, or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html on any unknown routes (for SPA routing)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Release Semanal] Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
}

startServer();
