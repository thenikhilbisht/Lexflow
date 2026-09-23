'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, ShieldCheck, FolderOpen } from 'lucide-react';
import { LegalDocument } from '@/types';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDocuments(data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Documents Catalog</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform-wide document ingestion pipeline monitoring and processing telemetry.
        </p>
      </div>

      {/* Documents Table (PRD §33) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading platform documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No documents in the system</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No documents have been uploaded across the platform yet. When users upload agreements, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="System documents catalog">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-3.5">Document</th>
                <th className="px-6 py-3.5">Owner</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Pages</th>
                <th className="px-6 py-3.5">Processing Time</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{doc.userName || 'User'}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.documentType}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.pageCount}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{doc.processingTimeMs}ms</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
