'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import { AIConfiguration } from '@/types';

export default function AdminAIConfigPage() {
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/ai-config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
      })
      .catch(err => {
        console.error('Failed to load AI config:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (e) {
      // Non-blocking
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading AI system parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI & Model Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Versioned model parameters, chunking bounds, and prompt safety guardrail policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Updating...' : 'Save Configuration (Audit Logged)'}</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Configuration version updated and tamper-resistant audit event generated.
        </div>
      )}

      {/* Version Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Active Configuration Version
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">Release v{config.version}</p>
          <span className="text-xs text-slate-500">
            Last modified: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Strict Safety Active
        </span>
      </div>

      {/* Model Parameters Form (PRD §39) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
        <h2 className="text-sm font-bold text-slate-900">Retrieval & Generation Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Primary LLM Provider / Model</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Embedding Model</label>
            <input
              type="text"
              value={config.embeddingModel}
              onChange={(e) => setConfig({ ...config, embeddingModel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Document Chunk Size (Tokens)</label>
            <input
              type="number"
              value={config.chunkSize}
              onChange={(e) => setConfig({ ...config, chunkSize: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Retrieval Top-K Depth</label>
            <input
              type="number"
              value={config.retrievalTopK}
              onChange={(e) => setConfig({ ...config, retrievalTopK: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Temperature (Strict Calibration: 0.0 - 0.2)</label>
            <input
              type="number"
              step="0.05"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">System Prompt Policy Version</label>
            <input
              type="text"
              value={config.systemPromptVersion}
              onChange={(e) => setConfig({ ...config, systemPromptVersion: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Prompt Injection Defense Middleware</span>
              <span className="text-slate-500 text-[11px]">Sanitize untrusted document inputs and block instruction hijacking</span>
            </div>
            <input
              type="checkbox"
              checked={config.promptInjectionDefenseActive}
              onChange={(e) => setConfig({ ...config, promptInjectionDefenseActive: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block">Strict Source Citation Grounding</span>
              <span className="text-slate-500 text-[11px]">Enforce mandatory Section & Page coordinates on all factual claims</span>
            </div>
            <input
              type="checkbox"
              checked={config.strictCitationGroundingActive}
              onChange={(e) => setConfig({ ...config, strictCitationGroundingActive: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
