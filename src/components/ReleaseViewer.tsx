/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GeneratedRelease, WeekNote } from "../types";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Mail, 
  MessageSquare, 
  Share2, 
  FileText, 
  HeartHandshake,
  Download,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { formatShortDate } from "../utils";

interface ReleaseViewerProps {
  onGenerateRelease: () => Promise<void>;
  isGenerating: boolean;
  currentRelease: GeneratedRelease | null;
  notesCount: number;
  totalNotesCount: number;
}

export default function ReleaseViewer({
  onGenerateRelease,
  isGenerating,
  currentRelease,
  notesCount,
  totalNotesCount,
}: ReleaseViewerProps) {
  const [activeTab, setActiveTab] = useState<"complete" | "email" | "teams" | "whatsapp">("complete");
  const [copied, setCopied] = useState(false);
  const [showPrintBanner, setShowPrintBanner] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintAndDownload = () => {
    if (!currentRelease) return;

    // 1. Try native printing
    try {
      window.print();
    } catch (e) {
      console.warn("Impressão bloqueada pelo sandbox do iframe, prosseguindo com o download do HTML de alta fidelidade.");
    }

    // 2. Generate and download clean high-fidelity HTML file with Unitá corporate header and auto-trigger
    const mdLines = currentRelease.reportComplete.split("\n");
    let htmlContent = "";
    mdLines.forEach((line) => {
      if (line.startsWith("# ")) {
        htmlContent += `<h1 style="font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 24px; margin-bottom: 16px;">${line.replace("# ", "")}</h1>`;
      } else if (line.startsWith("## ")) {
        htmlContent += `<h2 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 20px; margin-bottom: 12px;">${line.replace("## ", "")}</h2>`;
      } else if (line.startsWith("### ")) {
        htmlContent += `<h3 style="font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: #4338ca; margin-top: 16px; margin-bottom: 8px;">${line.replace("### ", "")}</h3>`;
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        htmlContent += `<li style="font-size: 14px; color: #334155; margin-left: 16px; list-style-type: disc; margin-bottom: 4px; line-height: 1.6;">${line.substring(2)}</li>`;
      } else if (line.trim() === "") {
        // Simple break space
      } else {
        htmlContent += `<p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 8px;">${line}</p>`;
      }
    });

    const fullHtml = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Release Semanal Unitá Engenharia - ${formatShortDate(currentRelease.startDate)} a ${formatShortDate(currentRelease.endDate)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-area {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .unita-logo {
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .unita-text {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #030712;
      line-height: 1;
      position: relative;
      padding-right: 12px;
    }
    .unita-orange-bar {
      position: absolute;
      top: 3.5px;
      right: 0;
      width: 9px;
      height: 5px;
      background-color: #E65A10;
      border-radius: 2px;
      transform: rotate(-22deg);
    }
    .unita-subtext {
      font-size: 7.6px;
      font-weight: 800;
      letter-spacing: 0.41em;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 6px;
      line-height: 1;
    }
    .banner {
      max-width: 800px;
      margin: 24px auto 0 auto;
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #1e40af;
      font-size: 13px;
    }
    .banner button {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .banner button:hover {
      background-color: #1d4ed8;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .print-area {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-area">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div class="unita-logo">
          <div class="unita-text">
            unıta
            <div class="unita-orange-bar"></div>
          </div>
          <div class="unita-subtext">ENGENHARIA</div>
        </div>
        <div style="width: 1px; height: 40px; background-color: #cbd5e1;"></div>
        <div>
          <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: block;">DIVISÃO DE COMPLIANCE</span>
          <span style="font-size: 11px; font-weight: 600; color: #334155; display: block; margin-top: 4px;">SISTEMA DE GESTÃO DE TERCEIROS</span>
        </div>
      </div>
      
      <div style="font-family: monospace; font-size: 10px; color: #64748b; text-align: right; line-height: 1.5;">
        <div><strong>REF:</strong> REL-SEMANAL-T3-${currentRelease.startDate.replace(/-/g, "")}</div>
        <div><strong>DATA:</strong> ${formatShortDate(new Date().toISOString().split("T")[0])}</div>
        <div><strong>SITUAÇÃO:</strong> LIBERADO PARA DIRETORIA</div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 32px; font-size: 11px;">
      <div>
        <span style="display: block; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; margin-bottom: 2px;">Emissor</span>
        <span style="font-weight: 600; color: #1e293b;">Depto. de Compliance de Terceiros</span>
      </div>
      <div>
        <span style="display: block; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; margin-bottom: 2px;">Período</span>
        <span style="font-weight: 600; color: #1e293b;">De ${formatShortDate(currentRelease.startDate)} a ${formatShortDate(currentRelease.endDate)}</span>
      </div>
      <div>
        <span style="display: block; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; margin-bottom: 2px;">Responsabilidade</span>
        <span style="font-weight: 600; color: #1e293b;">Gestão Unificada Unitá</span>
      </div>
      <div>
        <span style="display: block; font-weight: 700; color: #94a3b8; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; margin-bottom: 2px;">Classificação</span>
        <span style="font-weight: 700; color: #E65A10;">CONFIDENCIAL DIRETORIA</span>
      </div>
    </div>

    <!-- Document Content -->
    <div style="font-family: 'Inter', sans-serif; color: #334155;">
      ${htmlContent}
    </div>

    <!-- Signatures -->
    <div style="margin-top: 56px; padding-top: 48px; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; text-align: center; font-size: 12px; color: #64748b;">
      <div>
        <div style="width: 192px; height: 1px; background-color: #cbd5e1; margin: 0 auto 8px auto;"></div>
        <p style="font-weight: 700; color: #1e293b; margin: 0;">Gargalo e Compliance de Subempreiteiras</p>
        <p style="font-size: 10px; color: #94a3b8; margin: 2px 0 0 0;">Elaborado por IA — Departamento de Terceiros Unitá</p>
      </div>
      <div>
        <div style="width: 192px; height: 1px; background-color: #cbd5e1; margin: 0 auto 8px auto;"></div>
        <p style="font-weight: 700; color: #1e293b; margin: 0;">Visto de Gerência de Engenharia</p>
        <p style="font-size: 10px; color: #94a3b8; margin: 2px 0 0 0;">Validação e Arquivo de Obras Unitá Engenharia</p>
      </div>
    </div>
  </div>

  <div class="banner no-print">
    <span>O diálogo de impressão do seu navegador foi acionado automaticamente. Você também pode salvar este arquivo como PDF em formato Timbrado.</span>
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    // Trigger local download link securely
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Unita_Release_Semanal_${currentRelease.startDate}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show nice informative status box
    setShowPrintBanner(true);
    setTimeout(() => {
      setShowPrintBanner(false);
    }, 12000);
  };

  // Simple Markdown-like renderer to make the Executive Report look super clean in HTML
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Headers H1
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="font-display font-extrabold text-2xl text-slate-900 border-b border-slate-100 pb-2 mt-6 mb-4 dark:text-white dark:border-slate-800">
            {line.replace("# ", "")}
          </h1>
        );
      }
      // Headers H2
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="font-display font-bold text-lg text-slate-800 mt-5 mb-3 dark:text-slate-150">
            {line.replace("## ", "")}
          </h2>
        );
      }
      // Headers H3
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="font-display font-bold text-sm text-indigo-700 mt-4 mb-2 dark:text-indigo-400">
            {line.replace("### ", "")}
          </h3>
        );
      }
      // Bullet points
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const bulletText = line.substring(2);
        return (
          <li key={index} className="ml-4 list-disc text-sm text-slate-705 dark:text-slate-350 mb-1 leading-relaxed">
            {bulletText}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      return (
        <p key={index} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  // For the copy actions
  const getActiveText = () => {
    if (!currentRelease) return "";
    switch (activeTab) {
      case "complete":
        return currentRelease.reportComplete;
      case "email":
        return currentRelease.reportEmail;
      case "teams":
        return currentRelease.reportTeams;
      case "whatsapp":
        return currentRelease.reportWhatsApp;
    }
  };

  return (
    <div id="release-viewer-card" className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      
      {/* Top action indicator */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 dark:bg-slate-950/25 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-950/50 dark:text-emerald-400">
                2
              </span>
              Gerar Relatório Executivo
            </h2>
          </div>

          <button
            id="generate-release-button"
            onClick={onGenerateRelease}
            disabled={isGenerating || notesCount === 0}
            className="inline-flex cursor-pointer select-none items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-medium px-5 py-2.5 rounded-xl text-xs sm:text-sm hover:shadow-md hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 animate-shimmer"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-white"></div>
                <span>IA organizando e redigindo...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-emerald-100" />
                <span>Gerar Release Semanal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-100 dark:border-emerald-950 border-t-emerald-600 animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-200">
              Processando anotações com a inteligência Gemini 3.5...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Nossa IA está correlacionando as atividades operacionais, categorizando-as em libertações, riscos, reuniões, e gerando relatórios de alta performance para a gerência.
            </p>
          </div>
        </div>
      ) : currentRelease ? (
        <div>
          {/* Executive Sub-Header Tab Selector */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-2 flex flex-wrap gap-1 dark:border-slate-800 dark:bg-slate-950/20">
            <button
              onClick={() => setActiveTab("complete")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 ${
                activeTab === "complete"
                  ? "bg-white text-slate-900 shadow-3xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Relatório Executivo</span>
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 ${
                activeTab === "email"
                  ? "bg-white text-slate-900 shadow-3xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>E-mail Corporativo</span>
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 ${
                activeTab === "teams"
                  ? "bg-white text-slate-900 shadow-3xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>Microsoft Teams</span>
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 ${
                activeTab === "whatsapp"
                  ? "bg-white text-slate-900 shadow-3xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Share2 className="h-3.5 w-3.5 text-slate-400" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Active Content Preview Tab Box */}
          <div className="p-6 relative">
            {currentRelease.isFallback && (
              <div className="no-print mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-slate-200 antialiased text-xs flex flex-col space-y-1 shadow-3xs">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Relatório Consolidado via Inteligência de Contingência</span>
                </div>
                <p className="opacity-95 leading-relaxed m-0 mt-0.5 whitespace-normal">
                  Devido à altíssima demanda do servidor de IA do Google (Limite de Cota Atingido), nosso <strong>Motor Local de Compliance da Unitá</strong> assumiu o processamento de forma inteligente. Suas anotações foram analisadas e os modelos abaixo foram gerados com total rigor corporativo e qualidade técnica!
                </p>
              </div>
            )}

            {/* Custom Dynamic Print Style Sheet embedded */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                /* Hide everything except the printable report */
                body * {
                  visibility: hidden !important;
                }
                #unita-printable-report, #unita-printable-report * {
                  visibility: visible !important;
                }
                #unita-printable-report {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  padding: 40px !important;
                  background: white !important;
                  color: black !important;
                  border: none !important;
                  box-shadow: none !important;
                }
                /* Exclude elements marked as no-print */
                .no-print {
                  display: none !important;
                }
                /* Keep simple dark text for print */
                h1, h2, h3, h4, p, li, span, td, border {
                  color: black !important;
                  border-color: #d1d5db !important;
                }
              }
            `}} />

            <div className="absolute right-6 top-4 z-10 flex items-center gap-2">
              {activeTab === "complete" && (
                <button
                  onClick={handlePrintAndDownload}
                  className="inline-flex items-center gap-1.5 select-none text-2xs cursor-pointer bg-[#E65A10] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#c84e0b] shadow-3xs hover:shadow-2xs transition duration-150 font-semibold"
                >
                  <Download className="h-3 w-3 text-white" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
              )}
              <button
                onClick={() => handleCopy(getActiveText())}
                className="inline-flex items-center gap-1.5 select-none text-2xs cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition dark:bg-slate-850 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">Copiável!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-450" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured Tab viewports */}
            <div className="prose prose-slate max-w-none pt-6">
              {activeTab === "complete" && showPrintBanner && (
                <div className="no-print mb-5 p-4 rounded-xl bg-orange-50 border border-orange-200 text-slate-900 dark:bg-slate-950/45 dark:border-orange-950/30 dark:text-slate-105 antialiased text-xs flex flex-col space-y-1 shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                    <span className="h-2 w-2 rounded-full bg-[#E65A10] animate-ping"></span>
                    <span>Relatório Timbrado Baixado com Sucesso!</span>
                  </div>
                  <p className="opacity-95 leading-relaxed m-0 mt-1">
                    Como a pré-visualização do chat limita a impressão direta por regras de segurança do navegador, 
                    <strong> nós geramos e baixamos automaticamente um arquivo de altíssima definição <code>Unita_Release_Semanal.html</code></strong> em sua máquina. 
                    Abra este arquivo em seu computador (fora do painel) para ver o papel timbrado corporativo oficial e imprimir ou exportar para PDF com perfeição instantaneamente.
                  </p>
                </div>
              )}

              {activeTab === "complete" && (
                <div 
                  id="unita-printable-report" 
                  className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-100 transition-colors duration-150"
                >
                  {/* Unitá Official Designed Header Section for construction companies */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-5 mb-6 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      {/* Accurate Unitá Engenharia logo SVG/HTML implementation */}
                      <div className="flex flex-col items-start select-none font-sans">
                        <div className="flex items-baseline relative pr-2">
                          <span className="text-3xl font-extrabold tracking-tighter text-slate-950 dark:text-white leading-none">
                            unıta
                          </span>
                          {/* Corporate Orange accent bar scaled */}
                          <div className="absolute top-[3px] right-0 w-[9px] h-[4px] bg-[#E65A10] rounded-xs transform -rotate-[22deg]"></div>
                        </div>
                        <span className="text-[7.6px] font-bold tracking-[0.41em] text-slate-505 dark:text-slate-400 uppercase mt-1.5 leading-none">
                          ENGENHARIA
                        </span>
                      </div>
                      
                      <div className="hidden sm:block h-10 w-px bg-slate-300 dark:bg-slate-700"></div>
                      
                      <div className="hidden sm:block">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 block leading-none">
                          DIVISÃO DE COMPLIANCE
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mt-1">
                          SISTEMA DE GESTÃO DE TERCEIROS
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 text-left sm:text-right font-mono text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 border-t border-dashed border-slate-200 pt-3 w-full sm:pt-0 sm:border-t-0 sm:w-auto">
                      <div><strong>REF:</strong> REL-SEMANAL-T3-{currentRelease.startDate.replace(/-/g, "")}</div>
                      <div><strong>DATA:</strong> {formatShortDate(new Date().toISOString().split("T")[0])}</div>
                      <div><strong>SITUAÇÃO:</strong> LIBERADO PARA DIRETORIA</div>
                    </div>
                  </div>

                  {/* Document Dossier Metadata Matrix */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-xl mb-8 text-[11px] text-slate-700 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-300">
                    <div>
                      <span className="block font-bold text-slate-450 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Emissor</span>
                      <span className="font-semibold text-slate-850 dark:text-white">Depto. de Compliance de Terceiros</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Período Relacionado</span>
                      <span className="font-semibold text-slate-850 dark:text-white">De {formatShortDate(currentRelease.startDate)} a {formatShortDate(currentRelease.endDate)}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Responsabilidade</span>
                      <span className="font-semibold text-slate-850 dark:text-white">Gestão Unificada Unitá</span>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-450 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-0.5">Classificação</span>
                      <span className="font-semibold text-[#E65A10] flex items-center gap-1 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E65A10]"></span>
                        CONCEITO EXECUTIVO CONFIDENCIAL
                      </span>
                    </div>
                  </div>

                  {/* Document Core Information */}
                  <div className="space-y-4 pt-1">
                    {renderMarkdown(currentRelease.reportComplete)}
                  </div>

                  {/* Standard Signatures line for construction company validation */}
                  <div className="mt-14 pt-12 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <div className="space-y-1.5">
                      <div className="mx-auto w-48 h-px bg-slate-300 dark:bg-slate-700"></div>
                      <p className="font-bold text-slate-800 dark:text-slate-250">Gargalo e Compliance de Subempreiteiras</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Elaborado por IA — Departamento de Terceiros Unitá</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="mx-auto w-48 h-px bg-slate-300 dark:bg-slate-700"></div>
                      <p className="font-bold text-slate-800 dark:text-slate-250">Visto de Gerência de Engenharia</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Validação e Arquivo de Obras Unitá Engenharia</p>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === "email" && (
                <div className="bg-slate-50/45 p-6 rounded-xl border border-slate-205 dark:bg-slate-950/30 dark:border-slate-800">
                  <div className="flex items-center gap-2 border-b border-slate-200/55 pb-3 mb-4 text-xs font-mono text-slate-500 dark:border-slate-850">
                    <span className="font-bold text-slate-700 dark:text-slate-400">ASSUNTO:</span>
                    <span>Release Semanal - Equipe de Gestão de Terceiros e Compliance (Período {formatShortDate(currentRelease.startDate)} a {formatShortDate(currentRelease.endDate)})</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-slate-750 dark:text-slate-300 font-sans leading-relaxed">
                    {renderMarkdown(currentRelease.reportEmail)}
                  </div>
                </div>
              )}

              {activeTab === "teams" && (
                <div className="bg-indigo-50/10 p-5 rounded-xl border border-indigo-100/30 dark:bg-slate-950/20 dark:border-indigo-950/20">
                  <div className="flex items-center gap-2 border-b border-indigo-105/35 pb-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Visualização do Teams</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-100 dark:border-slate-850">
                    {currentRelease.reportTeams}
                  </pre>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="bg-emerald-50/10 p-5 rounded-xl border border-emerald-100/30 dark:bg-slate-950/20 dark:border-emerald-950/10">
                  <div className="flex items-center gap-2 border-b border-emerald-105/30 pb-2 mb-4">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Visualização do WhatsApp</span>
                  </div>
                  <div className="bg-emerald-50/20 rounded-2xl p-4 text-sm text-slate-805 dark:bg-slate-950/60 dark:text-slate-200 font-sans border border-emerald-100/10 max-w-sm">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-250">
                      {currentRelease.reportWhatsApp}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory banner feedback */}
            <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-4.5 dark:bg-slate-950/30 dark:border-slate-800">
              <HeartHandshake className="h-5 w-5 text-indigo-505 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Relatório Corporativo Pronto!</p>
                <p className="text-slate-550 dark:text-slate-400">
                  Os formatos acima refletem as melhores práticas de redação de grandes diretorias. Copie o texto de cada canal (E-mail, Teams ou WhatsApp) e encaminhe com apenas 1 clique para agilizar as validações do Departamento de Terceiros.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 dark:bg-slate-950/50 dark:border-slate-800">
            <Sparkles className="h-6 w-6 text-indigo-400 dark:text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-200">
              Nenhum Release Semanal ativo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {notesCount > 0 
                ? "Você possui atividades registradas para esta semana! Clique no botão verde \"Gerar Release Semanal\" acima para acionar nossa Inteligência de Compliance de Terceiros."
                : "Escreva suas atividades corporativas no campo de registros à esquerda."}
            </p>
          </div>

          {notesCount === 0 && totalNotesCount > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-left text-xs text-amber-900 dark:bg-amber-950/15 dark:border-amber-900/30 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-400">
                <HelpCircle className="h-4 w-4" />
                <span>Observação sobre os Registros Cadastrados:</span>
              </p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Você possui <strong className="text-slate-900 dark:text-white">{totalNotesCount} anotação(ões) cadastrada(s)</strong> no sistema, mas elas estão com datas que caem em outros períodos/semanas. 
                Por isso, a semana atual está vazia e o botão de geração fica desativado. 
              </p>
              <div className="pt-2 text-[11px] leading-relaxed text-slate-705 dark:text-slate-300">
                <strong>💡 Como corrigir isso rapidamente:</strong>
                <ul className="list-disc ml-4 space-y-1 mt-1">
                  <li>Use o seletor de semanas no topo da tela para navegar até a data em que cadastrou as atividades.</li>
                  <li>Ou exclua e recrie a atividade alterando o campo <strong>"Data do Registro"</strong> para corresponder à semana atual.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
