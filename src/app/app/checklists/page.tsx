'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Square, User, ShieldCheck, ChevronRight, FileText, ArrowRight, UploadCloud } from 'lucide-react';
import { Obligation } from '@/types';

export default function ChecklistsPage() {
  const [obligations, setObligations] = useState<(Obligation & { docName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/checklists')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setObligations(data);
        }
      })
      .catch(err => {
        console.error('Failed to load obligations:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleComplete = async (id: string) => {
    setObligations(prev =>
      prev.map(ob => ob.id === id ? { ...ob, isCompleted: !ob.isCompleted } : ob)
    );

    try {
      await fetch('/api/checklists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error('Failed to toggle obligation:', e);
    }
  };

  const myCount = obligations.filter(o => o.party === 'USER');
  const otherCount = obligations.filter(o => o.party === 'COUNTERPARTY');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Extracting obligations & compliance checklists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Obligation Tracker
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Checklists & Action Obligations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Convert extracted covenants and clauses into actionable compliance tasks.
        </p>
      </div>

      {obligations.length === 0 ? (
        <div className="max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">No obligations extracted yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a legal document (such as an employment contract, NDA, or commercial agreement) to automatically identify duties, milestones, and covenant checklists.
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
      ) : (
        /* 2-Column Split: My Obligations vs Other Party (PRD §20) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Obligations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Your Obligations
                </h2>
                <p className="text-xs text-slate-500">Covenants & duties required of your party</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {myCount.filter(o => o.isCompleted).length} / {myCount.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {myCount.map((ob) => (
                <div
                  key={ob.id}
                  onClick={() => toggleComplete(ob.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    ob.isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-xs'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!ob.isCompleted}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold leading-relaxed">{ob.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 not-italic">
                      {ob.docName && <span className="font-medium text-slate-700">{ob.docName}</span>}
                      {ob.docName && <span>•</span>}
                      <span>Deadline: <strong className="text-slate-700">{ob.deadline || 'As stated'}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">{ob.sourceSection} (p.{ob.sourcePage})</span>
                    </div>
                  </div>
                </div>
              ))}
              {myCount.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No specific obligations assigned to your party.</p>
              )}
            </div>
          </div>

          {/* Counterparty Obligations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Counterparty Obligations
                </h2>
                <p className="text-xs text-slate-500">Deliverables & commitments by the other party</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {otherCount.filter(o => o.isCompleted).length} / {otherCount.length} Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {otherCount.map((ob) => (
                <div
                  key={ob.id}
                  onClick={() => toggleComplete(ob.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    ob.isCompleted
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800 shadow-xs'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!ob.isCompleted}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold leading-relaxed">{ob.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 not-italic">
                      {ob.docName && <span className="font-medium text-slate-700">{ob.docName}</span>}
                      {ob.docName && <span>•</span>}
                      <span>Deadline: <strong className="text-slate-700">{ob.deadline || 'As stated'}</strong></span>
                      <span>•</span>
                      <span className="text-blue-700 font-medium">{ob.sourceSection} (p.{ob.sourcePage})</span>
                    </div>
                  </div>
                </div>
              ))}
              {otherCount.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No specific counterparty obligations extracted.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
