'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface AnalyticsChartsProps {
  emails: EmailRecord[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ emails }) => {
  const [selectedYear, setSelectedYear] = useState('2026');

  // Compute month breakdown data based on emails or standard trend
  const totalCount = emails.length;
  const actionRequiredCount = emails.filter((e) => e.action_required).length;
  const urgentCount = emails.filter((e) => e.ai_priority === 'URGENT').length;
  const highCount = emails.filter((e) => e.ai_priority === 'HIGH').length;

  const resolutionRate = totalCount > 0 ? Math.round(((totalCount - actionRequiredCount) / totalCount) * 100) : 85;
  const prioritySlaRate = totalCount > 0 ? Math.round(((totalCount - urgentCount) / totalCount) * 100) : 92;

  // Monthly breakdown mock data for bar chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barHeights = [45, 60, 50, 70, 65, 80, 55, 90, 75, 85, 60, 95];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 1. Bar Chart: Email Dynamics (8 cols) */}
      <div className="lg:col-span-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <span>Email Volume Dynamics</span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                +14.2% YoY
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Monthly processed volume vs automated actions</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] outline-none cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* SVG Bar Chart (Inspired by reference Sales Dynamics) */}
        <div className="relative h-48 w-full pt-4">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[var(--text-subtle)] font-mono pointer-events-none">
            <div className="border-b border-[var(--border-color)]/50 pb-1">400k</div>
            <div className="border-b border-[var(--border-color)]/50 pb-1">300k</div>
            <div className="border-b border-[var(--border-color)]/50 pb-1">200k</div>
            <div className="border-b border-[var(--border-color)]/50 pb-1">100k</div>
            <div className="border-b border-[var(--border-color)]">0</div>
          </div>

          {/* Bar Columns Container */}
          <div className="relative z-10 flex h-full items-end justify-between px-6 pt-4">
            {months.map((m, idx) => {
              const heightPercent = barHeights[idx];
              const isHighlight = idx === 7; // Aug highlighted
              return (
                <div key={m} className="group relative flex flex-col items-center flex-1 mx-1 h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 hidden rounded-md bg-[var(--text-main)] px-2 py-1 text-[10px] font-bold text-[var(--bg-main)] group-hover:block shadow-lg z-20 whitespace-nowrap">
                    {heightPercent * 4}k emails
                  </div>

                  {/* Bar fill */}
                  <div className="w-full max-w-[24px] rounded-t-lg bg-[var(--bg-main)] p-0.5 h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`chart-bar w-full rounded-t-md transition-all duration-500 ${
                        isHighlight
                          ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/30'
                          : 'bg-gradient-to-t from-blue-500/40 to-blue-400/60 hover:from-blue-500 hover:to-indigo-400'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`mt-3 text-[10px] font-bold tracking-tight uppercase ${isHighlight ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-[var(--text-muted)]'}`}>
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Donut Progress Stat Cards (4 cols) - Matching Paid Invoices / Funds Received */}
      <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
        {/* Resolution Rate Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">SLA Resolution Rate</span>
              <h4 className="text-xl font-extrabold text-[var(--text-main)] mt-1">{resolutionRate}%</h4>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-0.5 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Target &gt;80% achieved
              </p>
            </div>

            {/* Circular Donut Ring SVG */}
            <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[var(--border-color)]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-500"
                  strokeDasharray={`${resolutionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[var(--text-main)]">
                +{resolutionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Priority SLA Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)]">High Priority SLA</span>
              <h4 className="text-xl font-extrabold text-[var(--text-main)] mt-1">{prioritySlaRate}%</h4>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5 flex items-center gap-1">
                <Zap className="h-3 w-3 text-purple-500" /> Avg response &lt; 2h
              </p>
            </div>

            {/* Circular Donut Ring SVG */}
            <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[var(--border-color)]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  strokeDasharray={`${prioritySlaRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[var(--text-main)]">
                +{prioritySlaRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Curved Line Graph: Overall Processing Activity (Full width across 12 cols) */}
      <div className="lg:col-span-12 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">Overall Processing Activity</h3>
            <p className="text-xs text-[var(--text-muted)]">Realtime AI categorization latency trend over 24h</p>
          </div>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
            2026 Trend Line
          </span>
        </div>

        {/* Smooth Curved Line SVG */}
        <div className="relative h-32 w-full pt-2">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path
              d="M 0 80 Q 75 20, 150 60 T 300 40 T 450 15 L 500 25 L 500 100 L 0 100 Z"
              fill="url(#purpleGradient)"
            />

            {/* Line Path */}
            <path
              d="M 0 80 Q 75 20, 150 60 T 300 40 T 450 15 L 500 25"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* End Point Glow */}
            <circle cx="500" cy="25" r="5" fill="#a855f7" />
            <circle cx="500" cy="25" r="9" fill="#a855f7" fillOpacity="0.3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
