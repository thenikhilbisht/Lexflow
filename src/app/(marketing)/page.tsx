import React from 'react';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  FileSearch,
  GitCompare,
  MessagesSquare,
  Calendar,
  CheckCircle2,
  Lock,
  FileText,
  Accessibility,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { LegalDisclaimerBanner } from '@/components/layout/LegalDisclaimerBanner';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="border-b border-slate-100 bg-white/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <div className="w-full h-1.5 bg-white rounded-xs"></div>
                <div className="w-3/4 h-1.5 bg-white/80 rounded-xs"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#172033] tracking-tight leading-none">LEXFLOW</span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase mt-0.5">AI Legal Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (PRD §7) */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI-Powered Legal Document Understanding & Assistance</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
              Understand the fine print. <br className="hidden sm:inline" />
              <span className="text-emerald-600">Before it becomes a problem.</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              AI-powered document understanding that helps you explain, compare, and navigate legal information in plain language.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span>Analyze a Document</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span>See How It Works</span>
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Console</span>
              </Link>
            </div>

            {/* Trust Banner (PRD §7) */}
            <div className="pt-10">
              <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Protected Documents</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Source-Grounded Answers</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Information, Not Legal Advice</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Accessibility className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Accessible by Design (WCAG AA)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles & Workflow (PRD §2) */}
        <section id="features" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Turn complex legal documents into clear, actionable guidance
            </h2>
            <p className="text-sm text-slate-500">
              A structured intelligence pipeline that grounds every explanation in verified document text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-3 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Plain-Language Explanations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deconstructs dense clauses into plain English, identifying who it affects, your specific obligations, and when it applies with exact Section & Page citations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-3 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Contract Comparison</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare contract revisions side-by-side. Highlights added, modified, and removed terms with non-biased visual indicators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-3 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Grounded Q&A & Abstention</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions and receive answers strictly linked to page coordinates. If a term is absent, the system reliably abstains without hallucinating.
              </p>
            </div>
          </div>

          {/* Legal Disclaimer Section */}
          <div className="mt-16">
            <LegalDisclaimerBanner />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">LexiGuide Legal Understanding & Intelligence Platform</p>
          <p>
            Designed for informational and preparation assistance. Not a law firm and does not provide legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
