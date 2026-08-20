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
        <span className="text-[10px] font-bold text-gray-400 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1" />
          DATE SET
        </span>
      );
    }

    if (days <= 2) {
      return (
        <span className="text-[10px] font-bold text-rose-400 flex items-center uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1" />
          {days < 0 ? `${Math.abs(days)} DAYS OVERDUE` : days === 0 ? 'DUE TODAY' : `${days} DAYS LEFT`}
        </span>
      );
    }

    if (days <= 7) {
      return (
        <span className="text-[10px] font-bold text-amber-400 flex items-center uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
          {days} DAYS LEFT
        </span>
      );
    }

    return (
      <span className="text-[10px] font-bold text-teal-400 flex items-center uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1" />
        {days} DAYS LEFT
      </span>
    );
  };

  const getBorderColor = (days: number | null | undefined) => {
    if (days === null || days === undefined) return 'border-[#30363d]';
    if (days <= 2) return 'border-rose-500/40 hover:border-rose-500';
    if (days <= 7) return 'border-amber-500/40 hover:border-amber-500';
    return 'border-[#30363d] hover:border-teal-500/40';
  };

  return (
    <div
      id="upcoming-deadlines-card"
      className="bg-[#0d1117] border border-[#30363d] rounded-xl flex-1 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#30363d] flex justify-between items-center">
        <h3 className="font-bold text-white text-sm">Upcoming Deadlines</h3>
        <span className="text-[10px] text-gray-500 font-mono">
          {deadlineEmails.length} active
        </span>
      </div>

      {/* Deadline list */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[380px]">
        {deadlineEmails.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#30363d] py-8 text-center">
            <CalendarClock className="mx-auto h-7 w-7 text-gray-600" />
            <p className="mt-2 text-xs font-medium text-gray-400">
              No active deadlines found in Supabase.
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
                className={`p-3 bg-[#161b22] border rounded-lg transition-all cursor-pointer hover:bg-[#21262d] ${borderCls}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-xs text-white truncate max-w-[180px] sm:max-w-[220px]">
                    {email.subject}
                  </span>
                  {getUrgencyBadge(days)}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span className="font-mono text-[11px] truncate max-w-[160px]">
                    {email.sender}
                  </span>
                  <span className="font-mono text-[11px] text-gray-300">
                    {String(email.deadline)}
                  </span>
                </div>

                {email.action && (
                  <div className="mt-2 text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded flex items-center justify-between border border-teal-500/20">
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
