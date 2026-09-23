'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ShieldCheck,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
  Clock,
  AlertTriangle,
  Key,
  FileText,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { User, UserRole, UserStatus, AuditLog } from '@/types';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(res => res.json()),
      fetch('/api/admin/audit-logs').then(res => res.json())
    ])
      .then(([usersData, logsData]) => {
        if (Array.isArray(usersData)) setUsersList(usersData);
        if (Array.isArray(logsData)) setAuditLogs(logsData);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: newStatus })
      });
      if (res.ok) {
        setUsersList(prev =>
          prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
        );
      }
    } catch (e) {
      setUsersList(prev =>
        prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
      );
    } finally {
      setActiveMenuUserId(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 text-[#172033] animate-fadeIn">
      {/* Page Header (Matching Image 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, roles, and access permissions
          </p>
        </div>
      </div>

      {/* Top 3 Stat Cards (Matching Image 5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat Card 1: Total Users with Sparkline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {usersList.length}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-[#22C55E]">
              {usersList.length > 0 ? `${usersList.length} Registered` : '0 Users'}
            </span>
          </div>
          <div className="h-5 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M 0 16 Q 25 4, 50 12 T 100 6"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Stat Card 2: Active Sessions with Live Badge */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Active Accounts</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {usersList.filter(u => u.status === 'ACTIVE').length}
            </span>
            <span className="text-xs text-slate-400">active status</span>
          </div>
          <div className="h-5 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M 0 12 Q 20 18, 40 8 T 80 15 T 100 4"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Stat Card 3: Suspended or Inactive Accounts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Suspended / Inactive</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {usersList.filter(u => u.status !== 'ACTIVE').length}
            </span>
            <span className="text-xs text-slate-400">requires review</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {usersList.filter(u => u.status !== 'ACTIVE').length === 0
              ? 'All user accounts are in good standing'
              : 'Review suspended or pending accounts below'}
          </div>
        </div>
      </div>

      {/* Main Grid: All Users Table (8 Cols) + Security Overview (4 Cols) Matching Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: All Users Table (Matching Image 5) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-base text-slate-900">All Users</h2>
            <button className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto">
              View all Users
            </button>
          </div>

          {/* Search and Filters Bar (Matching Image 5) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Role ⌵</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User / Attorney</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Status ⌵</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Inactive</option>
            </select>

            <select className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Date Added ⌵</option>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>

          {/* Table (Matching Image 5) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="User directory table">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-semibold">User Name</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Last Active</th>
                  <th className="pb-3 font-semibold">2FA Enabled</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">
                        {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'Admin' : 'Attorney'}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Active ✓' : 'Inactive •'}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">2 mins ago</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Yes
                        </span>
                      </td>
                      <td className="py-3.5 text-right relative">
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeMenuUserId === user.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-left">
                            <button
                              onClick={() => toggleStatus(user)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              {user.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5 text-rose-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                              <span>{user.status === 'ACTIVE' ? 'Suspend Access' : 'Activate User'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      {loading ? 'Loading registered users...' : 'No users found matching the filter criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredUsers.length} of {usersList.length} users</span>
            <div className="flex items-center gap-1">
              <button
                disabled={true}
                className="p-1 rounded-lg border border-slate-200 text-slate-300 cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">1</span>
              <button
                disabled={true}
                className="p-1 rounded-lg border border-slate-200 text-slate-300 cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security Overview Column (Matching Image 5) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Security Overview</h2>
            </div>

            {/* Recent Security Alerts Card */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Security Event Log</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {auditLogs.filter(l => l.action?.toLowerCase().includes('fail') || l.action?.toLowerCase().includes('deny')).length} Alerts
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Recent Activities Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Recent System Events</span>

              <div className="space-y-3">
                {auditLogs.length > 0 ? (
                  auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-xs">
                      <span className="text-slate-400 font-mono text-[11px] pt-0.5 whitespace-nowrap">
                        {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-800">
                          <span className="font-bold">{log.actorName || log.actorEmail || 'System'}:</span>{' '}
                          {log.action} {log.details || ''}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2 italic">No security incidents recorded.</p>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/admin/audit-logs"
            className="w-full py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors text-center block mt-4"
          >
            View All Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
