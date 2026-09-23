'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  Sparkles,
  FileCheck,
  Settings,
  ShieldCheck,
  LogOut,
  Calendar,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { User } from '@/types';

interface UserSidebarProps {
  user: User | null;
  onLogout: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ user, onLogout }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/app/documents', label: 'Documents', icon: FileText },
    { href: '/app/ask', label: 'AI Assistant', icon: Sparkles },
    { href: '/app/compare', label: 'Contracts', icon: FileCheck },
    { href: '/app/timeline', label: 'Timeline', icon: Calendar },
    { href: '/app/checklists', label: 'Checklists', icon: CheckSquare },
    { href: '/app/reports', label: 'Reports', icon: FileSpreadsheet },
    { href: '/app/settings', label: 'Settings', icon: Settings },
  ];

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <aside className="w-64 bg-white border-r border-slate-100/90 flex flex-col justify-between min-h-screen py-6 px-4 flex-shrink-0">
      <div className="space-y-8">
        {/* Brand Logo - LEXFLOW (Matching Image 1) */}
        <Link href="/app" className="flex items-center gap-3 px-3 group focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            {/* Custom geometric stacked bars icon matching LEXFLOW */}
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <div className="w-full h-1.5 bg-white rounded-xs"></div>
              <div className="w-3/4 h-1.5 bg-white/80 rounded-xs"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#172033] leading-none">
              LEXFLOW
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase mt-1">
              AI Legal Platform
            </span>
          </div>
        </Link>

        {/* Navigation Items (Matching Image 1) */}
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-[#172033] shadow-xs'
                    : 'text-slate-500 hover:text-[#172033] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#172033]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Admin & Logout */}
      <div className="pt-6 border-t border-slate-100 space-y-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-emerald-400 hover:bg-slate-800 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </Link>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
