'use client';

import React from 'react';
import { BarChart3, Zap, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function AdminAIAnalyticsPage() {
  const metrics = [
    { label: 'Documents Analyzed', value: '31,902', change: '+18.4% MoM', good: true },
    { label: 'Questions Answered', value: '182,932', change: '+24.1% MoM', good: true },
    { label: 'Average Response Latency', value: '1.8s', change: '-0.3s (faster)', good: true },
    { label: 'Retrieval Recall Rate', value: '99.4%', change: 'Target: >98%', good: true },
    { label: 'Citation Coverage', value: '100%', change: 'Zero un-cited facts', good: true },
    { label: '"Not Found" Abstention Rate', value: '4.2%', change: '0 hallucinations', good: true },
    { label: 'Prompt Injection Neutralized', value: '142', change: '100% blocked', good: true },
    { label: 'Estimated Token Consumption', value: '42.8M', change: 'Optimized chunking', good: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Analytics & Retrieval Metrics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time intelligence telemetry tracking retrieval recall, citation coverage, and latency.
        </p>
      </div>

      {/* Metrics Grid (PRD §34) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {m.label}
            </span>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{m.value}</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              <span>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Latency and Retrieval Fidelity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Retrieval Precision & Abstention Ratio</h2>
          <p className="text-xs text-slate-500">
            Measures strict citation grounding against out-of-domain unmentioned legal provisions.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Direct Citation Grounding (✓ Directly Stated)</span>
                <span>88.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Derived Analysis (≈ Inferred from Document)</span>
                <span>7.6%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '7.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Safe Abstentions (— Not Found in Document)</span>
                <span>4.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '4.2%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Clause Taxonomy Distribution (18 Categories)</h2>
          <p className="text-xs text-slate-500">
            Most frequently analyzed legal categories across all ingested documents.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { cat: 'Termination', count: '4,892 clauses' },
              { cat: 'Renewal & Evergreen', count: '3,810 clauses' },
              { cat: 'Payment & Fees', count: '3,654 clauses' },
              { cat: 'Liability & Caps', count: '3,210 clauses' },
              { cat: 'Confidentiality', count: '2,980 clauses' },
              { cat: 'Restrictions & Non-Compete', count: '2,450 clauses' },
            ].map((c, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-800">{c.cat}</span>
                <span className="text-[10px] text-slate-400 font-mono">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
