'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  FileCheck,
  Settings
} from 'lucide-react';
import { User } from '@/types';

interface MobileBottomNavProps {
  user?: User | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/app/documents', label: 'Documents', icon: FileText },
    { href: '/app/ask', label: 'AI Assistant', icon: MessageSquare },
    { href: '/app/compare', label: 'Contracts', icon: FileCheck },
    { href: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] min-h-[44px] transition-all ${
                isActive
                  ? 'text-[#4F46E5]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-[#4F46E5]' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-[#4F46E5]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
