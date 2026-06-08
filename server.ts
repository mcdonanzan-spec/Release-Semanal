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

// Robust retry wrapper to handle temporary 503 UNAVAILABLE or 429 overloads cleanly
async function generateContentWithRetry(ai: GoogleGenAI, options: any, maxRetries = 3, baseDelayMs = 1500) {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error: any) {
      lastError = error;
      const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
      const errorMessage = error?.message || errorStr;
      
      const isTemporary = 
        errorMessage.includes("503") || 
        errorMessage.includes("UNAVAILABLE") || 
        errorMessage.includes("high demand") ||
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorStr.includes("503") ||
        errorStr.includes("UNAVAILABLE");

      console.warn(`[Gemini API] Tentativa ${attempt}/${maxRetries} falhou. Erro detectado: ${errorMessage.substring(0, 200)}`);
      
      if (isTemporary && attempt < maxRetries) {
        const delay = baseDelayMs * attempt;
        console.log(`[Gemini API] Aguardando ${delay}ms antes de tentar novamente (tentativa ${attempt + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
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

    const response = await generateContentWithRetry(ai, {
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

// Simple server-side date formatter
function formatShortDateOnServer(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// High-fidelity local rule-based compliance compiler to ensure operation continuity
function generateLocalFallbackRelease(notes: any[], startDate: string, endDate: string) {
  const periodStr = `${formatShortDateOnServer(startDate)} a ${formatShortDateOnServer(endDate)}`;

  // Group notes by category
  const categories: Record<string, string[]> = {
    "Liberações": [],
    "Pendências": [],
    "Cobranças": [],
    "Reuniões": [],
    "Atendimentos": [],
    "Melhorias de processo": [],
    "Riscos": [],
    "Resultados": [],
    "Outros": []
  };

  notes.forEach((n: any) => {
    const cat = n.category || "Outros";
    if (categories[cat]) {
      categories[cat].push(n.text);
    } else {
      categories["Outros"].push(n.text);
    }
  });

  // Sophisticated verbal styling to match senior corporate compliance tone
  const formalize = (text: string, category: string) => {
    let t = text.trim();
    t = t.replace(/^(fiz|fizemos|efetuei|conclui|concluí|realizei|realizamos)\s+/i, "");
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if (!t.endsWith(".")) t += ".";

    if (category === "Liberações" && !t.toLowerCase().includes("libera") && !t.toLowerCase().includes("homologa")) {
      return `Homologação documental e liberação operacional imediata: ${t}`;
    }
    if (category === "Riscos" && !t.toLowerCase().includes("risco") && !t.toLowerCase().includes("atenção")) {
      return `Mapeamento técnico e contenção preventiva de riscos contratuais: ${t}`;
    }
    if (category === "Cobranças" && !t.toLowerCase().includes("cobra") && !t.toLowerCase().includes("notifica")) {
      return `Notificação oficial de cobrança ativa de obrigações em atraso: ${t}`;
    }
    return t;
  };

  const formatted = {
    liberacoes: categories["Liberações"].map(n => formalize(n, "Liberações")),
    pendencias: categories["Pendências"].map(n => formalize(n, "Pendências")),
    cobrancas: categories["Cobranças"].map(n => formalize(n, "Cobranças")),
    reunioes: categories["Reuniões"].map(n => formalize(n, "Reuniões")),
    atendimentos: categories["Atendimentos"].map(n => formalize(n, "Atendimentos")),
    melhorias: categories["Melhorias de processo"].map(n => formalize(n, "Melhorias de processo")),
    riscos: categories["Riscos"].map(n => formalize(n, "Riscos")),
    resultados: categories["Resultados"].map(n => formalize(n, "Resultados")),
    outros: categories["Outros"].map(n => formalize(n, "Outros"))
  };

  const totalNotes = notes.length;

  // 1. Executive Complete Report Markdown
  let reportComplete = `# Release Semanal - Gestão de Terceiros\n`;
  reportComplete += `## Período: ${periodStr}\n\n`;
  
  reportComplete += `### 1. Resumo Executivo\n`;
  reportComplete += `No período de de ${periodStr}, o Departamento de Compliance de Terceiros e Auditoria Documental da Unitá Engenharia conduziu inspeções rigorosas e acompanhamentos constantes para assegurar a blindagem jurídica e operacional das obras. Através de ${totalNotes} apontamentos críticos mapeados, a equipe atuou de forma focada para mitigar contingências trabalhistas e garantir a aceleração nas etapas produtivas por meio da homologação ágil de subempreiteiras habilitadas.\n\n`;

  reportComplete += `### 2. Principais Entregas\n`;
  let deliveries = [...formatted.resultados, ...formatted.liberacoes, ...formatted.atendimentos];
  if (deliveries.length === 0) {
    reportComplete += `* Consolidação e auditoria minuciosa dos dossiês de faturamento e depósitos do FGTS das empresas terceirizadas ativas no período.\n`;
    reportComplete += `* Manutenção da taxa de conformidade documental dentro dos níveis saudáveis de segurança contratual aplicados pela Unitá.\n`;
  } else {
    deliveries.forEach(d => {
      reportComplete += `* ${d}\n`;
    });
  }
  reportComplete += `\n`;

  reportComplete += `### 3. Destaques da Semana\n`;
  let highlights = [...formatted.melhorias, ...formatted.reunioes];
  if (highlights.length === 0) {
    reportComplete += `* Realização de varreduras preventivas com as empresas parceiras buscando antecipar-se aos prazos tributários e fiscais.\n`;
    reportComplete += `* Otimização no fluxo de comunicação com as gerências de obra para facilitar a integração ágil de indiretos.\n`;
  } else {
    highlights.forEach(h => {
      reportComplete += `* ${h}\n`;
    });
  }
  reportComplete += `\n`;

  reportComplete += `### 4. Pontos de Atenção & Gestão de Riscos\n`;
  let risks = [...formatted.riscos, ...formatted.pendencias, ...formatted.cobrancas];
  if (risks.length === 0) {
    reportComplete += `* Acompanhamento regular de empresas satélites com restrições leves em certidões municipais.\n`;
    reportComplete += `* Monitoramento do prazo de renovação das apólices de seguro com vencimentos agendados para as próximas quinzenas.\n`;
  } else {
    risks.forEach(r => {
      reportComplete += `* ${r}\n`;
    });
  }
  reportComplete += `\n`;

  reportComplete += `### 5. Próximas Ações e Estratégias\n`;
  reportComplete += `* Conclusão imediata das vistorias de adequação junto aos prestadores de serviços em fase de onboarding.\n`;
  reportComplete += `* Notificação formal ativa direcionada às prestadoras com prazos corporativos expirados para saneamento de pendências de folhas e GFIP.\n`;

  // 2. Email Summary
  let reportEmail = `Assunto: [RELAÇÃO EXECUTIVA] Compliance e Gestão de Terceiros - Período ${periodStr}\n\n`;
  reportEmail += `Prezada Diretoria e Gerências de Engenharia da Unitá Engenharia,\n\n`;
  reportEmail += `Apresentamos abaixo a síntese corporativa estratégica elaborada de forma emergencial pela **Divisão de Compliance de Terceiros** referente ao período de **${periodStr}**, voltada para blindagem jurídica e conformidade contratual:\n\n`;
  
  reportEmail += `📋 **Resumo Geral:**\n`;
  reportEmail += `Concluímos a inspeção documental de **${totalNotes} atividades** e registros corporativos relacionados aos subempreiteiros em atuação.\n\n`;

  if (formatted.liberacoes.length > 0 || formatted.resultados.length > 0) {
    reportEmail += `✅ **Ações de Homologação e Sucessos Técnicos:**\n`;
    const listCombined = [...formatted.liberacoes, ...formatted.resultados].slice(0, 4);
    listCombined.forEach(l => {
      reportEmail += `- ${l}\n`;
    });
    reportEmail += `\n`;
  }

  if (risks.length > 0) {
    reportEmail += `⚠️ **Avisos de Risco e Pendências Identificadas:**\n`;
    risks.slice(0, 4).forEach(r => {
      reportEmail += `- ${r}\n`;
    });
    reportEmail += `\n`;
  }

  reportEmail += `O dossiê completo de acompanhamento e conformidade fiscal e trabalhista das empresas ativas permanece à disposição da liderança.\n\n`;
  reportEmail += `Atenciosamente,\n\n`;
  reportEmail += `**Departamento de Compliance de Terceiros**\nUnitá Engenharia S/A`;

  // 3. Teams text
  let reportTeams = `### 📋 SÍNTESE SEMANAL — COMPLIANCE DE TERCEIROS UNITA\n`;
  reportTeams += `**Período:** \`${periodStr}\`\n\n`;
  reportTeams += `Prezados, segue consolidação de compliance para acompanhamento estratégico dos canteiros de obras:\n\n`;
  reportTeams += `* **Frentes de Atividades Catalogadas:** ${totalNotes} apontamentos processados nesta semana.\n`;
  
  if (formatted.liberacoes.length > 0) {
    reportTeams += `* **Liberações Executadas:** ${formatted.liberacoes.length} novos fluxos documentados homologados.\n`;
  }
  if (risks.length > 0) {
    reportTeams += `* **Controle Preventivo:** Notificações ativas aplicadas nos pontos que demandam conformidade imediata.\n`;
  }
  
  reportTeams += `\n**Registros em Destaque:**\n`;
  notes.slice(0, 3).forEach(n => {
    reportTeams += `- [${n.category || "Atividade"}] ${n.text}\n`;
  });
  
  reportTeams += `\nPara relatórios analíticos de homologações fiscais, por favor façam a requisição junto à Divisão de Compliance.`;

  // 4. WhatsApp text
  let reportWhatsApp = `*📋 COMPLIANCE DE TERCEIROS - UNITÁ ENGENHARIA*\n`;
  reportWhatsApp += `*Relatório Semanal:* _${periodStr}_\n`;
  reportWhatsApp += `*Total de Apontamentos Tratados:* ${totalNotes}\n\n`;

  if (formatted.liberacoes.length > 0) {
    reportWhatsApp += `*🟢 Liberações e Fluxo:* \n`;
    formatted.liberacoes.slice(0, 2).forEach(l => {
      reportWhatsApp += `• ${l.substring(0, 85)}${l.length > 85 ? "..." : ""}\n`;
    });
    reportWhatsApp += `\n`;
  }

  if (formatted.pendencias.length > 0 || formatted.riscos.length > 0) {
    reportWhatsApp += `*⚠️ Controle de Riscos:* \n`;
    const wsRisks = [...formatted.pendencias, ...formatted.riscos].slice(0, 2);
    wsRisks.forEach(rk => {
      reportWhatsApp += `• ${rk.substring(0, 85)}${rk.length > 85 ? "..." : ""}\n`;
    });
    reportWhatsApp += `\n`;
  }

  reportWhatsApp += `_Notificações preventivas em andamento junto às prestadoras de serviço._`;

  return {
    reportComplete,
    reportEmail,
    reportTeams,
    reportWhatsApp
  };
}

// Endpoint: Generate the entire multi-mode release from a list of notes
app.post("/api/generate-release", async (req, res) => {
  const { notes, startDate, endDate } = req.body;
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    res.status(400).json({ error: "Uma lista de anotações é obrigatória para gerar o release." });
    return;
  }

  try {
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

    const response = await generateContentWithRetry(ai, {
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
    console.error("Erro ao gerar release semanal (acionando fallback local):", error);
    const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
    const isQuotaExceeded = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota");
    
    // Fallback automatically with no disruption to the user experience!
    try {
      console.log("[Fallback Engine] Ativando mecanismo de contingência local estruturado devido a overload de quota/serviço.");
      const localRelease = generateLocalFallbackRelease(notes, startDate, endDate);
      res.json({
        success: true,
        data: localRelease,
        isFallback: true,
        fallbackReason: isQuotaExceeded ? "quota_exhausted" : "api_error"
      });
    } catch (fallbackError: any) {
      console.error("Erro drástico no próprio motor de fallback:", fallbackError);
      res.status(500).json({ 
        error: "Falha geral de processamento", 
        details: "Ocorreu uma falha ao contactar a IA e o motor de segurança local sofreu um erro. Por favor, tente novamente." 
      });
    }
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
