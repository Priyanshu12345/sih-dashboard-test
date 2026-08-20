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
    (e) => String(e.final_priority).toUpperCase() === 'HIGH'
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
      : 0;

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
      className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white text-sm">Priority Distribution</h3>
        <span className="text-[10px] text-gray-500 font-mono">
          {total} evaluated
        </span>
      </div>

      {/* Vertical Bar Chart matching Bento template */}
      <div className="h-32 flex items-end justify-between px-4 pt-4 pb-2 border-b border-[#30363d]">
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
          <span className="text-[10px] font-mono text-gray-400 mb-1">
            {highPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[#161b22] h-20 rounded-t flex items-end justify-center overflow-hidden">
            <div
              style={{ height: highBarHeight }}
              className="w-full bg-rose-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-bold ${
              activePriorityFilter === 'HIGH' ? 'text-rose-300 underline' : 'text-rose-400'
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
          <span className="text-[10px] font-mono text-gray-400 mb-1">
            {medPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[#161b22] h-20 rounded-t flex items-end justify-center overflow-hidden">
            <div
              style={{ height: medBarHeight }}
              className="w-full bg-amber-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-bold ${
              activePriorityFilter === 'MEDIUM' ? 'text-amber-300 underline' : 'text-amber-400'
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
          <span className="text-[10px] font-mono text-gray-400 mb-1">
            {lowPct.toFixed(0)}%
          </span>
          <div className="w-10 bg-[#161b22] h-20 rounded-t flex items-end justify-center overflow-hidden">
            <div
              style={{ height: lowBarHeight }}
              className="w-full bg-teal-500 rounded-t transition-all duration-500"
            />
          </div>
          <span
            className={`text-[10px] mt-2 font-bold ${
              activePriorityFilter === 'LOW' ? 'text-teal-300 underline' : 'text-teal-400'
            }`}
          >
            LOW ({lowCount})
          </span>
        </div>
      </div>

      {/* Model Confidence & Categories */}
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 text-[11px] font-medium">
            AI Model Confidence
          </span>
          <span className="text-teal-400 font-mono text-xs font-bold">
            {avgConfidence}% Avg
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            style={{ width: `${avgConfidence}%` }}
            className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
          />
        </div>

        {/* Categories Chips */}
        <div className="pt-2 border-t border-[#30363d]/60">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5">
            Top Categories
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 5).map(([cat, count]) => (
              <span
                key={cat}
                className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
              >
                <span>{cat}</span>
                <span className="text-teal-400 font-mono font-bold">{count}</span>
              </span>
            ))}
            {categories.length === 0 && (
              <span className="text-[10px] text-gray-500">No categories</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
