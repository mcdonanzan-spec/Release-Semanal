/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { WeekNote, GeneratedRelease, NoteCategory } from "./types";
import { getWeekRange, formatDateISO } from "./utils";
import Header from "./components/Header";
import NoteEditor from "./components/NoteEditor";
import NoteList from "./components/NoteList";
import ReleaseViewer from "./components/ReleaseViewer";
import { Sparkles, Calendar, BookOpen, Clock, Trash2, ChevronRight, FolderHeart, Info } from "lucide-react";

export default function App() {
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekRange());
  const [notes, setNotes] = useState<WeekNote[]>([]);
  const [historyReleases, setHistoryReleases] = useState<GeneratedRelease[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem("release_semanal_notes");
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
      
      const storedReleases = localStorage.getItem("release_semanal_history");
      if (storedReleases) {
        setHistoryReleases(JSON.parse(storedReleases));
      }
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
    }
  }, []);

  // Save changes helper
  const saveNotesToStorage = (updated: WeekNote[]) => {
    setNotes(updated);
    localStorage.setItem("release_semanal_notes", JSON.stringify(updated));
  };

  const saveReleasesToStorage = (updated: GeneratedRelease[]) => {
    setHistoryReleases(updated);
    localStorage.setItem("release_semanal_history", JSON.stringify(updated));
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Change selected week functions
  const handlePrevWeek = () => {
    const prevRef = new Date(selectedWeek.start + "T12:00:00");
    prevRef.setDate(prevRef.getDate() - 7);
    setSelectedWeek(getWeekRange(formatDateISO(prevRef)));
  };

  const handleNextWeek = () => {
    const nextRef = new Date(selectedWeek.start + "T12:00:00");
    nextRef.setDate(nextRef.getDate() + 7);
    setSelectedWeek(getWeekRange(formatDateISO(nextRef)));
  };

  const handleCurrentWeek = () => {
    setSelectedWeek(getWeekRange());
  };

  // Filter notes that fall within current week range (inclusive)
  const currentWeekNotes = notes.filter(
    (n) => n.date >= selectedWeek.start && n.date <= selectedWeek.end
  );

  // Get current active release for this specific selected week
  const currentWeekRelease = historyReleases.find(
    (r) => r.startDate === selectedWeek.start && r.endDate === selectedWeek.end
  ) || null;

  // Add individual note
  const handleSaveNote = async (text: string, date: string): Promise<boolean> => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    
    // Create pre-saved note placeholder with Outros category
    const tentativeNote: WeekNote = {
      id: newId,
      text,
      date,
      category: "Outros",
    };

    const nextNotes = [tentativeNote, ...notes];
    saveNotesToStorage(nextNotes);

    // Call backend API to categorize the note text automatically
    setIsCategorizing((prev) => ({ ...prev, [newId]: true }));
    try {
      const response = await fetch("/api/categorize-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const categoryResult = data.category as NoteCategory;
        
        // Update correct category in-place
        const updatedNotes = nextNotes.map((n) =>
          n.id === newId ? { ...n, category: categoryResult } : n
        );
        saveNotesToStorage(updatedNotes);
        showToast(`Anotação classificada automaticamente como: ${categoryResult}`);
      }
    } catch (e: any) {
      console.error("Erro de categorização da nota:", e);
    } finally {
      setIsCategorizing((prev) => ({ ...prev, [newId]: false }));
    }

    return true;
  };

  // Re-classify any note manually
  const handleCategorizeNoteImmediately = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    setIsCategorizing((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch("/api/categorize-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note.text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const updated = notes.map((n) =>
          n.id === id ? { ...n, category: data.category as NoteCategory } : n
        );
        saveNotesToStorage(updated);
        showToast(`Recalculado! Categoria atualizada: ${data.category}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCategorizing((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updated);
    showToast("Anotação excluída com sucesso.");
  };

  // Generate release using all week notes
  const handleGenerateRelease = async () => {
    if (currentWeekNotes.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: currentWeekNotes,
          startDate: selectedWeek.start,
          endDate: selectedWeek.end,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.details || errorJson.error || "Erro de processamento da IA");
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const aiOutput = resData.data;

        // Save generated release to history (replace if already exists for this week)
        const newRelease: GeneratedRelease = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          startDate: selectedWeek.start,
          endDate: selectedWeek.end,
          createdAt: new Date().toISOString(),
          notesUsed: currentWeekNotes,
          reportComplete: aiOutput.reportComplete,
          reportEmail: aiOutput.reportEmail,
          reportTeams: aiOutput.reportTeams,
          reportWhatsApp: aiOutput.reportWhatsApp,
          isFallback: !!resData.isFallback,
        };

        const filteredHistory = historyReleases.filter(
          (r) => !(r.startDate === selectedWeek.start && r.endDate === selectedWeek.end)
        );
        saveReleasesToStorage([newRelease, ...filteredHistory]);
        
        if (resData.isFallback) {
          showToast("Release processado com sucesso via Motor Local (Limite de IA atingido)!");
        } else {
          showToast("Seu Release Semanal foi gerado com sucesso!");
        }
      }
    } catch (e: any) {
      console.error(e);
      showToast(`Ops! Falha ao gerar: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete historical release
  const handleDeleteHistoryRelease = (id: string) => {
    const updated = historyReleases.filter((r) => r.id !== id);
    saveReleasesToStorage(updated);
    showToast("Relatório histórico removido.");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col dark:bg-slate-950 dark:text-slate-100">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm rounded-xl border border-slate-205 bg-slate-900 text-slate-50 p-4 shadow-lg flex items-center gap-2 dark:bg-slate-50 dark:text-slate-950">
          <Sparkles className="h-4.5 w-4.5 text-indigo-400 dark:text-indigo-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Styled Brand Header / Week Controller */}
      <Header
        startDate={selectedWeek.start}
        endDate={selectedWeek.end}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        notesCount={currentWeekNotes.length}
      />

      {/* Top Banner Alert informing the simplicity model */}
      <div className="bg-indigo-900 text-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between text-2xs md:text-xs">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-300" />
            <span className="font-medium">
              💡 <strong>MVP focado em resultados:</strong> O sistema serve apenas de ponte gerencial de anotações semanais de Terceiros e IA. Sem complexidades.
            </span>
          </div>
          <div className="hidden sm:block text-slate-300">
            Foco: Departamento de Terceiros
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* Main Bento Grid layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT PANEL COLUMN (Input and listing) - Takes 5 spaces */}
          <div className="lg:col-span-5 space-y-8">
            <NoteEditor
              onSaveNote={handleSaveNote}
              selectedWeekStart={selectedWeek.start}
            />
            
            <NoteList
              notes={currentWeekNotes}
              onDeleteNote={handleDeleteNote}
              onCategorizeNoteImmediately={handleCategorizeNoteImmediately}
              isCategorizing={isCategorizing}
            />
          </div>

          {/* RIGHT PANEL COLUMN (AI Generated Views and Release Tabs) - Takes 7 spaces */}
          <div className="lg:col-span-7 space-y-8">
            <ReleaseViewer
              onGenerateRelease={handleGenerateRelease}
              isGenerating={isGenerating}
              currentRelease={currentWeekRelease}
              notesCount={currentWeekNotes.length}
              totalNotesCount={notes.length}
            />

            {/* Past historical consultations saved */}
            <div id="historical-releases-registry" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-150 pb-3 mb-4 dark:border-slate-800">
                <FolderHeart className="h-4.5 w-4.5 text-slate-450" />
                <h3 className="font-display font-bold text-sm text-slate-9O0 dark:text-white">
                  Histórico de Consultas Salvas
                </h3>
                <span className="text-2xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold dark:bg-slate-800 dark:text-slate-400">
                  {historyReleases.length} {historyReleases.length === 1 ? "release" : "releases"}
                </span>
              </div>

              {historyReleases.length === 0 ? (
                <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-4">
                  Nenhum relatório definitivo gerado no histórico do browser ainda.
                </p>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {historyReleases.map((release) => {
                    const isActive = release.startDate === selectedWeek.start && release.endDate === selectedWeek.end;
                    return (
                      <div
                        key={release.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition duration-150 ${
                          isActive
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-900"
                            : "bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50 dark:bg-slate-950/20 dark:border-slate-850 dark:text-slate-300"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedWeek({
                              start: release.startDate,
                              end: release.endDate,
                            });
                          }}
                          className="flex items-center gap-2 cursor-pointer text-left font-semibold flex-1"
                        >
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Release da Semana:</span>
                          <span className="font-mono text-slate-550 dark:text-slate-400">
                            {release.startDate} a {release.endDate}
                          </span>
                          {isActive && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                              Ativo
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedWeek({
                                start: release.startDate,
                                end: release.endDate,
                              });
                            }}
                            className="text-2xs text-indigo-600 font-bold hover:underline dark:text-indigo-400 px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-3xs dark:bg-slate-900 dark:border-slate-800"
                          >
                            Visualizar
                          </button>
                          
                          <button
                            onClick={() => handleDeleteHistoryRelease(release.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/30"
                            title="Remover do histórico"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Modern Humble Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-900 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-medium">
            Release Semanal • Departamento de Terceiros e Compliance Corporativo
          </p>
          <p className="text-[11px] opacity-80">
            Acelerando a comunicação gerencial transformando ações de campo em relatórios corporativos executivos.
          </p>
        </div>
      </footer>

    </div>
  );
}
