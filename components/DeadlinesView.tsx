'use client';

import React, { useMemo } from 'react';
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface DeadlinesViewProps {
  emails: EmailRecord[];
  onSelectEmail: (email: EmailRecord) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  emails,
  onSelectEmail,
}) => {
  // Extract all emails with deadline field
  const deadlineEmails = useMemo(() => {
    return emails
      .filter((e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== '')
      .map((e) => {
        let days = e.days_remaining;
        if (days === undefined || days === null) {
          const target = new Date(String(e.deadline)).getTime();
          const now = new Date().getTime();
          const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
          days = isNaN(diffDays) ? null : diffDays;
        }
        return { ...e, calculatedDays: days };
      })
      .sort((a, b) => {
        const aDays = a.calculatedDays ?? 9999;
        const bDays = b.calculatedDays ?? 9999;
        return aDays - bDays;
      });
  }, [emails]);

  // Group chronologically
  const overdueGroup = deadlineEmails.filter((e) => (e.calculatedDays ?? 0) < 0);
  const todayGroup = deadlineEmails.filter((e) => e.calculatedDays === 0);
  const tomorrowGroup = deadlineEmails.filter((e) => e.calculatedDays === 1);
  const thisWeekGroup = deadlineEmails.filter((e) => (e.calculatedDays ?? 0) > 1 && (e.calculatedDays ?? 0) <= 7);
  const laterGroup = deadlineEmails.filter((e) => (e.calculatedDays ?? 0) > 7 || e.calculatedDays === null);

  const renderDeadlineBadge = (days: number | null) => {
    if (days === null) {
      return (
        <span className="rounded-full bg-[var(--bg-main)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--text-muted)] border border-[var(--border-color)]">
          SCHEDULED
        </span>
      );
    }
    if (days < 0) {
      return (
        <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-extrabold text-rose-500 border border-rose-500/30 animate-pulse">
          OVERDUE
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-extrabold text-rose-500 border border-rose-500/30">
          TODAY
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-extrabold text-amber-500 border border-amber-500/30">
          TOMORROW
        </span>
      );
    }
    return (
      <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-[10px] font-extrabold text-teal-600 dark:text-teal-400 border border-teal-500/30">
        {days} DAYS LEFT
      </span>
    );
  };

  const renderGroup = (
    title: string,
    subtitle: string,
    items: typeof deadlineEmails,
    icon: React.ReactNode,
    borderCls: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
            {title} ({items.length})
          </h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-color)] p-4 text-center text-xs text-[var(--text-subtle)] bg-[var(--bg-card)]">
          No deadlines in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEmail(item)}
              className={`group flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] ${borderCls}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[200px]">
                    {item.sender}
                  </span>
                  {renderDeadlineBadge(item.calculatedDays)}
                </div>

                <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-purple-400 transition-colors line-clamp-1">
                  {item.subject}
                </h3>

                {item.summary && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-500 font-bold">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{String(item.deadline)}</span>
                </div>

                {item.action ? (
                  <div className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 truncate max-w-[140px]">
                    Action: {item.action}
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEmail(item);
                    }}
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2.5">
            <CalendarClock className="h-6 w-6 text-teal-400" />
            <span>Upcoming Deadlines</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Chronologically grouped deadlines extracted by Nodify AI.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-mono font-bold text-[var(--text-main)]">
          <Clock className="h-4 w-4 text-teal-400" />
          <span>{deadlineEmails.length} Total Deadlines</span>
        </div>
      </div>

      {/* Chronological Groups */}
      <div className="space-y-8">
        {/* OVERDUE */}
        {renderGroup(
          'OVERDUE',
          'Past cutoffs requiring immediate attention',
          overdueGroup,
          <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />,
          'border-rose-500/50 bg-rose-500/5'
        )}

        {/* TODAY */}
        {renderGroup(
          'TODAY',
          'Due by end of day today',
          todayGroup,
          <Clock className="h-4 w-4 text-rose-400" />,
          'border-rose-500/30'
        )}

        {/* TOMORROW */}
        {renderGroup(
          'TOMORROW',
          'Due tomorrow',
          tomorrowGroup,
          <Calendar className="h-4 w-4 text-amber-400" />,
          'border-amber-500/30'
        )}

        {/* THIS WEEK */}
        {renderGroup(
          'THIS WEEK',
          'Due within 2 - 7 days',
          thisWeekGroup,
          <CalendarClock className="h-4 w-4 text-teal-400" />,
          'border-[var(--border-color)] hover:border-teal-500/40'
        )}

        {/* LATER */}
        {renderGroup(
          'LATER',
          'Due beyond 7 days',
          laterGroup,
          <Sparkles className="h-4 w-4 text-purple-400" />,
          'border-[var(--border-color)]'
        )}
      </div>
    </div>
  );
};
