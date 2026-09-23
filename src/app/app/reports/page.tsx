'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Download, ArrowLeft, Scale, ShieldCheck, CheckCircle2, UploadCloud, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LegalDocument, Clause, Obligation, ExtractedDate, LawyerPrepPackage } from '@/types';

export default function ReportsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [dates, setDates] = useState<ExtractedDate[]>([]);
  const [prep, setPrep] = useState<LawyerPrepPackage | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDocuments(data);
          if (data.length > 0) {
            setSelectedDocId(data[0].id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load documents for reports:', err);
      })
      .finally(() => {
        setLoadingDocs(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDocId) {
      setDoc(null);
      setClauses([]);
      setObligations([]);
      setDates([]);
      setPrep(null);
      return;
    }

    setLoadingAnalysis(true);
    fetch(`/api/documents/${selectedDocId}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data.document || null);
        setClauses(data.clauses || []);
        setObligations(data.obligations || []);
        setDates(data.dates || []);
        setPrep(data.lawyerPrep || null);
      })
      .catch(err => {
        console.error('Failed to load document analysis:', err);
      })
      .finally(() => {
        setLoadingAnalysis(false);
      });
  }, [selectedDocId]);

  const handlePrint = () => {
    window.print();
  };

  if (loadingDocs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Preparing legal clarity report generator...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="print:hidden border-b border-slate-200 pb-5">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Clarity Report</h1>
          <p className="text-xs text-slate-500">
            Exportable executive summary and preparation brief ready for attorney consultation.
          </p>
        </div>

        <div className="max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Scale className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">No documents in library</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a contract or agreement (PDF, DOCX, or TXT) to generate a comprehensive, printable Legal Clarity Report with grounded citations and attorney consultation questions.
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden on print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Legal Clarity Report</h1>
          <p className="text-xs text-slate-500">
            Exportable executive summary and preparation brief ready for attorney consultation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Select Document:</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            disabled={!doc || loadingAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {loadingAnalysis || !doc ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Generating formatted clarity brief...</p>
        </div>
      ) : (
        <article className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">LexiGuide</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Legal Clarity Report</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Subject Document: {doc.filename} ({doc.documentType})
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p>Generated: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span></p>
            <p>Audited Pages: <span className="font-semibold text-slate-800">{doc.pageCount}</span></p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified Grounding
            </span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Document Summary</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif bg-slate-50 p-4 rounded-xl border border-slate-100">
            {doc.summary}
          </p>
        </section>

        {/* 2. Attention Items */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">2. Attention Items & Notable Terms</h3>
          <div className="space-y-3">
            {clauses.filter(c => c.attentionLevel === 'HIGH' || c.attentionLevel === 'REVIEW').map(item => (
              <div key={item.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                  <span className="text-[10px] font-bold text-emerald-700">Section {item.sectionNumber} (p.{item.pageNumber})</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{item.plainEnglish}</p>
                <p className="text-[11px] text-slate-500 italic font-mono">"{item.originalText}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Important Dates Roadmap */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Important Dates & Notice Windows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {dates.map(d => (
              <div key={d.id} className="border border-slate-200 rounded-xl p-3 bg-white">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{d.dateStr}</span>
                  <span className="text-slate-400 text-[10px]">{d.eventType}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Strategic Questions for Counsel */}
        {prep?.questionsToAskCounsel && prep.questionsToAskCounsel.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Recommended Questions for Legal Counsel</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prep.questionsToAskCounsel.map((q, idx) => (
                <li key={idx} className="leading-relaxed font-medium">{q}</li>
              ))}
            </ol>
          </section>
        )}

        {/* 5. Legal Disclaimer (PRD §23 & §66) */}
        <aside className="border-t border-slate-200 pt-6 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 uppercase tracking-wider">AI & Legal Information Disclaimer:</p>
          <p className="leading-relaxed">
            LexiGuide provides general information and document-understanding assistance. It does not provide legal advice, establish an attorney-client relationship, or determine whether a legal provision is enforceable. Laws and legal outcomes depend on jurisdiction and individual circumstances. Consider consulting a qualified legal professional for advice about your situation.
          </p>
        </aside>
      </article>
      )}
    </div>
  );
}
