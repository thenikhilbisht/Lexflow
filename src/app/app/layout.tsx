'use client';

import React, { useState, useEffect } from 'react';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { UserHeader } from '@/components/layout/UserHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { LegalDisclaimerBanner } from '@/components/layout/LegalDisclaimerBanner';
import { User } from '@/types';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAFC] flex text-[#172033] overflow-x-hidden">
      {/* Desktop Sidebar (Matching Image 1: LEXFLOW) */}
      <div className="hidden lg:block">
        <UserSidebar user={currentUser} onLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <UserHeader user={currentUser} onLogout={handleLogout} />

        <main className="flex-1 px-4 sm:px-8 py-5 sm:py-8 space-y-6 max-w-7xl w-full mx-auto page-transition pb-24 lg:pb-8">
          <LegalDisclaimerBanner compact />
          {children}
        </main>

        <footer className="hidden lg:flex border-t border-slate-100/80 bg-white/50 py-4 px-6 sm:px-8 text-xs text-slate-400 items-center justify-between gap-2 mt-auto">
          <span>LEXFLOW Platform • AI-Powered Legal Document Intelligence</span>
          <span>Verified Grounding • Zero-Hallucination Guardrails</span>
        </footer>

        {/* Native Mobile Bottom Navigation Bar (Matching Image 2) */}
        <MobileBottomNav user={currentUser} />
      </div>
    </div>
  );
}
