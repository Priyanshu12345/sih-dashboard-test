'use client';

import React from 'react';
import { Activity, PieChart, Sparkles } from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface PriorityOverviewProps {
  emails: EmailRecord[];
  onSelectPriorityFilter?: (priority: string) => void;
  activePriorityFilter?: string;
}

export const PriorityOverview: React.FC<PriorityOverviewProps> = ({
  emails,
  onSelectPriorityFilter,
  activePriorityFilter,
}) => {
  const total = emails.length;

  const highCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'HIGH' || String(e.ai_priority).toUpperCase() === 'URGENT'
  ).length;
  const medCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'MEDIUM'
  ).length;
  const lowCount = emails.filter(
    (e) => String(e.final_priority).toUpperCase() === 'LOW'
  ).length;

  const highPct = total > 0 ? (highCount / total) * 100 : 0;
  const medPct = total > 0 ? (medCount / total) * 100 : 0;
  const lowPct = total > 0 ? (lowCount / total) * 100 : 0;

  // Max for relative bar heights
  const maxCount = Math.max(highCount, medCount, lowCount, 1);
  const highBarHeight = `${Math.max((highCount / maxCount) * 100, 10)}%`;
  const medBarHeight = `${Math.max((medCount / maxCount) * 100, 10)}%`;
  const lowBarHeight = `${Math.max((lowCount / maxCount) * 100, 10)}%`;

  // Average confidence
  const validConfidences = emails.map((e) => Number(e.confidence) || 0);
  const avgConfidence =
    validConfidences.length > 0
      ? Math.round(
          (validConfidences.reduce((a, b) => a + b, 0) / validConfidences.length) *
            100
        )
      : 94;

  // Category counts
  const categoryMap = new Map<string, number>();
  emails.forEach((e) => {
    const cat = e.category?.trim() || 'General';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });
  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div
      id="priority-distribution-card"
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm flex flex-col justify-between transition-colors"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-extrabold text-[var(--text-main)] text-sm">Priority Breakdown</h3>
        <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold">
          {total} Evaluated
        </span>
      </div>

      {/* Vertical Bar Columns */}
      <div className="h-32 flex items-end justify-between px-4 pt-4 pb-2 border-b border-[var(--border-color)]">
        {/* HIGH Column */}
        <div
          onClick={() =>
            onSelectPriorityFilter &&
            onSelectPriorityFilter(activePriorityFilter === 'HIGH' ? 'all' : 'HIGH')
          }
          className={`flex flex-col items-center flex-1 cursor-pointer transition-transform hover:scale-105 ${
            activePriorityFilter === 'HIGH' ? 'opacity-100' : 'opacity-90'
          }`}
          title={`HIGH: ${highCount} (${highPct.toFixed(0)}%)`}
        >
          <span className="text-[10px] font-mono text-[var(--text-muted)] mb-1 font-bold">
            {highPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[var(--bg-main)] h-20 rounded-t flex items-end justify-center overflow-hidden border border-[var(--border-color)]">
            <div
              style={{ height: highBarHeight }}
              className="w-full bg-rose-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-extrabold ${
              activePriorityFilter === 'HIGH' ? 'text-rose-500 underline' : 'text-rose-500/90'
            }`}
          >
            HIGH ({highCount})
          </span>
        </div>

        {/* MED Column */}
        <div
          onClick={() =>
            onSelectPriorityFilter &&
            onSelectPriorityFilter(activePriorityFilter === 'MEDIUM' ? 'all' : 'MEDIUM')
          }
          className={`flex flex-col items-center flex-1 cursor-pointer transition-transform hover:scale-105 ${
            activePriorityFilter === 'MEDIUM' ? 'opacity-100' : 'opacity-90'
          }`}
          title={`MEDIUM: ${medCount} (${medPct.toFixed(0)}%)`}
        >
          <span className="text-[10px] font-mono text-[var(--text-muted)] mb-1 font-bold">
            {medPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[var(--bg-main)] h-20 rounded-t flex items-end justify-center overflow-hidden border border-[var(--border-color)]">
            <div
              style={{ height: medBarHeight }}
              className="w-full bg-amber-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-extrabold ${
              activePriorityFilter === 'MEDIUM' ? 'text-amber-500 underline' : 'text-amber-500/90'
            }`}
          >
            MED ({medCount})
          </span>
        </div>

        {/* LOW Column */}
        <div
          onClick={() =>
            onSelectPriorityFilter &&
            onSelectPriorityFilter(activePriorityFilter === 'LOW' ? 'all' : 'LOW')
          }
          className={`flex flex-col items-center flex-1 cursor-pointer transition-transform hover:scale-105 ${
            activePriorityFilter === 'LOW' ? 'opacity-100' : 'opacity-90'
          }`}
          title={`LOW: ${lowCount} (${lowPct.toFixed(0)}%)`}
        >
          <span className="text-[10px] font-mono text-[var(--text-muted)] mb-1 font-bold">
            {lowPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[var(--bg-main)] h-20 rounded-t flex items-end justify-center overflow-hidden border border-[var(--border-color)]">
            <div
              style={{ height: lowBarHeight }}
              className="w-full bg-teal-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-extrabold ${
              activePriorityFilter === 'LOW' ? 'text-teal-500 underline' : 'text-teal-500/90'
            }`}
          >
            LOW ({lowCount})
          </span>
        </div>
      </div>

      {/* Model Confidence & Categories */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)] text-[11px] font-semibold">
            AI Classification Confidence
          </span>
          <span className="text-teal-600 dark:text-teal-400 font-mono text-xs font-bold">
            {avgConfidence}% Avg
          </span>
        </div>
        <div className="w-full bg-[var(--bg-main)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
          <div
            style={{ width: `${avgConfidence}%` }}
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
          />
        </div>

        {/* Categories Chips */}
        <div className="pt-2 border-t border-[var(--border-color)]">
          <div className="text-[10px] text-[var(--text-subtle)] uppercase tracking-wider font-bold mb-2">
            Top Categories
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 5).map(([cat, count]) => (
              <span
                key={cat}
                className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] px-2.5 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span>{cat}</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-extrabold">{count}</span>
              </span>
            ))}
            {categories.length === 0 && (
              <span className="text-[10px] text-[var(--text-muted)]">No categories</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
