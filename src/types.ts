/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeekNote {
  id: string;
  text: string;
  date: string; // ISO date string YYYY-MM-DD
  category?: NoteCategory;
}

export type NoteCategory =
  | "Liberações"
  | "Pendências"
  | "Cobranças"
  | "Reuniões"
  | "Atendimentos"
  | "Melhorias de processo"
  | "Riscos"
  | "Resultados"
  | "Outros";

export interface GeneratedRelease {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  notesUsed: WeekNote[];
  
  // Output modes matching the request
  reportComplete: string; // Relatório executivo completo (Markdown)
  reportEmail: string;    // Resumo para e-mail (Markdown / styled text)
  reportTeams: string;    // Texto formatado para o Microsoft Teams
  reportWhatsApp: string; // Texto formatado para o WhatsApp corporativo
}
