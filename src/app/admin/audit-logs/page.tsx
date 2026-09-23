'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, Shield, Search, Lock, Filter } from 'lucide-react';
import { AuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch(err => {
        console.error('Failed to load audit logs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resourceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            Tamper-Resistant Security Trail
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">System Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable logging of administrative actions, user role modifications, document access, and security policies.
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions, actors, or resources..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Audit Log Table (PRD §38) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs" aria-label="Audit log records">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
            <tr>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5">Actor</th>
              <th className="px-6 py-3.5">Action</th>
              <th className="px-6 py-3.5">Resource</th>
              <th className="px-6 py-3.5">IP Address</th>
              <th className="px-6 py-3.5">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-sans">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-sans">
                  <span className="font-bold text-slate-900 block">{log.actorName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 font-mono">{log.action}</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="text-slate-400">{log.resourceType}:</span> {log.resourceId}
                </td>
                <td className="px-6 py-4 text-slate-500">{log.ipAddress}</td>
                <td className="px-6 py-4 font-sans">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
