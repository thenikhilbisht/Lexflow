'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessagesSquare, FileText, Sparkles, ShieldCheck, UploadCloud, AlertCircle, Eye, MessageCircle } from 'lucide-react';
import { GroundedChatWindow } from '@/components/chat/GroundedChatWindow';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { LegalDocument } from '@/types';

export default function AskWorkspacePage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeDocument, setActiveDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [highlightSection, setHighlightSection] = useState<string | undefined>(undefined);
  const [mobileTab, setMobileTab] = useState<'CHAT' | 'VIEWER'>('CHAT');

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
        console.error('Failed to load documents for chat:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch full document details for DocumentViewer when selectedDocId changes
  useEffect(() => {
    if (!selectedDocId) return;

    fetch(`/api/documents/${selectedDocId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.document) {
          setActiveDocument(data.document);
          setActivePage(1);
          setHighlightSection(undefined);
        }
      })
      .catch(e => console.error('Failed to load document details:', e));
  }, [selectedDocId]);

  const handleSelectCitation = (page: number, section: string) => {
    setActivePage(page);
    setHighlightSection(section);
    // On mobile screens, automatically show the viewer tab to view the cited page
    if (window.innerWidth < 1024) {
      setMobileTab('VIEWER');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading document library for chat...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Conversational Legal Assistant
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Ask LexiGuide</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query your legal agreements with citation-grounded verification. The model will reliably abstain if facts are not found.
          </p>
        </div>

        <div className="max-w-lg mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
            <MessagesSquare className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">No documents found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              To ask questions and receive grounded citations, please upload at least one contract or agreement (PDF, DOCX, or TXT).
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Conversational Legal Assistant
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Ask LexiGuide</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query your legal agreements with citation-grounded verification. Click any citation to view and highlight the cited page.
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active Document:</label>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile View Toggle Tabs (< lg) */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMobileTab('CHAT')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'CHAT'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat Assistant</span>
        </button>
        <button
          onClick={() => setMobileTab('VIEWER')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'VIEWER'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Document & Citations</span>
          {highlightSection && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Dual Column Layout (Desktop) & Tabbed Layout (Mobile) */}
      {selectedDocId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Document Viewer (7 Cols on Desktop) */}
          <div className={`lg:col-span-7 ${mobileTab === 'VIEWER' ? 'block' : 'hidden lg:block'}`}>
            {activeDocument ? (
              <DocumentViewer
                document={activeDocument}
                activePage={activePage}
                highlightSection={highlightSection}
                onPageChange={setActivePage}
                onClearHighlight={() => setHighlightSection(undefined)}
              />
            ) : (
              <div className="h-[650px] bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center text-xs text-slate-400">
                Loading document preview...
              </div>
            )}
          </div>

          {/* Grounded Chat Assistant (5 Cols on Desktop) */}
          <div className={`lg:col-span-5 ${mobileTab === 'CHAT' ? 'block' : 'hidden lg:block'}`}>
            <GroundedChatWindow
              key={selectedDocId}
              documentId={selectedDocId}
              onSelectCitation={handleSelectCitation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
