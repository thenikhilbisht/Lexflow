'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Search, Upload, Trash2, ChevronRight, CheckCircle2, FolderOpen } from 'lucide-react';
import { LegalDocument } from '@/types';
import { FileUploadModal } from '@/components/documents/FileUploadModal';

export default function DocumentsLibraryPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

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
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesQuery = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || doc.documentType === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, review, and search your uploaded contracts and legal agreements.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {documents.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or summary..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              aria-label="Search documents"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by document type"
          >
            <option value="ALL">All Document Types</option>
            <option value="Employment Contract">Employment Contract</option>
            <option value="Rental Agreement">Rental Agreement</option>
            <option value="Service Agreement">Service Agreement</option>
            <option value="NDA">NDA</option>
            <option value="Loan Agreement">Loan Agreement</option>
          </select>
        </div>
      )}

      {/* Documents Grid / List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading library...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">
                {documents.length === 0 ? 'No documents in library' : 'No matching documents'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {documents.length === 0
                  ? 'Upload your first agreement to begin analyzing clauses and tracking deadlines.'
                  : 'Try searching with different keywords or clearing the category filter.'}
              </p>
            </div>
            {documents.length === 0 && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/app/documents/${doc.id}`)}
                className="p-5 hover:bg-slate-50/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors">
                        {doc.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {doc.documentType}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {doc.pageCount} pages • {(doc.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {doc.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Analyzed
                  </span>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label={`Delete ${doc.filename}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
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
