'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  MessagesSquare,
  GitCompare,
  Download,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Briefcase,
  Layers,
  ArrowLeft,
  ChevronRight,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { LegalDocument, Clause, Obligation, ExtractedDate, LawyerPrepPackage } from '@/types';
import { AttentionMap } from '@/components/analysis/AttentionMap';
import { ClauseCard } from '@/components/analysis/ClauseCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { GroundedChatWindow } from '@/components/chat/GroundedChatWindow';

export default function DocumentAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [dates, setDates] = useState<ExtractedDate[]>([]);
  const [lawyerPrep, setLawyerPrep] = useState<LawyerPrepPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ATTENTION' | 'CLAUSES' | 'VIEWER_CHAT' | 'TIMELINE' | 'OBLIGATIONS' | 'LAWYER_PREP'>('ATTENTION');
  const [activePage, setActivePage] = useState(1);
  const [highlightSection, setHighlightSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!docId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/documents/${docId}`)
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Document not found or access denied');
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setDocument(data.document);
        setClauses(data.clauses || []);
        setObligations(data.obligations || []);
        setDates(data.dates || []);
        setLawyerPrep(data.lawyerPrep || null);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [docId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading document analysis & citations...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Document Unavailable</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'The requested document could not be found or you do not have permission to access it.'}
        </p>
        <Link
          href="/app/documents"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Document Library</span>
        </Link>
      </div>
    );
  }

  // Citation click handler: switches to viewer/chat tab, sets page, and highlights the section
  const handleSelectCitation = (page: number, section: string) => {
    setActivePage(page);
    setHighlightSection(section);
    setActiveTab('VIEWER_CHAT');
  };

  const toggleObligation = (obId: string) => {
    setObligations(prev =>
      prev.map(ob => ob.id === obId ? { ...ob, isCompleted: !ob.isCompleted } : ob)
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Main Header (PRD §10) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{document.filename}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {document.pageCount} pages
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{document.summary}</p>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('VIEWER_CHAT')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <MessagesSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask Document</span>
          </button>
          <Link
            href="/app/compare"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <GitCompare className="w-3.5 h-3.5 text-blue-600" />
            <span>Compare</span>
          </Link>
          <Link
            href="/app/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Analysis Overview Cards (PRD §11) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Document Type
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{document.documentType}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Clauses Detected
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900">{clauses.length} categorized</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Important Dates
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900">{dates.length} key milestones</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Obligations
          </span>
          <p className="text-sm sm:text-base font-bold text-slate-900">{obligations.length} action items</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold" aria-label="Analysis Tabs">
          <button
            onClick={() => setActiveTab('ATTENTION')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'ATTENTION'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Attention Map ({clauses.filter(c => c.attentionLevel === 'HIGH' || c.attentionLevel === 'REVIEW').length} items)
          </button>
          <button
            onClick={() => setActiveTab('CLAUSES')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'CLAUSES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Plain-English Clauses ({clauses.length})
          </button>
          <button
            onClick={() => setActiveTab('VIEWER_CHAT')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'VIEWER_CHAT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Viewer & Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'TIMELINE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Legal Timeline ({dates.length})
          </button>
          <button
            onClick={() => setActiveTab('OBLIGATIONS')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'OBLIGATIONS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Obligations ({obligations.length})
          </button>
          <button
            onClick={() => setActiveTab('LAWYER_PREP')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'LAWYER_PREP'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lawyer Preparation Pack
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {/* 1. ATTENTION MAP (PRD §12) */}
        {activeTab === 'ATTENTION' && (
          <AttentionMap clauses={clauses} onSelectCitation={handleSelectCitation} />
        )}

        {/* 2. PLAIN ENGLISH CLAUSES (PRD §14) */}
        {activeTab === 'CLAUSES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Structured Clause Deconstructions</h3>
                <p className="text-xs text-slate-500">
                  Every clause is translated into plain English, identifying affected parties and obligations.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {clauses.map(clause => (
                <ClauseCard key={clause.id} clause={clause} onSelectCitation={handleSelectCitation} />
              ))}
            </div>
          </div>
        )}

        {/* 3. SPLIT DOCUMENT VIEWER & GROUNDED Q&A CHAT (PRD §15 & §16) */}
        {activeTab === 'VIEWER_CHAT' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <span>
                💡 <strong>Interactive Citation Grounding:</strong> Click any citation pill in the chat to navigate the viewer to that page and highlight the referenced passage.
              </span>
              {highlightSection && (
                <button
                  onClick={() => setHighlightSection(undefined)}
                  className="text-emerald-700 hover:underline font-bold text-xs"
                >
                  Clear Highlight
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <DocumentViewer
                  document={document}
                  activePage={activePage}
                  highlightSection={highlightSection}
                  onPageChange={setActivePage}
                />
              </div>
              <div className="lg:col-span-5">
                <GroundedChatWindow
                  documentId={document.id}
                  onSelectCitation={handleSelectCitation}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. LEGAL TIMELINE (PRD §19) */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Legal Timeline & Deadlines</h3>
              <p className="text-xs text-slate-500">
                Key operational dates, notice windows, and contract renewals chronologically arranged.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-emerald-500/40 space-y-8 my-4">
              {dates.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-xs" />
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">{item.dateStr}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {item.eventType}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                    <button
                      onClick={() => handleSelectCitation(item.sourcePage, item.sourceSection)}
                      className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1 pt-1"
                    >
                      <span>Source: {item.sourceSection} • Page {item.sourcePage}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. OBLIGATION TRACKER (PRD §20) */}
        {activeTab === 'OBLIGATIONS' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Obligation Tracker</h3>
              <p className="text-xs text-slate-500">
                Separate compliance obligations for you and the counterparty, converted into actionable checklists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Obligations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    My Obligations ({obligations.filter(o => o.party === 'USER').length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Track your duties</span>
                </div>

                <div className="space-y-2.5">
                  {obligations.filter(o => o.party === 'USER').map((ob) => (
                    <div
                      key={ob.id}
                      onClick={() => toggleObligation(ob.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        ob.isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-500 line-through'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!ob.isCompleted}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">{ob.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 not-italic">
                          <span>Deadline: <strong className="text-slate-700">{ob.deadline}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">{ob.sourceSection} (p.{ob.sourcePage})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counterparty Obligations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Other Party Obligations ({obligations.filter(o => o.party === 'COUNTERPARTY').length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Verify their compliance</span>
                </div>

                <div className="space-y-2.5">
                  {obligations.filter(o => o.party === 'COUNTERPARTY').map((ob) => (
                    <div
                      key={ob.id}
                      onClick={() => toggleObligation(ob.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        ob.isCompleted
                          ? 'bg-slate-50 border-slate-200 text-slate-500 line-through'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!ob.isCompleted}
                        onChange={() => {}}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">{ob.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 not-italic">
                          <span>Party: <strong className="text-slate-700">{ob.partyLabel}</strong></span>
                          <span>•</span>
                          <span className="text-blue-700 font-medium">{ob.sourceSection} (p.{ob.sourcePage})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. LAWYER PREPARATION MODE (PRD §21 & §22) */}
        {activeTab === 'LAWYER_PREP' && lawyerPrep && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Client-Attorney Preparation Pack
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Prepare for a Legal Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Save consultation time and legal fees by arriving with organized questions, highlighted clauses, and required evidence.
              </p>
            </div>

            {/* Document Overview & Risk Profile */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Consultation Overview</h4>
              <p className="text-xs text-slate-800 leading-relaxed">{lawyerPrep.overview.summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-500 font-medium">Parties:</span>
                  <p className="font-semibold text-slate-800">{lawyerPrep.overview.parties.join(' & ')}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Duration:</span>
                  <p className="font-semibold text-slate-800">{lawyerPrep.overview.duration}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Governing Law:</span>
                  <p className="font-semibold text-slate-800">{lawyerPrep.overview.governingLaw}</p>
                </div>
              </div>
            </div>

            {/* Questions to Ask Counsel */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>1. Strategic Questions to Ask Your Lawyer</span>
                <span className="text-xs text-slate-400 font-normal">({lawyerPrep.questionsToAskCounsel.length} generated)</span>
              </h4>
              <div className="space-y-2">
                {lawyerPrep.questionsToAskCounsel.map((q, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 text-xs text-slate-900 font-medium flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="pt-0.5">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Information & Documents to Bring */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">2. Documents and Records to Bring</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lawyerPrep.documentsToBring.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan: Distinguishing Document-Derived from General Suggestion (PRD §22) */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">3. Action Plan & Next Steps</h4>
              <div className="space-y-2">
                {lawyerPrep.actionPlan.map((act) => (
                  <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.type === 'DOCUMENT_DERIVED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {act.type === 'DOCUMENT_DERIVED' ? 'Document-Derived Action' : 'General Suggestion'}
                      </span>
                      <span className="text-slate-800 font-medium">{act.task}</span>
                    </div>
                    {act.completed && (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
