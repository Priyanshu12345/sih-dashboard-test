'use client';

import React, { useState } from 'react';
import {
  Swords,
  Bell,
  Zap,
  Calendar,
  Moon,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface DailyShowdownViewProps {
  emails: EmailRecord[];
  onSelectEmail: (email: EmailRecord) => void;
}

export const DailyShowdownView: React.FC<DailyShowdownViewProps> = ({
  emails,
  onSelectEmail,
}) => {
  const [reviewedIds, setReviewedIds] = useState<Set<string | number>>(new Set());

  const totalProcessedToday = emails.length;
  const urgentEmails = emails.filter((e) => Boolean(e.should_alert));
  const actionEmails = emails.filter((e) => Boolean(e.action_required) && !e.should_alert);
  const deadlineEmails = emails.filter(
    (e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== '' && !e.should_alert
  );
  const lowPriorityEmails = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'LOW' && !e.action_required && !e.should_alert
  );

  const toggleReviewed = (id: string | number) => {
    setReviewedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-[var(--bg-card)] p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Swords className="h-4 w-4" />
            <span>Daily Email Showdown</span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your inbox, distilled.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Nodify analyzed your daily stream. Here is the exact breakdown of what needs action and what you can safely ignore.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-gray-400">Processed Today</span>
              <div className="text-2xl font-black text-white mt-1">{totalProcessedToday}</div>
              <span className="text-[10px] text-gray-400 font-mono">emails</span>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-rose-300">Urgent Attention</span>
              <div className="text-2xl font-black text-rose-400 mt-1 flex items-center gap-1.5">
                <span>🚨 {urgentEmails.length}</span>
              </div>
              <span className="text-[10px] text-rose-300 font-mono">need immediate care</span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-amber-300">Require Action</span>
              <div className="text-2xl font-black text-amber-400 mt-1">⚡ {actionEmails.length}</div>
              <span className="text-[10px] text-amber-300 font-mono">to-dos extracted</span>
            </div>

            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-teal-300">Deadlines</span>
              <div className="text-2xl font-black text-teal-400 mt-1">📅 {deadlineEmails.length}</div>
              <span className="text-[10px] text-teal-300 font-mono">upcoming cutoffs</span>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5 backdrop-blur-md col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-purple-300">Can Wait</span>
              <div className="text-2xl font-black text-purple-300 mt-1">💤 {lowPriorityEmails.length}</div>
              <span className="text-[10px] text-purple-300 font-mono">low priority / noise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Flow Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-main)]">Review Today&apos;s High-Priority Queue</h2>
            <p className="text-xs text-[var(--text-muted)]">Mark items as reviewed after taking action.</p>
          </div>

          <div className="text-xs font-mono text-[var(--text-muted)]">
            <span className="font-bold text-teal-400">{reviewedIds.size}</span> / {emails.length} Reviewed
          </div>
        </div>

        {/* Email Cards List */}
        <div className="space-y-3">
          {emails.map((email) => {
            const isReviewed = reviewedIds.has(email.id);
            const isUrgent = Boolean(email.should_alert);
            const isAction = Boolean(email.action_required);

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] ${
                  isReviewed
                    ? 'opacity-60 border-[var(--border-color)] line-through'
                    : isUrgent
                    ? 'border-rose-500/50 shadow-sm'
                    : isAction
                    ? 'border-amber-500/30'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReviewed(email.id);
                    }}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      isReviewed
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-[var(--border-color)] bg-[var(--bg-main)] text-transparent hover:border-teal-400'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[180px]">
                        {email.sender}
                      </span>
                      {isUrgent && (
                        <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-extrabold text-rose-500 border border-rose-500/20">
                          🚨 IMMEDIATE ATTENTION
                        </span>
                      )}
                      {email.action_required && !isUrgent && (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-500 border border-amber-500/20">
                          ⚡ ACTION REQ.
                        </span>
                      )}
                      {!email.action_required && !isUrgent && (
                        <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-extrabold text-purple-400 border border-purple-500/20">
                          💤 CAN WAIT
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-xs text-[var(--text-main)] mt-0.5 truncate max-w-xl">
                      {email.subject}
                    </h3>
                    {email.action && (
                      <p className="text-[11px] font-bold text-teal-400 mt-0.5">
                        Recommended: {email.action}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {email.deadline && (
                    <span className="hidden sm:inline font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      📅 {String(email.deadline)}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-purple-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
