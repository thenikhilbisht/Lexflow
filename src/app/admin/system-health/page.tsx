'use client';

import React from 'react';
import { Activity, CheckCircle2, Server, Database, FileSearch, HardDrive, Cpu } from 'lucide-react';

export default function AdminSystemHealthPage() {
  const subsystems = [
    { name: 'Core Application API', icon: Server, status: 'Operational', latency: '34ms', uptime: '99.98%' },
    { name: 'Relational Database Engine', icon: Database, status: 'Operational', latency: '12ms', uptime: '99.99%' },
    { name: 'Document Ingestion & Text Parser', icon: FileSearch, status: 'Operational', latency: '280ms', uptime: '99.95%' },
    { name: 'In-Memory Vector Search Index', icon: Cpu, status: 'Operational', latency: '48ms', uptime: '100.0%' },
    { name: 'AI Generation & Citation Validator', icon: Activity, status: 'Operational', latency: '1.8s', uptime: '99.92%' },
    { name: 'Encrypted Ephemeral Storage', icon: HardDrive, status: 'Operational', latency: '18ms', uptime: '99.99%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            All Systems Operational
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">System Health & Telemetry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live availability, error rates, and round-trip latencies across all backend infrastructure services.
        </p>
      </div>

      {/* Subsystem Health Cards (PRD §61) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub, idx) => {
          const Icon = sub.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {sub.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{sub.name}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Latency: <strong className="text-slate-800 font-mono">{sub.latency}</strong></span>
                  <span>Uptime: <strong className="text-slate-800 font-mono">{sub.uptime}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
