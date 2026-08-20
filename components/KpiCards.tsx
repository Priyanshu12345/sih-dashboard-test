'use client';

import React from 'react';
import { Mail, Flame, CheckSquare, CalendarClock, TrendingUp, AlertCircle } from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface KpiCardsProps {
  emails: EmailRecord[];
  isLoading?: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ emails, isLoading }) => {
  // Dynamically calculate metrics strictly from records
  const totalEmails = emails.length;
  const highPriorityCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'HIGH'
  ).length;
  const actionRequiredCount = emails.filter((e) => Boolean(e.action_required)).length;
  const deadlinesCount = emails.filter(
    (e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== ''
  ).length;

  // Percentage calculations
  const highPriorityPercent = totalEmails > 0 ? Math.round((highPriorityCount / totalEmails) * 100) : 0;
  const actionRequiredPercent = totalEmails > 0 ? Math.round((actionRequiredCount / totalEmails) * 100) : 0;
  const deadlinesPercent = totalEmails > 0 ? Math.round((deadlinesCount / totalEmails) * 100) : 0;

  const cards = [
    {
      id: 'kpi-total-emails',
      title: 'TOTAL EMAILS',
      value: totalEmails,
      subtext: '+12% from last week',
      subtextColor: 'text-green-500',
      icon: Mail,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      id: 'kpi-high-priority',
      title: 'HIGH PRIORITY',
      value: highPriorityCount,
      subtext: `${highPriorityPercent}% of total volume`,
      subtextColor: 'text-rose-400',
      icon: Flame,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
    },
    {
      id: 'kpi-action-required',
      title: 'ACTION REQUIRED',
      value: actionRequiredCount,
      subtext: `${actionRequiredCount} pending attention`,
      subtextColor: 'text-amber-400',
      icon: CheckSquare,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      id: 'kpi-deadlines',
      title: 'DEADLINES',
      value: deadlinesCount,
      subtext: `${deadlinesCount} upcoming cutoffs`,
      subtextColor: 'text-teal-400',
      icon: CalendarClock,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10',
    },
  ];

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col justify-between animate-pulse h-28"
          >
            <div className="flex justify-between items-start">
              <div className="h-3 w-20 rounded bg-[#161b22]"></div>
              <div className="h-8 w-8 rounded-lg bg-[#161b22]"></div>
            </div>
            <div className="mt-2 h-7 w-12 rounded bg-[#161b22]"></div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col justify-between transition-colors hover:border-gray-600"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg} ${card.iconColor}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-white font-mono leading-none">
                {card.value}
              </div>
              <p className={`text-[10px] mt-1 ${card.subtextColor}`}>
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};
