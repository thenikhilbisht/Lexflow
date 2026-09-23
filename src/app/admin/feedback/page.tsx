'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquareQuote, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserFeedback } from '@/types';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeedbacks(data);
        }
      })
      .catch(err => {
        console.error('Failed to load feedback:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = feedbacks.length;
  const helpful = feedbacks.filter(f => f.rating === 'HELPFUL').length;
  const unhelpful = feedbacks.filter(f => f.rating === 'UNHELPFUL').length;
  const helpfulRate = total > 0 ? ((helpful / total) * 100).toFixed(1) + '%' : 'N/A';
  const unhelpfulRate = total > 0 ? ((unhelpful / total) * 100).toFixed(1) + '%' : 'N/A';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading user feedback telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Feedback & Quality Loop</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real user ratings on AI explanations, citation clarity, and failure reason categorization.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ratings</span>
          <p className="text-2xl font-extrabold text-slate-900">{total}</p>
          <span className="text-xs text-slate-500">Live user submissions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Helpful Rating</span>
          <p className="text-2xl font-extrabold text-emerald-700">{helpfulRate}</p>
          <span className="text-xs text-slate-500">{helpful} helpful responses</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Unhelpful Inquiries</span>
          <p className="text-2xl font-extrabold text-rose-700">{unhelpfulRate}</p>
          <span className="text-xs text-slate-500">{unhelpful} flagged responses</span>
        </div>
      </div>

      {/* Feedback Stream Table (PRD §37) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Recent Feedback Submissions</h2>
          <span className="text-xs text-slate-400">Real-time telemetry</span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No feedback submissions yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              User ratings and reason categories submitted during Q&A assistant conversations will be recorded here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-5 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      fb.rating === 'HELPFUL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {fb.rating === 'HELPFUL' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fb.userEmail}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    {fb.reason && (
                      <p className="text-slate-700 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 inline-block">
                        Tag: {fb.reason}
                      </p>
                    )}
                    {fb.comments && <p className="text-slate-600 italic">"{fb.comments}"</p>}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    fb.rating === 'HELPFUL' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {fb.rating}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
