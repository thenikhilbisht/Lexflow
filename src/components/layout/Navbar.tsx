'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Scale, ShieldCheck, UserCheck, ChevronDown, Bell, LogOut, Settings } from 'lucide-react';
import { User, UserRole } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        return { user: null };
      })
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(e => console.error('Failed to load session user:', e));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  const navLinks = [
    { href: '/app', label: 'Dashboard' },
    { href: '/app/documents', label: 'Documents' },
    { href: '/app/compare', label: 'Compare' },
    { href: '/app/ask', label: 'Ask LexiGuide' },
    { href: '/app/timeline', label: 'Timeline' },
    { href: '/app/checklists', label: 'Checklists' },
    { href: '/app/reports', label: 'Reports' },
  ];

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
                <div className="w-5 h-5 flex flex-col justify-center gap-1">
                  <div className="w-full h-1.5 bg-white rounded-xs"></div>
                  <div className="w-3/4 h-1.5 bg-white/80 rounded-xs"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">LEXFLOW</span>
                <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase">AI Legal Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/app' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions: Real User Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Show Admin Console Link ONLY for genuine admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* User Profile and Logout Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-expanded={isMenuOpen}
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 leading-none">
                    {currentUser?.name || 'Account'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentUser?.email || 'Logged in'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{currentUser?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Role: {currentUser?.role || 'USER'}
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <Link
                      href="/app/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Privacy</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-800 hover:bg-emerald-50 transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
