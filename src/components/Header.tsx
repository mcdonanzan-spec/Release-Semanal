/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { formatShortDate } from "../utils";

interface HeaderProps {
  startDate: string;
  endDate: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  notesCount: number;
}

export default function Header({
  startDate,
  endDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  notesCount,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-slate-50 shadow-sm dark:from-slate-100 dark:to-indigo-50 dark:text-slate-950">
              <Sparkles className="h-5.5 w-5.5 text-indigo-400 dark:text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Release Semanal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestão de Terceiros — Relatórios Inteligentes para sua Diretoria
              </p>
            </div>
          </div>

          {/* Week Selector Controller */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={onPrevWeek}
                title="Semana Anterior"
                className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-2xs dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[170px] justify-center">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatShortDate(startDate)}</span>
                <span className="text-slate-350">até</span>
                <span>{formatShortDate(endDate)}</span>
              </div>

              <button
                onClick={onNextWeek}
                title="Próxima Semana"
                className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-2xs dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={onCurrentWeek}
              className="rounded-lg border border-slate-250 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-3xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Semana Atual
            </button>

            {/* Note badge indicator */}
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100/30">
              <Clock className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>
                {notesCount} {notesCount === 1 ? "anotação" : "anotações"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
