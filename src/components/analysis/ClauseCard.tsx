'use client';

import React from 'react';
import { Clause } from '@/types';
import { ExternalLink, User, Clock, FileCheck, Layers } from 'lucide-react';

interface ClauseCardProps {
  clause: Clause;
  onSelectCitation?: (page: number, section: string) => void;
}

function cleanTextForDisplay(text?: string): string {
  if (!text) return '';
  return text
    .replace(/%PDF-[\s\S]*?endstream/gi, '')
    .replace(/\b(?:obj|endobj|stream|endstream|FlateDecode|xref|trailer|\/Filter|\/Length)\b/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

export const ClauseCard: React.FC<ClauseCardProps> = ({ clause, onSelectCitation }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-5">
      {/* Category and Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            {clause.category}
          </span>
          <h4 className="font-bold text-slate-900 text-base">{cleanTextForDisplay(clause.title)}</h4>
        </div>

        {/* Source citation button with click-to-jump */}
        <button
          onClick={() => onSelectCitation?.(clause.pageNumber, clause.sectionNumber)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/70 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 self-start sm:self-auto"
          aria-label={`Jump to Section ${clause.sectionNumber} Page ${clause.pageNumber}`}
        >
          <span>Section {clause.sectionNumber} • Page {clause.pageNumber}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Structured 5-Part Breakdown (PRD §14) */}
      <div className="space-y-4 text-xs">
        {/* 1. ORIGINAL CLAUSE */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Original Clause
          </span>
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 text-slate-700 leading-relaxed font-mono">
            {cleanTextForDisplay(clause.originalText)}
          </div>
        </div>

        {/* 2. PLAIN ENGLISH */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1.5">
            Plain English
          </span>
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5 text-slate-900 font-medium leading-relaxed">
            {clause.plainEnglish}
          </div>
        </div>

        {/* 3. WHO IT AFFECTS, 4. YOUR OBLIGATION, 5. WHEN IT APPLIES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              Who It Affects
            </span>
            <p className="font-semibold text-slate-800">{clause.whoItAffects}</p>
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-slate-400" />
              Your Obligation
            </span>
            <p className="font-medium text-slate-800">{clause.yourObligation || 'None specified'}</p>
          </div>

          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              When It Applies
            </span>
            <p className="font-medium text-slate-800">{clause.whenItApplies || 'Throughout the agreement'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
