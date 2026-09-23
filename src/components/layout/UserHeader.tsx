'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types';

interface UserHeaderProps {
  title?: string;
  user: User | null;
  onLogout: () => void;
  onSearch?: (query: string) => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  title = 'Dashboard',
  user,
  onLogout,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <header className="h-16 sm:h-20 bg-[#FBFAFC] border-b border-slate-100/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile Top Bar Layout (Matching Image 2: LEXFLOW on left, Dashboard in center, Search + Avatar on right) */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Mobile Left: LEXFLOW Logo */}
        <Link href="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <div className="w-4 h-4 flex flex-col justify-center gap-0.5">
              <div className="w-full h-1 bg-white rounded-xs"></div>
              <div className="w-3/4 h-1 bg-white/80 rounded-xs"></div>
            </div>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#172033]">
            LEXFLOW
          </span>
        </Link>

        {/* Mobile Center: Title */}
        <h1 className="text-sm font-bold text-[#172033] tracking-tight">
          {title}
        </h1>

        {/* Mobile Right: Search Icon + Avatar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white"
            aria-label="User Menu"
          >
            {user?.name ? (
              user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Left: Title / Breadcrumb (Image 1) */}
      <div className="hidden lg:flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Desktop Middle: Pill Search Bar (Matching Image 1: Q Search...) */}
      <div className="max-w-md w-full hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Desktop Right: Notification Bell & Profile Avatar (Image 1) */}
      <div className="hidden lg:flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all focus:outline-none"
            aria-expanded={showMenu}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden border-2 border-white">
              {user?.name ? (
                user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* User Menu Dropdown (Shared desktop & mobile) */}
      {showMenu && (
        <div className="absolute right-4 top-16 sm:top-20 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@lexiguide.com'}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {user?.role || 'USER'}
            </span>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Admin Console</span>
            </Link>
          )}

          <Link
            href="/app/settings"
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>Account Settings</span>
          </Link>

          <button
            onClick={() => {
              setShowMenu(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Mobile Expandable Search Drawer */}
      {showMobileSearch && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 px-4 py-3 shadow-md z-40 flex items-center gap-2 animate-slide-up">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search contracts or clauses..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
