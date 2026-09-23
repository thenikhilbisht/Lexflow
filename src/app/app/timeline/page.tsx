'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, AlertCircle, ChevronRight, FileText, Filter, UploadCloud } from 'lucide-react';
import { ExtractedDate } from '@/types';

export default function TimelinePage() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [dates, setDates] = useState<(ExtractedDate & { docName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDates(data);
        }
      })
      .catch(err => {
        console.error('Failed to load timeline:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredDates = filterType === 'ALL'
    ? dates
    : dates.filter(d => d.eventType === filterType);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Extracting timeline milestones & notice windows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Contract Event Roadmap
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Timeline & Deadlines</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss an automatic renewal window or termination notice deadline across your contracts.
          </p>
        </div>

        {/* Filters */}
        {dates.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Filter events">
            {['ALL', 'NOTICE', 'PAYMENT', 'START', 'END', 'RENEWAL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filterType === type
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {dates.length === 0 ? (
        <div className="max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">No dates or deadlines recorded</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload contracts (employment agreements, leases, or SaaS MSAs) to automatically detect effective dates, payment milestones, and notice windows.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Dashboard & Upload Document</span>
            </Link>
          </div>
        </div>
      ) : filteredDates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-2">
          <p className="text-sm font-semibold text-slate-700">No events found matching "{filterType}"</p>
          <button
            onClick={() => setFilterType('ALL')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Show all event categories ({dates.length})
          </button>
        </div>
      ) : (
        /* Chronological Roadmap View (PRD §19) */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="relative pl-8 border-l-2 border-emerald-500/50 space-y-8 my-4">
          {filteredDates.map((item) => {
            const isNotice = item.eventType === 'NOTICE';
            return (
              <div key={item.id} className="relative group">
                <div
                  className={`absolute -left-[39px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-xs ${
                    isNotice ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-emerald-500'
                  }`}
                />
                <div
                  className={`border rounded-2xl p-5 space-y-2 transition-all ${
                    isNotice
                      ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/80'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{item.dateStr}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isNotice
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.eventType}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {item.docName}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800">{item.description}</p>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                    <span>Source: {item.sourceSection} • Page {item.sourcePage}</span>
                    <Link
                      href={`/app/documents/${item.documentId}`}
                      className="text-emerald-700 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>Open in Document</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
