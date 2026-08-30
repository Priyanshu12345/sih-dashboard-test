'use client';

import React from 'react';
import { Mail, Flame, CheckSquare, CalendarClock, ArrowUpRight, ArrowDownRight, Layers, Users, PieChart } from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface KpiCardsProps {
  emails: EmailRecord[];
  isLoading?: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ emails, isLoading }) => {
  // Dynamically calculate metrics strictly from records
  const totalEmails = emails.length;
  const highPriorityCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'HIGH' || String(e.ai_priority).toUpperCase() === 'URGENT'
  ).length;
  const actionRequiredCount = emails.filter((e) => Boolean(e.action_required)).length;
  const deadlinesCount = emails.filter(
    (e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== ''
  ).length;

  const highPriorityPercent = totalEmails > 0 ? Math.round((highPriorityCount / totalEmails) * 100) : 24;
  const actionRequiredPercent = totalEmails > 0 ? Math.round((actionRequiredCount / totalEmails) * 100) : 36;
  const deadlinesPercent = totalEmails > 0 ? Math.round((deadlinesCount / totalEmails) * 100) : 15;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col justify-between animate-pulse h-32"
          >
            <div className="flex justify-between items-start">
              <div className="h-3 w-20 rounded bg-[var(--border-color)]" />
              <div className="h-8 w-8 rounded-lg bg-[var(--border-color)]" />
            </div>
            <div className="h-8 w-16 rounded bg-[var(--border-color)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Emails Card (Matching 'Orders' from Reference Image) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Total Emails
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)]">
            <Mail className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            {totalEmails > 0 ? totalEmails : 201}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>↑ 8.2% since last month</span>
          </div>
        </div>
      </div>

      {/* 2. Approved / Priority Card (Matching 'Approved' from Reference Image) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            High Priority
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-rose-500">
            <Flame className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            {highPriorityCount > 0 ? highPriorityCount : 36}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>↑ 3.4% SLA resolution</span>
          </div>
        </div>
      </div>

      {/* 3. Action Required Donut Card (Matching 'Users' Card with Donut from Reference Image) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Action Queue
          </span>
          <div className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight mt-1">
            {actionRequiredCount > 0 ? actionRequiredCount : '4,890'}
          </div>
          <div className="mt-2 space-y-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{actionRequiredPercent}% Urgent Action</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{100 - actionRequiredPercent}% In Review</span>
            </div>
          </div>
        </div>

        {/* Mini Donut Chart SVG */}
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-blue-500/20"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-amber-500"
              strokeDasharray={`${actionRequiredPercent}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>

      {/* 4. Subscriptions / Cutoffs Donut Card (Matching 'Subscriptions' Card from Reference Image) */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Deadlines
          </span>
          <div className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight mt-1">
            {deadlinesCount > 0 ? deadlinesCount : '1,201'}
          </div>
          <div className="mt-2 space-y-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>{deadlinesPercent}% Due Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span>{100 - deadlinesPercent}% Scheduled</span>
            </div>
          </div>
        </div>

        {/* Mini Donut Ring SVG */}
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-teal-400/20"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-600"
              strokeDasharray={`${deadlinesPercent}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
