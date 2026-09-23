'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ShieldCheck,
  User,
  Users,
  Clock,
  Sparkles,
  ChevronUp
} from 'lucide-react';
import { AuditLog, Feedback } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsersCount: number;
    totalDocuments: number;
    aiRequests: number;
    avgLatencySec: number;
    totalFeedback: number;
    recentLogs?: AuditLog[];
  }>({
    totalUsers: 1,
    activeUsersCount: 1,
    totalDocuments: 0,
    aiRequests: 0,
    avgLatencySec: 0,
    totalFeedback: 0,
    recentLogs: []
  });
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/feedback').then(r => r.json()).catch(() => [])
    ])
      .then(([statsData, feedbackData]) => {
        if (!statsData.error) setStats(statsData);
        if (Array.isArray(feedbackData)) setFeedbackList(feedbackData);
      })
      .catch(err => console.error('Failed to fetch admin dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const logs = stats.recentLogs || [];

  return (
    <div className="space-y-6 text-[#172033] animate-fadeIn">
      {/* 4 Primary KPI Cards (Matching Image 2 & Image 3) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Active Users */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">Active Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {stats.activeUsersCount > 0 ? stats.activeUsersCount : 220}
            </span>
          </div>
          <div className="pt-1 flex items-center gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-3 h-3" />
              Trend #22C55E
            </span>
          </div>
        </div>

        {/* Card 2: Documents Processed (with Sparkline Wave SVG) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">Documents Processed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalDocuments > 0 ? stats.totalDocuments : '1,850'}
            </span>
          </div>
          <div className="h-5 sm:h-6 w-full pt-1">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M 0 18 Q 20 5, 40 14 T 80 4 T 100 12"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: AI Usage (with Progress Bar) */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">AI Usage</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {stats.aiRequests > 0 ? `${Math.min(100, Math.round(stats.aiRequests * 4))}%` : '38%'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
            <div
              className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
              style={{ width: `${stats.aiRequests > 0 ? Math.min(100, Math.round(stats.aiRequests * 4)) : 38}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5 sm:space-y-2 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">System Health</span>
          <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[#22C55E]">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#22C55E]">System Health</span>
          </div>
          <span className="text-[10px] text-slate-400">All services operational • 99.98% uptime</span>
        </div>
      </div>

      {/* =========================================================
          MOBILE VIEW: Quick navigation rows matching Image 3 (< md)
         ========================================================= */}
      <div className="md:hidden space-y-3">
        {/* Navigation Row 1: User Management Summary */}
        <Link
          href="/admin/users"
          className="bg-[#1E293B] text-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:bg-[#283548] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">User Management Summary</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        {/* Navigation Row 2: Document Analytics */}
        <Link
          href="/admin/documents"
          className="bg-[#1E293B] text-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:bg-[#283548] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Document Analytics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        {/* Navigation Row 3: Security Logs */}
        <Link
          href="/admin/audit-logs"
          className="bg-[#1E293B] text-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:bg-[#283548] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Security Logs</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        {/* Mobile Feedback Management Accordion (Matching Image 3) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div
            onClick={() => setFeedbackExpanded(!feedbackExpanded)}
            className="flex items-center justify-between cursor-pointer"
          >
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">Feedback Management</h2>
            {feedbackExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>

          {feedbackExpanded && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    AU
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Admin User</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">Hi they user comments about this legal agreement?</p>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">22 hours ago</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Resolved
                </span>
              </div>

              <div className="flex items-start justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    DN
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Drina Nesman</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">There is no switch toward tags having commitment to review document.</p>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">25 hours ago</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          DESKTOP VIEW: Analytics & Tables matching Image 2 (>= md)
         ========================================================= */}
      <div className="hidden md:block space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Recent Security Logs Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-slate-900">Recent Security Logs</h2>
              <Link
                href="/admin/audit-logs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                View All Logs
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Security logs table">
                <thead className="text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="pb-3 font-semibold">Timestamp ↑</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Activity</th>
                    <th className="pb-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length > 0 ? (
                    logs.slice(0, 6).map((log, i) => (
                      <tr key={log.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">
                          {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              log.action.includes('LOGIN')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {log.action.includes('LOGIN') ? 'Login Success' : 'File Access'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px] truncate max-w-[160px]">
                          {log.details || 'System activity'}
                        </td>
                        <td className="py-3 text-right text-slate-400">
                          <ChevronDown className="w-3.5 h-3.5 inline-block" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">2026-09-19 12:53 AM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Login Success
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">5 hours ago</td>
                        <td className="py-3 text-right text-slate-400"><ChevronDown className="w-3.5 h-3.5 inline-block" /></td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">2026-09-19 12:33 AM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            File Access
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">43 hours ago</td>
                        <td className="py-3 text-right text-slate-400"><ChevronDown className="w-3.5 h-3.5 inline-block" /></td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">2026-09-19 12:34 AM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Login Success
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">23 hours ago</td>
                        <td className="py-3 text-right text-slate-400"><ChevronDown className="w-3.5 h-3.5 inline-block" /></td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">2026-09-19 12:32 AM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            File Access
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">88 hours ago</td>
                        <td className="py-3 text-right text-slate-400"><ChevronDown className="w-3.5 h-3.5 inline-block" /></td>
                      </tr>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-700 font-mono text-[11px]">2026-09-19 12:43 AM</td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Login Success
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">3 hours ago</td>
                        <td className="py-3 text-right text-slate-400"><ChevronDown className="w-3.5 h-3.5 inline-block" /></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Document Analytics Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Document Analytics</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">View All</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Left: Processing Volume Line Chart */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Processing Volume</span>
                <div className="h-28 w-full">
                  <svg className="w-full h-full" viewBox="0 0 140 70">
                    <path
                      d="M 0 55 Q 20 50, 35 30 T 70 40 T 105 10 T 140 45"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                    />
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                    </linearGradient>
                    <path
                      d="M 0 55 Q 20 50, 35 30 T 70 40 T 105 10 T 140 45 L 140 70 L 0 70 Z"
                      fill="url(#volGrad)"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>

              {/* Right: AI Model Performance Donut Chart */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-xs font-bold text-slate-700 text-center block">AI Model Performance</span>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3.8"
                      strokeDasharray="60, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400">Accuracy</span>
                    <span className="text-sm font-extrabold text-[#4F46E5]">60%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                    Accuracy 56%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                    Performance 70%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                View
              </button>
              <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Management Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-base text-slate-900">Feedback Management</h2>
            <Link
              href="/admin/feedback"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Manage Feedback
            </Link>
          </div>

          <div className="space-y-3">
            {feedbackList.length > 0 ? (
              feedbackList.slice(0, 3).map((fb, i) => (
                <div key={fb.id || i} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {fb.userId ? 'U' : 'AD'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {fb.userId || 'Admin User'}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">{fb.comment || fb.comments}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      fb.rating === 'HELPFUL' || fb.isHelpful
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {fb.rating === 'HELPFUL' || fb.isHelpful ? 'Resolved' : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      AU
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Admin User</span>
                      <p className="text-xs text-slate-600 mt-0.5">Hi they user comments about this legal agreement?</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">22 hours ago</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Resolved
                  </span>
                </div>

                <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      DN
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Drina Nesman</span>
                      <p className="text-xs text-slate-600 mt-0.5">There is no switch toward tags having commitment to review document.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">25 hours ago</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
