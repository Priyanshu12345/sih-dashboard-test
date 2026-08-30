'use client';

import React from 'react';
import {
  CalendarClock,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface UpcomingDeadlinesProps {
  emails: EmailRecord[];
  onSelectEmail: (email: EmailRecord) => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
  emails,
  onSelectEmail,
}) => {
  // Filter records with non-null deadline
  const deadlineEmails = emails
    .filter((e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== '')
    .map((e) => {
      let days = e.days_remaining;
      if (days === undefined || days === null) {
        const target = new Date(String(e.deadline)).getTime();
        const now = new Date().getTime();
        const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
        days = isNaN(diffDays) ? null : diffDays;
      }
      return { ...e, calculatedDaysRemaining: days };
    })
    .sort((a, b) => {
      const aDays = a.calculatedDaysRemaining ?? 9999;
      const bDays = b.calculatedDaysRemaining ?? 9999;
      return aDays - bDays;
    });

  const getUrgencyBadge = (days: number | null | undefined) => {
    if (days === null || days === undefined) {
      return (
        <span className="text-[10px] font-extrabold text-[var(--text-muted)] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-subtle)] mr-1" />
          SCHEDULED
        </span>
      );
    }

    if (days < 0) {
      return (
        <span className="text-[10px] font-extrabold text-rose-500 flex items-center uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1" />
          OVERDUE
        </span>
      );
    }

    if (days === 0) {
      return (
        <span className="text-[10px] font-extrabold text-rose-500 flex items-center uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1" />
          TODAY
        </span>
      );
    }

    if (days === 1) {
      return (
        <span className="text-[10px] font-extrabold text-amber-500 flex items-center uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
          TOMORROW
        </span>
      );
    }

    return (
      <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 flex items-center uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1" />
        {days} DAYS LEFT
      </span>
    );
  };

  const getBorderColor = (days: number | null | undefined) => {
    if (days === null || days === undefined) return 'border-[var(--border-color)]';
    if (days <= 0) return 'border-rose-500/40 hover:border-rose-500';
    if (days <= 2) return 'border-amber-500/40 hover:border-amber-500';
    return 'border-[var(--border-color)] hover:border-teal-500/40';
  };

  return (
    <div
      id="upcoming-deadlines-card"
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex-1 flex flex-col overflow-hidden transition-colors"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
        <h3 className="font-extrabold text-[var(--text-main)] text-sm">Upcoming Deadlines</h3>
        <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold">
          {deadlineEmails.length} Active
        </span>
      </div>

      {/* Deadline list */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px]">
        {deadlineEmails.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-color)] py-8 text-center bg-[var(--bg-main)]/50">
            <CalendarClock className="mx-auto h-7 w-7 text-[var(--text-subtle)]" />
            <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">
              No active deadlines found.
            </p>
          </div>
        ) : (
          deadlineEmails.map((email) => {
            const days = email.calculatedDaysRemaining;
            const borderCls = getBorderColor(days);

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-3.5 bg-[var(--bg-main)] border rounded-xl transition-all cursor-pointer hover:bg-[var(--bg-card-hover)] ${borderCls}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[180px] sm:max-w-[220px]">
                    {email.subject}
                  </span>
                  {getUrgencyBadge(days)}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span className="font-mono text-[11px] truncate max-w-[160px]">
                    {email.sender}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-main)] font-semibold">
                    {String(email.deadline)}
                  </span>
                </div>

                {email.action && (
                  <div className="mt-2 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg flex items-center justify-between border border-teal-500/20">
                    <span className="truncate">Action: {email.action}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 ml-1" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
