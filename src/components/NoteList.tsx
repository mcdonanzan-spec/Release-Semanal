/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Trash2, Calendar, FileText, CheckCircle, Tag, RefreshCcw } from "lucide-react";
import { WeekNote } from "../types";
import { formatLongDate, CATEGORY_COLORS } from "../utils";

interface NoteListProps {
  notes: WeekNote[];
  onDeleteNote: (id: string) => void;
  onCategorizeNoteImmediately: (id: string) => void;
  isCategorizing: Record<string, boolean>;
}

export default function NoteList({
  notes,
  onDeleteNote,
  onCategorizeNoteImmediately,
  isCategorizing,
}: NoteListProps) {
  // Group notes by date descending, then time/id order
  const sortedDates = [...new Set(notes.map((n) => n.date))].sort((a, b) => b.localeCompare(a));

  if (notes.length === 0) {
    return (
      <div id="note-list-empty" className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-150 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display font-bold text-slate-800 dark:text-slate-200">
          Nenhuma anotação nesta semana
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Adicione notas rápidas de atividades ao lado ou clique em &ldquo;Ver exemplos rápidos&rdquo; para preencher o MVP com dados de demonstração.
        </p>
      </div>
    );
  }

  return (
    <div id="notes-timeline-container" className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800/50">
        <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
          Atividades Coletadas da Semana
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Ordenado por histórico
        </span>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {sortedDates.map((dateStr, dateIdx) => {
            const dateNotes = notes.filter((n) => n.date === dateStr);
            return (
              <li key={dateStr}>
                <div className="relative pb-8">
                  {/* Timeline connecting line */}
                  {dateIdx !== sortedDates.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800"
                      aria-hidden="true"
                    />
                  )}
                  
                  <div className="relative flex space-x-3">
                    {/* Visual date node bullet */}
                    <div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-3xs">
                        <Calendar className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Date Heading Header */}
                      <div className="pt-1.5 mb-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {formatLongDate(dateStr)}
                        </p>
                      </div>

                      {/* Notes within this date */}
                      <div className="space-y-2.5">
                        {dateNotes.map((note) => {
                          const catMeta = CATEGORY_COLORS[note.category || "Outros"];
                          const isPendingCat = isCategorizing[note.id];

                          return (
                            <div
                              key={note.id}
                              style={{ contentVisibility: "auto" }}
                              className="group relative flex items-start gap-3 rounded-xl border border-slate-200/85 bg-white p-3.5 shadow-3xs hover:shadow-2xs transition duration-150 dark:border-slate-800/80 dark:bg-slate-900/90"
                            >
                              <div className="flex-1 min-w-0">
                                {/* Note text content */}
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-line pr-8">
                                  {note.text}
                                </p>

                                {/* Badges & Interactive Controls block */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {isPendingCat ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-2xs font-semibold bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800/50 text-slate-500 animate-pulse">
                                      <RefreshCcw className="h-3 w-3 animate-spin text-slate-400" />
                                      Classificando...
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      {/* Assigned category badge */}
                                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-semibold ${catMeta.bg}`}>
                                        <Tag className="h-2.5 w-2.5 opacity-70" />
                                        {note.category || "Processando..."}
                                      </span>

                                      {/* Quick manual re-classify trigger */}
                                      <button
                                        onClick={() => onCategorizeNoteImmediately(note.id)}
                                        title="Recalcular categoria por IA"
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                      >
                                        <RefreshCcw className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Absolute corner delete button */}
                              <button
                                onClick={() => onDeleteNote(note.id)}
                                className="absolute right-2 top-2 h-7 w-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Excluir anotação"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
