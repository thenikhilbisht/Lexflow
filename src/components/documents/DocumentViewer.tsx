'use client';

import React, { useRef, useEffect, useState } from 'react';
import { LegalDocument } from '@/types';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  BookOpen,
  XCircle,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface DocumentViewerProps {
  document: LegalDocument;
  activePage: number;
  highlightSection?: string;
  onPageChange: (page: number) => void;
  onClearHighlight?: () => void;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  activePage,
  highlightSection,
  onPageChange,
  onClearHighlight
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoomScale, setZoomScale] = useState(1.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPdfPages, setNumPdfPages] = useState<number>(document.pageCount || 1);
  const [renderMode, setRenderMode] = useState<'PDF' | 'TEXT'>(
    document.mimeType === 'application/pdf' || document.filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TEXT'
  );

  const isPdf = document.mimeType === 'application/pdf' || document.filename.toLowerCase().endsWith('.pdf');

  // Load PDF.js script dynamically if PDF document is present
  useEffect(() => {
    if (!isPdf) return;

    let isMounted = true;
    setPdfLoading(true);
    setPdfError(null);

    const loadPdfJs = async () => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = window.document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(true);
              } else {
                reject(new Error('PDF.js failed to initialize'));
              }
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js script from CDN'));
            window.document.head.appendChild(script);
          });
        } else if (window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Fetch PDF from server API endpoint
        const pdfUrl = `/api/documents/${document.id}/file`;
        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;
        setPdfDoc(pdf);
        setNumPdfPages(pdf.numPages);
        setPdfLoading(false);
      } catch (err: any) {
        console.warn('PDF.js loading failed, falling back to clean text view:', err);
        if (isMounted) {
          setPdfError('PDF preview fallback to extracted text mode.');
          setRenderMode('TEXT');
          setPdfLoading(false);
        }
      }
    };

    loadPdfJs();

    return () => {
      isMounted = false;
    };
  }, [document.id, isPdf]);

  // Render current PDF page onto canvas when pdfDoc, activePage, or zoomScale changes
  useEffect(() => {
    if (renderMode !== 'PDF' || !pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const pageToRender = Math.min(Math.max(1, activePage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(pageToRender);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: zoomScale * 1.3 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
      } catch (e) {
        console.warn('PDF page render error:', e);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, activePage, zoomScale, renderMode]);

  // Scroll to highlighted section in text mode
  useEffect(() => {
    if (highlightSection && contentRef.current && renderMode === 'TEXT') {
      const el =
        contentRef.current.querySelector(`[data-section="${highlightSection}"]`) ||
        contentRef.current.querySelector(`.citation-highlighted`);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightSection, activePage, renderMode]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoomScale(prev => Math.max(0.6, prev - 0.25));

  // Clean extracted text paragraphs
  const safeContent = (document.content || '')
    .replace(/%PDF-[\s\S]*?endstream/g, '')
    .replace(/\b(?:obj|endobj|stream|endstream|FlateDecode|xref|trailer)\b/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  const lines = safeContent.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Toolbar Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs">
            {document.filename}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-medium text-[11px]">
            Page {activePage} of {isPdf && pdfDoc ? numPdfPages : document.pageCount}
          </span>
        </div>

        {/* Search & Mode Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Text Search Input */}
          <div className="relative hidden sm:flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document..."
              className="pl-8 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
            />
          </div>

          {/* Render Mode Switcher for PDFs */}
          {isPdf && (
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-[11px]">
              <button
                onClick={() => setRenderMode('PDF')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  renderMode === 'PDF' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setRenderMode('TEXT')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  renderMode === 'TEXT' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Text View
              </button>
            </div>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-slate-600">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => onPageChange(Math.max(1, activePage - 1))}
              disabled={activePage <= 1}
              className="p-1 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-medium text-[11px]">{activePage}</span>
            <button
              onClick={() => onPageChange(Math.min(isPdf && pdfDoc ? numPdfPages : document.pageCount, activePage + 1))}
              disabled={activePage >= (isPdf && pdfDoc ? numPdfPages : document.pageCount)}
              className="p-1 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Citation Active Banner */}
      {highlightSection && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-900 font-semibold animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Cited Passage Highlighted: <strong>{highlightSection}</strong> (Page {activePage})
          </span>
          {onClearHighlight && (
            <button
              onClick={onClearHighlight}
              className="text-emerald-700 hover:text-emerald-950 p-0.5 font-bold"
              title="Clear Highlight"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Viewer Body Area */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 flex flex-col items-center"
        tabIndex={0}
        aria-label="Document Canvas View"
      >
        {/* PDF Canvas View Mode */}
        {renderMode === 'PDF' && (
          <div className="w-full flex flex-col items-center justify-center space-y-4">
            {pdfLoading && (
              <div className="py-20 flex flex-col items-center gap-2 text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Rendering high-fidelity PDF pages...</span>
              </div>
            )}

            <div
              className={`bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden transition-all ${
                pdfLoading ? 'hidden' : 'block'
              }`}
              style={{ transform: `scale(${zoomScale < 1 ? zoomScale : 1})`, transformOrigin: 'top center' }}
            >
              <canvas ref={canvasRef} className="max-w-full h-auto block" />
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              Page {activePage} of {numPdfPages} • PDF.js Renderer
            </div>
          </div>
        )}

        {/* Clean Extracted Text View Mode (Default for DOCX/TXT or PDF fallback) */}
        {renderMode === 'TEXT' && (
          <div
            className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-10 min-h-[500px] text-slate-800 leading-relaxed font-serif space-y-6 transition-all"
            style={{ fontSize: `${Math.max(11, Math.round(14 * zoomScale))}px` }}
          >
            <div className="border-b border-slate-200 pb-4 text-center font-sans">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
                {document.filename.replace(/\.(pdf|docx|txt)$/i, '')}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Extracted Text View • Page {activePage} of {document.pageCount}
              </p>
            </div>

            <div className="space-y-4">
              {lines.map((para, i) => {
                const sectionMatch =
                  para.match(/(?:SECTION|Section|Article|Clause)\s+(\d+(\.\d+)?)/i) ||
                  para.match(/^(\d+\.\d+)/) ||
                  para.match(/^(Rent|Security\s+Deposit|Confidentiality|Termination|Payment|Intellectual\s+Property|Indemnification|Governing\s+Law)/i);

                const secNum = sectionMatch ? (sectionMatch[1] || sectionMatch[0]) : null;

                let isHighlighted = false;
                if (highlightSection) {
                  const cleanHighlight = highlightSection.replace(/section\s*/i, '').trim().toLowerCase();
                  if (secNum && (secNum.toLowerCase().includes(cleanHighlight) || cleanHighlight.includes(secNum.toLowerCase()))) {
                    isHighlighted = true;
                  } else if (para.toLowerCase().includes(cleanHighlight)) {
                    isHighlighted = true;
                  }
                }

                // Check text search query match
                let isSearchMatched = false;
                if (searchQuery.trim().length > 1 && para.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
                  isSearchMatched = true;
                }

                return (
                  <div
                    key={i}
                    data-section={secNum ? `Section ${secNum}` : undefined}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isHighlighted
                        ? 'citation-highlighted bg-emerald-50/90 border-l-4 border-emerald-600 shadow-sm ring-2 ring-emerald-400/40 text-slate-950 font-medium'
                        : isSearchMatched
                        ? 'bg-amber-50 border-l-4 border-amber-500 text-slate-950 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{para}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-sans">
              Page {activePage} • Verified Clean Text Copy
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
