'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitCompare, ArrowRight, Layers, FileText, CheckCircle2, ChevronRight, HelpCircle, UploadCloud, AlertCircle } from 'lucide-react';
import { ContractComparisonResult, LegalDocument } from '@/types';

export default function DocumentComparisonPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docAId, setDocAId] = useState('');
  const [docBId, setDocBId] = useState('');
  const [comparison, setComparison] = useState<ContractComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
          if (data.length >= 2) {
            setDocAId(data[0].id);
            setDocBId(data[1].id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load documents:', err);
      })
      .finally(() => {
        setLoadingDocs(false);
      });
  }, []);

  const handleCompare = async () => {
    if (!docAId || !docBId) return;
    if (docAId === docBId) {
      setCompareError('Please select two different documents to compare.');
      return;
    }

    setCompareError(null);
    setIsComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docAId, docBId })
      });
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      } else {
        const err = await res.json();
        setCompareError(err.error || 'Failed to compare documents');
      }
    } catch (e: any) {
      setCompareError(e.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  const renderStatusBadge = (status: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED') => {
    switch (status) {
      case 'ADDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Added in Version B
          </span>
        );
      case 'REMOVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            Removed in Version B
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Changed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600">
            Unchanged
          </span>
        );
    }
  };

  if (loadingDocs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading document library for comparison...</p>
      </div>
    );
  }

  if (documents.length < 2) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Dual Contract Differencer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Document Comparison</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select two agreements or versions to evaluate added obligations, changed deadlines, and removed protections.
          </p>
        </div>

        <div className="max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <GitCompare className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">At least two documents required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comparison requires at least two agreements in your library. Upload two versions of a contract (such as an original agreement and a counterparty revision) to evaluate clauses side-by-side.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Dashboard & Upload Documents</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Dual Contract Differencer
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Document Comparison</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select two agreements or versions to evaluate added obligations, changed deadlines, and removed protections.
        </p>
      </div>

      {/* Document Selection Pickers */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document A */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Document A (Baseline / Prior Version)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.filename} ({d.documentType})</option>
              ))}
            </select>
          </div>

          {/* Document B */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Document B (Revised / Counterparty Proposal)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.filename} ({d.documentType})</option>
              ))}
            </select>
          </div>
        </div>

        {compareError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{compareError}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleCompare}
            disabled={isComparing || docAId === docBId}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isComparing ? 'Comparing Clauses...' : 'Run Comparative Analysis'}</span>
          </button>
        </div>
      </div>

      {comparison && (
        <>
          {/* Comparison Summary Metric Cards (PRD §18) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Changes
              </span>
              <p className="text-2xl font-extrabold text-slate-900">{comparison.summary.totalChanges}</p>
              <span className="text-[11px] text-slate-500">Provisions modified</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Added Clauses
              </span>
              <p className="text-2xl font-extrabold text-emerald-600">{comparison.summary.addedCount}</p>
              <span className="text-[11px] text-slate-500">Introduced in Version B</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Modified Clauses
              </span>
              <p className="text-2xl font-extrabold text-blue-600">{comparison.summary.modifiedCount}</p>
              <span className="text-[11px] text-slate-500">Wording updated</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Removed Clauses
              </span>
              <p className="text-2xl font-extrabold text-slate-700">{comparison.summary.removedCount}</p>
              <span className="text-[11px] text-slate-500">Omitted in Version B</span>
            </div>
          </div>

          {/* Clause-by-Clause Side-by-Side Visual Comparison (PRD §18) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Side-by-Side Clause Differences</h3>
                <p className="text-xs text-slate-500">
                  Compare how language and operational scope evolved between {comparison.documentAName} and {comparison.documentBName}.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {comparison.clauseDiffs.map((diff) => (
                <div key={diff.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-900">{diff.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {diff.category}
                      </span>
                    </div>
                    <div>{renderStatusBadge(diff.status)}</div>
                  </div>

                  {/* Dual Column Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Version A */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Version A ({comparison.documentAName})</span>
                        {diff.versionAPage && <span>Page {diff.versionAPage}</span>}
                      </div>
                      <p className="text-slate-800 leading-relaxed font-serif">
                        {diff.versionAContent || <span className="text-slate-400 italic">Not present in Version A</span>}
                      </p>
                    </div>

                    {/* Version B */}
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Version B ({comparison.documentBName})</span>
                        {diff.versionBPage && <span>Page {diff.versionBPage}</span>}
                      </div>
                      <p className="text-slate-800 leading-relaxed font-serif">
                        {diff.versionBContent || <span className="text-slate-400 italic">Omitted in Version B</span>}
                      </p>
                    </div>
                  </div>

                  {/* Change Explanation */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-blue-700 mt-0.5 flex-shrink-0">
                      Impact:
                    </span>
                    <p className="leading-relaxed">{diff.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
