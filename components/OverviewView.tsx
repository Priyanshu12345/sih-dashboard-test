'use client';

import React from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Flame,
  Swords,
  Clock,
  ArrowRight,
  Sparkles,
  Inbox,
  ChevronRight,
  Eye,
  AlertCircle,
  Layers,
  Zap,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';
import { UpcomingDeadlines } from '@/components/UpcomingDeadlines';
import { EmailTable } from '@/components/EmailTable';

interface OverviewViewProps {
  emails: EmailRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectEmail: (email: EmailRecord) => void;
  onNavigateTab: (tab: string) => void;
  activePriorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  userName?: string;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  emails,
  isLoading,
  error,
  onRetry,
  onSelectEmail,
  onNavigateTab,
  activePriorityFilter,
  onPriorityFilterChange,
  userName = 'Kristi K.',
}) => {
  // Compute counts strictly from real Supabase data
  const totalProcessedToday = emails.length;
  const urgentEmails = emails.filter((e) => Boolean(e.should_alert));
  const urgentCount = urgentEmails.length;
  const actionRequiredCount = emails.filter((e) => Boolean(e.action_required)).length;
  const activeDeadlinesCount = emails.filter(
    (e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== ''
  ).length;
  const lowPriorityCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'LOW' && !e.should_alert && !e.action_required
  ).length;

  return (
    <div className="space-y-8">
      {/* 1. TOP GREETING SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
            Good evening, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">
            Here&apos;s what your inbox needs from you today.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span>AI Active Filter Engaged</span>
        </div>
      </div>

      {/* 2. FOUR SUMMARY CARDS (REAL SUPABASE DATA) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Urgent */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Urgent Attention
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <Bell className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-500 tracking-tight">
              {urgentCount}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
              emails where should_alert = true
            </p>
          </div>
        </div>

        {/* Card 2: Action Required */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Action Required
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              {actionRequiredCount}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
              emails where action_required = true
            </p>
          </div>
        </div>

        {/* Card 3: Upcoming Deadlines */}
        <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Upcoming Deadlines
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-teal-400 tracking-tight">
              {activeDeadlinesCount}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
              active cutoff schedules
            </p>
          </div>
        </div>

        {/* Card 4: Emails Processed */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Emails Processed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-main)] text-purple-400">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[var(--text-main)] tracking-tight">
              {totalProcessedToday}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
              processed today via pipeline
            </p>
          </div>
        </div>
      </div>

      {/* 3. 🚨 NEEDS YOUR ATTENTION SECTION (ONLY should_alert = true) */}
      <section id="needs-your-attention-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              <span>🚨 Needs Your Attention</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Strictly filtered for immediate Telegram-worthy priority emails (<code className="text-rose-400 font-mono">should_alert = true</code>).
            </p>
          </div>

          <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-extrabold text-rose-500">
            {urgentCount} Alert{urgentCount === 1 ? '' : 's'}
          </span>
        </div>

        {urgentEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-500/30 bg-teal-500/5 p-8 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-teal-400 mb-2" />
            <h3 className="text-sm font-bold text-teal-300">All clear! No urgent emails.</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              AI classified no incoming messages requiring immediate alert dispatch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {urgentEmails.map((email) => {
              const isHigh = String(email.final_priority).toUpperCase() === 'HIGH';

              return (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] ${
                    isHigh
                      ? 'border-rose-500/60 shadow-xl shadow-rose-500/10 bg-gradient-to-br from-rose-500/10 via-[var(--bg-card)] to-purple-950/20'
                      : 'border-amber-500/40'
                  }`}
                >
                  {/* Top Bar: Category & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[140px]">
                        {email.sender}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        isHigh
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-amber-500 text-black'
                      }`}
                    >
                      {String(email.final_priority).toUpperCase()}
                    </span>
                  </div>

                  {/* Subject */}
                  <h3 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {email.subject}
                  </h3>

                  {/* Summary */}
                  {email.summary && (
                    <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                      &quot;{email.summary}&quot;
                    </p>
                  )}

                  {/* Meta Bar: Deadline & Action */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] space-y-2">
                    {email.deadline && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium">Deadline:</span>
                        <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                          📅 {String(email.deadline_status || email.deadline)}
                        </span>
                      </div>
                    )}

                    {email.action && (
                      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2 text-[11px] font-bold text-teal-300 flex items-center justify-between">
                        <span className="truncate">Action: {email.action}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 ml-1" />
                      </div>
                    )}

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmail(email);
                        }}
                        className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-purple-500 transition-all flex items-center gap-1"
                      >
                        <span>View Email</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ⚔ DAILY EMAIL SHOWDOWN CARD */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-[var(--bg-card)] p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-black text-white">⚔ Daily Email Showdown</h3>
              <span className="rounded-full bg-purple-500/20 text-purple-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase border border-purple-500/30">
                Inbox Distilled
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-xl">
              Nodify distills your raw inbox into clear actionable tiers so you can focus on what matters.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-gray-200">
              <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1">
                {totalProcessedToday} emails processed today
              </span>
              <span className="text-rose-400">🚨 {urgentCount} need immediate attention</span>
              <span className="text-amber-400">⚡ {actionRequiredCount} require action</span>
              <span className="text-teal-400">📅 {activeDeadlinesCount} have deadlines</span>
              <span className="text-purple-300">💤 {lowPriorityCount} can wait</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('showdown')}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-xs font-black text-white shadow-xl shadow-purple-500/20 hover:opacity-95 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span>Review Today&apos;s Inbox</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 5. UPCOMING DEADLINES & RECENT EMAILS (BENTO GRID) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Emails (8 cols) */}
        <div className="lg:col-span-8">
          <EmailTable
            emails={emails}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            onSelectEmail={onSelectEmail}
            activePriorityFilter={activePriorityFilter}
            onPriorityFilterChange={onPriorityFilterChange}
          />
        </div>

        {/* Right Column: Upcoming Deadlines (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <UpcomingDeadlines
            emails={emails}
            onSelectEmail={onSelectEmail}
          />
        </div>
      </div>
    </div>
  );
};
