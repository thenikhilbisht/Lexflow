'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  ShieldCheck,
  HeartPulse,
  MessageSquareQuote,
  Settings,
  ArrowLeft,
  LogOut,
  Scale,
  ChevronDown,
  Cpu
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/documents', label: 'Document Analytics', icon: FileText },
    { href: '/admin/ai-analytics', label: 'AI Monitor', icon: Cpu },
    { href: '/admin/audit-logs', label: 'Security Logs', icon: ShieldCheck },
    { href: '/admin/system-health', label: 'System Health', icon: HeartPulse },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquareQuote },
    { href: '/admin/ai-config', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex-shrink-0 flex flex-col justify-between min-h-screen border-r border-slate-800/80 p-5">
      <div className="space-y-6">
        {/* Brand: Admin Console (Matching Image 2/3 purple square with scale) */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">
            Admin Console
          </span>
        </div>

        {/* Admin User Profile Pill (Matching Image 2/3/5: Avatar, Admin User, • Status, chevron) */}
        <div className="bg-[#1E293B]/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-700 shadow-xs">
              AD
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Admin User</div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Navigation Items (Matching Image 2/3/5) */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-[#1E293B]/70 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-slate-800/80 space-y-1.5">
        <Link
          href="/app"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#1E293B] hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-[#1E293B] hover:text-rose-400 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
