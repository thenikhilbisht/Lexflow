'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  GitCompare,
  MessagesSquare,
  Upload,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  FolderOpen,
  MoreHorizontal,
  Send,
  Smile,
  ArrowRightLeft,
  Sparkles,
  Bot,
  ExternalLink,
  Clock,
  FileCheck,
  MessageCircle,
  Smartphone
} from 'lucide-react';
import { LegalDocument, Clause } from '@/types';
import { FileUploadModal } from '@/components/documents/FileUploadModal';

export default function UserDashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Chat state for the dashboard AI Assistant widget
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string; citations?: string[] }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am LexAI, your legal document intelligence assistant. How can I help you analyze clauses, identify risks, or verify terms in your agreements?'
    },
    {
      sender: 'user',
      text: 'Can you help me understand the key risks in my uploaded agreements or contracts?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchDocs = () => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDocuments(data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSuccess = (newDoc: LegalDocument) => {
    setDocuments(prev => [newDoc, ...prev]);
    router.push(`/app/documents/${newDoc.id}`);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Handle dashboard AI assistant message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const targetDoc = documents[0];
      if (targetDoc) {
        const res = await fetch(`/api/documents/${targetDoc.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: userText })
        });
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer || 'I could not process the query.',
            citations: data.citations?.map((c: any) => `${c.sectionTitle} (Page ${c.pageNumber})`)
          }
        ]);
      } else {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: 'Please upload a legal document (PDF, DOCX, or TXT) in the Document Upload panel below to get citation-grounded answers verified directly against your contract text.'
            }
          ]);
          setIsSending(false);
        }, 500);
        return;
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'An error occurred while analyzing the document.' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Real or derived attention items from user documents
  const allClauses: { clause: Clause; docName: string; docId: string }[] = [];
  documents.forEach(d => {
    if (d.clauses) {
      d.clauses.forEach(c => allClauses.push({ clause: c, docName: d.filename, docId: d.id }));
    }
  });

  const highRiskClauses = allClauses.filter(c => c.clause.attentionLevel === 'HIGH');
  const reviewClauses = allClauses.filter(c => c.clause.attentionLevel === 'REVIEW');

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-[#172033]">
      {/* Top Title & Palette Reference Swatches (Matching Image 1 & Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            AI Legal Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Summary of AI legal intelligence, grounded chat, and side-by-side comparison.
          </p>
        </div>

        {/* Color Palette Swatches (Matching Image 1) */}
        <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200/70 shadow-xs self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#FBFAFC] border border-slate-300" title="#FBFAFC Canvas"></span>
            <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-slate-300" title="#FFFFFF Card"></span>
            <span className="w-4 h-4 rounded-full bg-[#172033]" title="#172033 Text"></span>
            <span className="w-4 h-4 rounded-full bg-[#4F46E5]" title="#4F46E5 Indigo Primary"></span>
            <span className="w-4 h-4 rounded-full bg-[#22C55E]" title="#22C55E Emerald Accent"></span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 pl-1 border-l border-slate-200">
            Design Tokens
          </span>
        </div>
      </div>

      {/* =========================================================
          MOBILE VIEW: Dedicated flow matching Image 2 (< lg viewports)
         ========================================================= */}
      <div className="lg:hidden space-y-5">
        {/* Mobile Card 1: AI Assistant Hero Card (Matching Image 2) */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-purple-50/50 border border-indigo-100 rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2 max-w-[62%] z-10">
            <h2 className="font-extrabold text-base text-[#172033]">AI Assistant</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mobile chat is direct in your messages and contracts.
            </p>
            <Link
              href="/app/ask"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mobile chat</span>
            </Link>
          </div>

          {/* Right Mobile Phone Graphic (Image 2) */}
          <div className="w-24 h-36 bg-white border-2 border-slate-800 rounded-2xl p-1.5 shadow-md -mr-2 rotate-2 flex flex-col justify-between">
            <div className="w-8 h-1 bg-slate-800 rounded-full mx-auto mb-1"></div>
            <div className="space-y-1 text-[8px]">
              <div className="bg-slate-100 p-1 rounded-md text-slate-600">LexAI: Hello!</div>
              <div className="bg-[#4F46E5] text-white p-1 rounded-md ml-auto max-w-[85%]">Can you review NDA?</div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full w-full mt-auto"></div>
          </div>
        </div>

        {/* Mobile Card 2: Risk & Attention Horizontal Carousel (Matching Image 2) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-sm text-[#172033]">Risk & Attention</h2>
            <Link href="/app/documents" className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Touch-friendly horizontal scroll */}
          <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {/* Red High Risk Card (Image 2) */}
            <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-4 min-w-[210px] max-w-[240px] flex-shrink-0 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  High Risk
                </span>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">
                {highRiskClauses[0]?.docName || 'High-in touch-friendly risk & coverage.'}
              </p>
              <Link
                href={highRiskClauses[0] ? `/app/documents/${highRiskClauses[0].docId}` : '/app/documents'}
                className="w-full py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs text-center transition-colors block"
              >
                Action now
              </Link>
            </div>

            {/* Amber Attention Card (Image 2) */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 min-w-[210px] max-w-[240px] flex-shrink-0 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Attention
                </span>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">
                Touch card to view in-flight risk & attention list.
              </p>
              <Link
                href="/app/checklists"
                className="w-full py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs text-center transition-colors block"
              >
                Action now
              </Link>
            </div>

            {/* Blue Info Card (Image 2) */}
            <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 min-w-[210px] max-w-[240px] flex-shrink-0 flex flex-col justify-between space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  More
                </span>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-800 font-medium line-clamp-2">
                Touch back to inspect attention checklist.
              </p>
              <Link
                href="/app/timeline"
                className="w-full py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs text-center transition-colors block"
              >
                Action now
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Card 3: Document Status Timeline (Matching Image 2) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-[#172033]">Document Status Timeline</h2>

          <div className="space-y-4">
            {/* Milestone 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                  <span className="text-slate-800">Milestone 1</span>
                </div>
                <span className="text-[11px] font-bold text-[#4F46E5]">100% Progress</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#4F46E5] w-full rounded-full"></div>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span className="text-slate-800">Milestone 2</span>
                </div>
                <span className="text-[11px] font-bold text-teal-600">50% Progress</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-500 w-[50%] rounded-full"></div>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                  <span className="text-slate-800">Milestone 3</span>
                </div>
                <span className="text-[11px] font-bold text-[#22C55E]">60% Progress</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#22C55E] w-[60%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card 4: Contract Comparison Stacked Preview (Matching Image 2) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#172033]">Contract Comparison</h2>
            <Link href="/app/compare" className="text-xs font-semibold text-indigo-600">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-xs">
              <span className="font-bold text-[11px] text-slate-800 block">Clause 1</span>
              <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                Termination with 30 days notice required in written format.
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 space-y-1 shadow-xs">
              <span className="font-bold text-[11px] text-emerald-700 block">Clause 2</span>
              <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                Extended 60 days notice window with reciprocal fee waiver.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Document Upload Trigger */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900">Upload Agreement</h3>
            <p className="text-[10px] text-slate-400">PDF • DOCX • TXT</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-[#22C55E] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Upload now
          </button>
        </div>
      </div>

      {/* =========================================================
          DESKTOP VIEW: Full 2-column layout matching Image 1 (>= lg)
         ========================================================= */}
      <div className="hidden lg:block space-y-8">
        {/* Main Grid: Row 1 (AI Assistant & Contract Comparison) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Widget 1: AI Assistant */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm flex flex-col justify-between h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#172033]">AI Assistant</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  LexAI Grounded
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 items-end ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] text-xs leading-relaxed p-3.5 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#4F46E5] text-white rounded-br-xs shadow-xs'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                        {m.citations.map((c, i) => (
                          <span key={i} className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                            📍 {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex gap-2 items-center text-xs text-slate-400 italic">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                  <span>LexAI is analyzing document clauses...</span>
                </div>
              )}
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="w-9 h-9 rounded-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shadow-xs transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Widget 2: Contract Comparison */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm flex flex-col justify-between h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#172033]">Contract Comparison</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Side-by-Side Diff
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/app/compare"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Open Full View
                </Link>
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between gap-3 py-3 relative">
              <div className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 h-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {documents[0]?.filename || 'Contract Comparison 1'}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">v1</span>
                </div>
                <div className="space-y-1.5 opacity-60 text-[10px] text-slate-400">
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                </div>

                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-semibold text-rose-800">
                  <p className="truncate">Highlighted Clauses - Clause 5.1</p>
                  <span className="text-[10px] font-normal text-rose-600">30-day notice window requirement</span>
                </div>
                <div className="p-2 bg-rose-50/60 border border-rose-200/70 rounded-xl text-[10px] text-rose-700 truncate">
                  Highlighted Clauses - Indemnification Cap
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-1 z-10">
                <Link
                  href="/app/compare"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                  title="Switch or compare versions"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 h-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {documents[1]?.filename || 'Contract Comparison 2'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">v2</span>
                </div>
                <div className="space-y-1.5 opacity-60 text-[10px] text-slate-400">
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800">
                  <p className="truncate">Highlighted Clauses - Clause 5.2</p>
                  <span className="text-[10px] font-normal text-emerald-600">60-day revised notice with fee waiver</span>
                </div>
                <div className="p-2 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-[10px] text-emerald-700 truncate">
                  Highlighted Clauses - Extended Warranty
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Progress</span>
                <span>Diff Coverage: 84%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-[#4F46E5] w-[60%]" title="Unchanged"></div>
                <div className="h-full bg-[#22C55E] w-[24%]" title="Updated"></div>
                <div className="h-full bg-rose-400 w-[16%]" title="Removed"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Row 2: Document Upload, Risk & Attention, Project Timeline */}
        <div className="grid grid-cols-3 gap-6">
          {/* Widget 3: Document Upload */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-base text-[#172033]">Document Upload</span>
              <span className="text-[10px] font-medium text-slate-400">PDF • DOCX • TXT</span>
            </div>

            <div
              onClick={() => setIsUploadOpen(true)}
              className="my-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#172033]">Drag and drop</p>
                <p className="text-xs text-slate-400 mt-0.5">Drag and drop to receive here</p>
              </div>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload now</span>
            </button>
          </div>

          {/* Desktop Center-Right Columns */}
          <div className="col-span-2 space-y-6 flex flex-col justify-between">
            {/* Widget 4: Risk & Attention */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#172033]">Risk & Attention</span>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {highRiskClauses.length} High Risk
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      High Risk
                    </span>
                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">
                      {highRiskClauses[0]?.docName || 'NDA 2024 - Clause 5.1'}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {highRiskClauses[0]?.clause.plainEnglish || 'Non-compete & strict indemnity'}
                    </p>
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold">Requires Action</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Attention
                    </span>
                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">Master Agreement - Expiry</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Auto-renewal trigger within 30 days</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold">Review Window</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Attention
                    </span>
                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">Service Agreement - Clause 8.2</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Discretionary payment terms</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold">Verify Terms</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Attention
                    </span>
                    <MoreHorizontal className="w-3 h-3 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">NDA 2024 - Clause 7</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">Perpetual confidentiality</p>
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold">Counsel Review</span>
                </div>
              </div>
            </div>

            {/* Widget 5: Project Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-base text-[#172033]">Project Timeline</span>
                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="relative pt-4 pb-2">
                <div className="h-1.5 bg-slate-100 rounded-full w-full relative">
                  <div className="h-full bg-[#4F46E5] rounded-full w-[65%]"></div>
                </div>

                <div className="flex items-center justify-between -mt-3.5 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">✓</div>
                    <span className="text-xs font-bold text-slate-800 mt-2">Milestone 1</span>
                    <span className="text-[10px] text-slate-400">Effective Date</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold shadow-xs ring-4 ring-indigo-50">2</div>
                    <span className="text-xs font-bold text-indigo-600 mt-2">Milestone 2</span>
                    <span className="text-[10px] text-indigo-500 font-medium">Micro-animations</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</div>
                    <span className="text-xs font-semibold text-slate-600 mt-2">Project Timeline</span>
                    <span className="text-[10px] text-slate-400">Notice Window</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold">4</div>
                    <span className="text-xs font-semibold text-slate-600 mt-2">Milestone 4</span>
                    <span className="text-[10px] text-slate-400">Settlement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents Table (Responsive table / cards for all viewports) */}
      <div className="bg-white border border-slate-100/90 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Your Documents</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Click any document to inspect clauses and ask questions</p>
          </div>
          {documents.length > 0 && (
            <Link
              href="/app/documents"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
            >
              View library ({documents.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading your documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-10 sm:p-14 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">No documents yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your first legal document to extract clauses and query with grounded citations.
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Recent documents table">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Name</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell">Pages</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => router.push(`/app/documents/${doc.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block line-clamp-1">
                            {doc.filename}
                          </span>
                          <span className="text-[10px] text-slate-400 sm:hidden block">
                            {doc.documentType} • {doc.pageCount} pages
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 hidden sm:table-cell">{doc.documentType}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{doc.pageCount} pages</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Analyzed
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3.5 text-right space-x-1 sm:space-x-2">
                      <Link
                        href={`/app/documents/${doc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 text-xs transition-colors"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete document"
                        aria-label={`Delete ${doc.filename}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
