'use client';

import React, { useState } from 'react';
import { Clause, AttentionLevel } from '@/types';
import { AlertCircle, AlertTriangle, HelpCircle, Info, ExternalLink, Filter } from 'lucide-react';

interface AttentionMapProps {
  clauses: Clause[];
  onSelectCitation?: (page: number, section: string) => void;
}

export const AttentionMap: React.FC<AttentionMapProps> = ({ clauses, onSelectCitation }) => {
  const [filterLevel, setFilterLevel] = useState<AttentionLevel | 'ALL'>('ALL');

  const attentionBadge = (level: AttentionLevel) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            🔴 High attention
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            🟠 Review
          </span>
        );
      case 'UNDERSTAND':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            🟡 Understand
          </span>
        );
      case 'INFORMATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            🟢 Informational
          </span>
        );
    }
  };

  const filteredClauses = filterLevel === 'ALL'
    ? clauses
    : clauses.filter(c => c.attentionLevel === filterLevel);

  const counts = {
    HIGH: clauses.filter(c => c.attentionLevel === 'HIGH').length,
    REVIEW: clauses.filter(c => c.attentionLevel === 'REVIEW').length,
    UNDERSTAND: clauses.filter(c => c.attentionLevel === 'UNDERSTAND').length,
    INFORMATIONAL: clauses.filter(c => c.attentionLevel === 'INFORMATIONAL').length
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Attention Map</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {clauses.length} items evaluated
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key provisions categorized by required review depth. Not a determination of illegality.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filter attention levels">
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterLevel === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({clauses.length})
          </button>
          <button
            onClick={() => setFilterLevel('HIGH')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterLevel === 'HIGH' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🔴 High ({counts.HIGH})
          </button>
          <button
            onClick={() => setFilterLevel('REVIEW')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterLevel === 'REVIEW' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🟠 Review ({counts.REVIEW})
          </button>
          <button
            onClick={() => setFilterLevel('UNDERSTAND')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterLevel === 'UNDERSTAND' ? 'bg-yellow-600 text-white font-bold' : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
            }`}
          >
            🟡 Understand ({counts.UNDERSTAND})
          </button>
        </div>
      </div>

      {/* Attention Item Cards */}
      <div className="space-y-4">
        {filteredClauses.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {attentionBadge(item.attentionLevel)}
                <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
              </div>
              <button
                onClick={() => onSelectCitation?.(item.pageNumber, item.sectionNumber)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/70 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 self-start sm:self-auto"
                aria-label={`View source Section ${item.sectionNumber} on Page ${item.pageNumber}`}
              >
                <span>Section {item.sectionNumber} • Page {item.pageNumber}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Original clause excerpt */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-mono italic">
              "{item.originalText}"
            </div>

            {/* Why This Matters & Verify Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">Why this matters:</span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {item.whyThisMatters || item.plainEnglish}
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">Verify / Action:</span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {item.verifyInstructions || item.yourObligation || 'Confirm whether this provision aligns with your specific terms.'}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
