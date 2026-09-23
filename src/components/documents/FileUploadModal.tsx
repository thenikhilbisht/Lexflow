'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DocumentType } from '@/types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: any) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('Employment Contract');
  const [stage, setStage] = useState<'IDLE' | 'UPLOADING' | 'EXTRACTING' | 'IDENTIFYING' | 'BUILDING' | 'DONE'>('IDLE');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    setStage('UPLOADING');
    setProgress(20);

    setTimeout(() => {
      setStage('EXTRACTING');
      setProgress(45);
    }, 400);

    setTimeout(() => {
      setStage('IDENTIFYING');
      setProgress(75);
    }, 800);

    setTimeout(() => {
      setStage('BUILDING');
      setProgress(90);
    }, 1200);

    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', docType);

        const res = await fetch('/api/documents', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (res.ok) {
          setStage('DONE');
          setProgress(100);
          setTimeout(() => {
            onUploadSuccess(data);
            onClose();
          }, 500);
        } else {
          alert(data.error || 'Failed to analyze document.');
          setStage('IDLE');
        }
      } catch (err) {
        alert('Network error while uploading file.');
        setStage('IDLE');
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
          aria-label="Close upload modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-slate-900">Upload Legal Document</h3>
          <p className="text-xs text-slate-500 mt-1">
            Supported formats: PDF, DOCX, TXT • Max 25 MB
          </p>
        </div>

        {stage === 'IDLE' ? (
          <div className="space-y-4">
            {/* Dropzone */}
            <label
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-500 mb-3 border border-slate-200">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'Drop your document here or browse files'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Drop PDF / DOCX / TXT'}
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Document Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Employment Contract">Employment Contract</option>
                <option value="Rental Agreement">Rental Agreement / Lease</option>
                <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                <option value="Service Agreement">Master Service Agreement (SaaS)</option>
                <option value="Loan Agreement">Loan Agreement</option>
                <option value="Terms & Conditions">Terms & Conditions</option>
                <option value="Notice / Other">Notice / Other</option>
              </select>
            </div>

            <button
              onClick={handleStartUpload}
              disabled={!file}
              className="w-full py-3.5 px-4 bg-[#22C55E] hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Begin AI Ingestion & Analysis
            </button>
          </div>
        ) : (
          /* Multi-stage pipeline progress (PRD §9) */
          <div className="py-6 space-y-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              {stage === 'DONE' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                {stage === 'UPLOADING' && 'Uploading document safely...'}
                {stage === 'EXTRACTING' && 'Extracting text and section coordinates...'}
                {stage === 'IDENTIFYING' && 'Identifying clauses and attention risks...'}
                {stage === 'BUILDING' && 'Building document index & citation map...'}
                {stage === 'DONE' && 'Analysis Complete!'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {stage === 'UPLOADING' && 'Writing file to secure ephemeral storage buffer'}
                {stage === 'EXTRACTING' && 'Parsing section numbers and page boundaries'}
                {stage === 'IDENTIFYING' && 'Evaluating against 18 clause taxonomy categories'}
                {stage === 'BUILDING' && 'Synthesizing timeline dates and obligation checklist'}
                {stage === 'DONE' && 'Redirecting to Document Analysis Hub'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
