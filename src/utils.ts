/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeekNote } from "./types";

// Get current date formatted in Portuguese: e.g. "Segunda-feira, 8 de junho de 2026"
export function formatLongDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Get short date e.g. "08/06/2026"
export function formatShortDate(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Get start date (Monday) and end date (Sunday) of the week containing the given date
export function getWeekRange(refDateStrStr?: string): { start: string; end: string } {
  const ref = refDateStrStr ? new Date(refDateStrStr + "T12:00:00") : new Date();
  const day = ref.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate difference to Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: formatDateISO(monday),
    end: formatDateISO(sunday),
  };
}

// Helper to format Date to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Examples of realistic notes for "Departamento de Gestão de Terceiros" in Brazilian context:
export const NOTE_EXAMPLES = [
  "Cobrado documentação trabalhista de 15 empresas da obra Araras.",
  "Liberadas 8 empresas subempreiteiras para início das atividades após aprovação cadastral.",
  "Reunião com engenharia e compliance para alinhar integrações de novos contratos.",
  "Criado novo fluxo automatizado no Excel para acompanhamento de certidões e SEFIP.",
  "Atendidos 14 chamados de dúvidas de fiscais de contrato sobre a NR-4 e NR-18.",
  "Identificado risco grave de passivo em 2 empresas terceirizadas da obra Curitiba que estão com FGTS em atraso. Notificado jurídico.",
  "Consolidado relatório de KPIs da semana: 94% de conformidade com a folha de pagamento terceirizada.",
  "Visita técnica ao canteiro de Belo Horizonte para vistoria assistida de documentação física de terceirizados.",
  "Pendente recebimento da guia do INSS (GPS) da subempreiteira Alfa Engenharia para liberação de medição."
];

// Color mapping for the categories
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  "Liberações": {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/30",
    iconBg: "bg-emerald-100 text-emerald-800"
  },
  "Pendências": {
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/30",
    iconBg: "bg-amber-100 text-amber-800"
  },
  "Cobranças": {
    bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/30",
    iconBg: "bg-blue-100 text-blue-800"
  },
  "Reuniões": {
    bg: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/30",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/30",
    iconBg: "bg-violet-100 text-violet-800"
  },
  "Atendimentos": {
    bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/30",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800/30",
    iconBg: "bg-sky-100 text-sky-800"
  },
  "Melhorias de processo": {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/30",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/30",
    iconBg: "bg-indigo-100 text-indigo-800"
  },
  "Riscos": {
    bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/30",
    iconBg: "bg-rose-100 text-rose-800"
  },
  "Resultados": {
    bg: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/30",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/30",
    iconBg: "bg-teal-100 text-teal-800"
  },
  "Outros": {
    bg: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800/30",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800/30",
    iconBg: "bg-slate-100 text-slate-800"
  }
};
