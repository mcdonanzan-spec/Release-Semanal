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
}

export default function ReleaseViewer({
  onGenerateRelease,
  isGenerating,
  currentRelease,
  notesCount,
}: ReleaseViewerProps) {
  const [activeTab, setActiveTab] = useState<"complete" | "email" | "teams" | "whatsapp">("complete");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="absolute right-6 top-4 z-5 flex items-center gap-2">
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
            <div className="prose prose-slate max-w-none pt-4">
              {activeTab === "complete" && (
                <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-100 dark:bg-slate-950/20 dark:border-slate-800/40">
                  {renderMarkdown(currentRelease.reportComplete)}
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
        <div className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 dark:bg-slate-950/50 dark:border-slate-800">
            <Sparkles className="h-6 w-6 text-indigo-400 dark:text-indigo-600" />
          </div>
          <h3 className="mt-4 font-display font-bold text-slate-800 dark:text-slate-200">
            Nenhum Release Semanal ativo
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {notesCount > 0 
              ? "Você tem anotações cadastradas! Clique no botão \"Gerar Release Semanal\" no topo para que a Inteligência Artificial elabore os relatórios executivos de alto impacto."
              : "Escreva suas anotações corporativas no campo de registros à esquerda. Assim que registrar suas atividades, você poderá acionar a IA para transformá-las em um release completo."}
          </p>
        </div>
      )}
    </div>
  );
}
