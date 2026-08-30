'use client';

import React from 'react';
import {
  Zap,
  Bell,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface PriorityViewProps {
  emails: EmailRecord[];
  onSelectEmail: (email: EmailRecord) => void;
}

export const PriorityView: React.FC<PriorityViewProps> = ({
  emails,
  onSelectEmail,
}) => {
  // Group emails by priority tiers strictly derived from Supabase data
  const urgentEmails = emails.filter((e) => Boolean(e.should_alert));
  const highEmails = emails.filter(
    (e) => !e.should_alert && String(e.final_priority).toUpperCase() === 'HIGH'
  );
  const mediumEmails = emails.filter(
    (e) => !e.should_alert && String(e.final_priority).toUpperCase() === 'MEDIUM'
  );
  const lowEmails = emails.filter(
    (e) => !e.should_alert && String(e.final_priority).toUpperCase() === 'LOW'
  );

  const renderSectionHeader = (
    title: string,
    subtitle: string,
    count: number,
    icon: React.ReactNode,
    badgeColorClass: string
  ) => (
    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${badgeColorClass}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
            <span>{title}</span>
            <span className="rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] px-2.5 py-0.5 text-xs font-mono font-bold text-[var(--text-muted)]">
              {count}
            </span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  const renderEmailCard = (email: EmailRecord, isUrgent = false) => (
    <div
      key={email.id}
      onClick={() => onSelectEmail(email)}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] ${
        isUrgent
          ? 'border-rose-500/50 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-rose-500/5 via-[var(--bg-card)] to-transparent'
          : 'border-[var(--border-color)]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
              {(email.sender || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[180px]">
              {email.sender}
            </span>
          </div>

          <span className="rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
            {email.category || 'General'}
          </span>
        </div>

        <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-purple-400 transition-colors line-clamp-1">
          {email.subject}
        </h3>

        {email.summary && (
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
            {email.summary}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
        {email.action ? (
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold text-[11px] truncate max-w-[220px]">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Action: {email.action}</span>
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-subtle)] font-mono">No action required</span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectEmail(email);
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:underline shrink-0"
        >
          <span>View Email</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2.5">
          <Zap className="h-6 w-6 text-amber-400" />
          <span>Priority Overview</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Categorized priority view driven by AI analysis and alert rules.
        </p>
      </div>

      {/* 🚨 URGENT SECTION */}
      <section id="urgent-priority-section" className="space-y-4">
        {renderSectionHeader(
          '🚨 Urgent Attention Required',
          'Emails flagged should_alert = true requiring immediate response or notification',
          urgentEmails.length,
          <Bell className="h-4 w-4 text-rose-500 animate-pulse" />,
          'bg-rose-500/10 text-rose-500'
        )}

        {urgentEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-teal-500/30 bg-teal-500/5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-teal-400 mb-2" />
            <p className="text-xs font-bold text-teal-300">All urgent emails resolved!</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              No emails currently require emergency notification dispatch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentEmails.map((e) => renderEmailCard(e, true))}
          </div>
        )}
      </section>

      {/* 🔴 HIGH PRIORITY SECTION */}
      <section id="high-priority-section" className="space-y-4">
        {renderSectionHeader(
          '🔴 High Priority',
          'Actionable high-impact messages that need prompt review',
          highEmails.length,
          <Flame className="h-4 w-4 text-rose-400" />,
          'bg-rose-500/10 text-rose-400'
        )}

        {highEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)]">No high priority items right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highEmails.map((e) => renderEmailCard(e))}
          </div>
        )}
      </section>

      {/* 🟠 MEDIUM PRIORITY SECTION */}
      <section id="medium-priority-section" className="space-y-4">
        {renderSectionHeader(
          '🟠 Medium Priority',
          'Standard updates, schedules, and general operational requests',
          mediumEmails.length,
          <Zap className="h-4 w-4 text-amber-400" />,
          'bg-amber-500/10 text-amber-400'
        )}

        {mediumEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)]">No medium priority items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediumEmails.map((e) => renderEmailCard(e))}
          </div>
        )}
      </section>

      {/* 🟢 LOW PRIORITY SECTION */}
      <section id="low-priority-section" className="space-y-4">
        {renderSectionHeader(
          '🟢 Low Priority / Safe to Ignore',
          'Newsletters, automated receipts, and non-urgent announcements',
          lowEmails.length,
          <Clock className="h-4 w-4 text-teal-400" />,
          'bg-teal-500/10 text-teal-400'
        )}

        {lowEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-6 text-center bg-[var(--bg-card)]">
            <p className="text-xs text-[var(--text-muted)]">No low priority items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowEmails.map((e) => renderEmailCard(e))}
          </div>
        )}
      </section>
    </div>
  );
};
