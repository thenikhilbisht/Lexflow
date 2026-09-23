'use client';

import React, { useState } from 'react';
import { ShieldCheck, Trash2, Download, Lock, User, AlertCircle, Check } from 'lucide-react';

export default function SettingsPage() {
  const [retentionDays, setRetentionDays] = useState('30');
  const [strictAi, setStrictAi] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      user: "Alex Morgan",
      email: "alex@lexiguide.internal",
      documentsAudited: 4,
      exportTimestamp: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "lexiguide_user_data_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAll = () => {
    setDeletedSuccess(true);
    setShowConfirmDelete(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Privacy Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your document security boundaries, ephemeral storage policies, and data export.
        </p>
      </div>

      {/* Privacy Notice (PRD §48) */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Zero Model Training Guarantee</p>
          <p className="leading-relaxed text-emerald-900">
            Your uploaded documents and prompt queries are processed in isolated memory environments and are <strong>never used to train public AI models</strong>. Data retention is strictly bounded according to your preferences.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value="Alex Morgan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value="alex@lexiguide.internal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Retention and Guardrails */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Data Retention & Security Policies</h2>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Automatic Document Purging</span>
              <span className="text-slate-500 text-[11px]">Period after which analyzed files are purged from cache</span>
            </div>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="0">Immediate (Ephemeral)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block">Strict Citation Grounding</span>
              <span className="text-slate-500 text-[11px]">Require verbatim page and section citations for all answers</span>
            </div>
            <input
              type="checkbox"
              checked={strictAi}
              onChange={(e) => setStrictAi(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Export and Deletion Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Data Portability & Account Management</h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export My Document Data (JSON)</span>
          </button>

          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete All Documents & History</span>
          </button>
        </div>

        {deletedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            All uploaded document caches have been permanently purged.
          </div>
        )}

        {showConfirmDelete && (
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3 text-xs text-rose-900">
            <p className="font-bold">Are you sure you want to delete all document caches?</p>
            <p className="text-rose-800">This action is irreversible and deletes all parsed sections and history.</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDeleteAll}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
