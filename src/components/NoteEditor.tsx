/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, HelpCircle, Save, Sparkles, BookOpen } from "lucide-react";
import { NOTE_EXAMPLES } from "../utils";

interface NoteEditorProps {
  onSaveNote: (text: string, date: string) => Promise<boolean>;
  selectedWeekStart: string;
}

export default function NoteEditor({ onSaveNote, selectedWeekStart }: NoteEditorProps) {
  const [noteText, setNoteText] = useState("");
  // Default date represents today in local YYYY-MM-DD
  const [noteDate, setNoteDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || isSaving) return;

    setIsSaving(true);
    const success = await onSaveNote(noteText.trim(), noteDate);
    setIsSaving(false);
    
    if (success) {
      setNoteText("");
    }
  };

  const handleExampleClick = (text: string) => {
    setNoteText(text);
    setShowExamples(false);
  };

  return (
    <div id="note-editor-card" className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      
      {/* Visual top border styling matching executive notepad */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-slate-700 to-emerald-600"></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold dark:bg-indigo-950/50 dark:text-indigo-400">
                1
              </span>
              Registrar Atividade
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Escreva em formato livre</p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition duration-150 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Ver exemplos rápidos</span>
          </button>
        </div>

        {/* Dynamic Interactive Examples Drawer */}
        {showExamples && (
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-100 p-4 transition duration-150 dark:bg-slate-950/50 dark:border-slate-800/60">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Clique em um modelo de anotação operacional abaixo para preencher o bloco:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NOTE_EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="text-left text-xs bg-white border border-slate-200 rounded-lg p-2 hover:border-indigo-400 hover:bg-indigo-50/20 text-slate-650 transition duration-150 truncate dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-800 dark:text-slate-400"
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* Elegant Input date picker */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-2">
              <label htmlFor="note-date" className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Data do Registro:
              </label>
              <input
                id="note-date"
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-705 shadow-3xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              />
            </div>

            {/* Smart Notepad Lined Visual Container */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-1">
              <textarea
                id="note-text-area"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Exemplo: Cobradas 15 certidões de regularidade fiscal vencidas da obra Curitiba..."
                rows={4}
                className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-200 pb-8"
              />
              
              <div className="absolute bottom-2.5 left-4 flex gap-1 items-center text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full border border-indigo-100/30 dark:border-indigo-950/50">
                <Sparkles className="h-3 w-3" />
                <span>Classificação Automática por IA habilitada</span>
              </div>
              
              <div className="absolute bottom-3 right-4 text-[10px] text-slate-400">
                Aperte Ctrl + Enter para salvar
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[280px] leading-tight">
              A IA analisará no backend e inserirá na categoria correta de Terceiros.
            </span>
            
            <button
              id="save-note-button"
              type="submit"
              disabled={isSaving || !noteText.trim()}
              className="inline-flex items-center gap-2 cursor-pointer bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-50 font-medium px-5 py-2 rounded-xl text-xs hover:shadow-md hover:from-slate-800 hover:to-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>
                  <span>Categorizando...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Salvar Anotação</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
