'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Scale,
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  ShieldCheck,
  HeartPulse,
  MessageSquareQuote,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navItems = [
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-[#172033] overflow-x-hidden">
      {/* Desktop Admin Sidebar (Matching Image 2/3/5 Dark Navy) */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile Admin Header (Matching Image 3: Dark navy top bar, logo on left, avatar + hamburger on right) */}
        <header className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight">
              Admin Console
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
              AD
            </div>

            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Admin Top Header (Matching Image 2/5) */}
        <header className="hidden md:flex bg-white border-b border-slate-200/80 px-6 sm:px-8 py-4 items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#172033] tracking-tight">
              Dashboard
            </h1>
          </div>

          <div className="max-w-md w-full hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users, logs, or cases..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
            </button>

            <button
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Help and Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                  AD
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                  User Menu
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Administrator</p>
                    <p className="text-[11px] text-slate-400">admin@lexiguide.com</p>
                  </div>
                  <Link
                    href="/app"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Client Workspace</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setMobileDrawerOpen(false)}
            ></div>

            <div className="relative w-72 max-w-[80vw] bg-[#0F172A] text-slate-300 min-h-screen p-5 flex flex-col justify-between z-50 shadow-2xl animate-slide-up">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white">
                      <Scale className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-white">Admin Console</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1" aria-label="Mobile Admin Menu">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#4F46E5] text-white shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  href="/app"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to App</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-slate-800 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 page-transition pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
