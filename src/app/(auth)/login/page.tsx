'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to sign in. Please verify your credentials.');
        setLoading(false);
        return;
      }

      window.location.href = data.redirect || '/app';
    } catch (err: any) {
      setErrorMessage('Network error during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-100 flex flex-col justify-center px-4 sm:px-6 py-10">
      {/* Centered Floating Card Matching Image 1 */}
      <div className="max-w-sm sm:max-w-md w-full mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/80 space-y-6 animate-scale-in">
        {/* Brand & Welcome Back (Matching Image 1) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
              <div className="w-4 h-4 flex flex-col justify-center gap-0.5">
                <div className="w-full h-1 bg-white rounded-xs"></div>
                <div className="w-3/4 h-1 bg-white/80 rounded-xs"></div>
              </div>
            </div>
            <span className="text-xl font-extrabold text-[#172033] tracking-tight">LEXFLOW</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight pt-1">
            Welcome Back
          </h1>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pill Form Inputs (Matching Image 1: rounded-full, blue border) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-11 pr-4 py-3 bg-white border border-blue-200/80 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-11 pr-11 py-3 bg-white border border-blue-200/80 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Log In Button (Matching Image 1: Pill button with purple fill) */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 px-4 rounded-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Forgot Password Link (Matching Image 1) */}
          <div className="text-center pt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        {/* Sign Up Link (Matching Image 1: Don't have an account? Sign Up) */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-[#4F46E5] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
