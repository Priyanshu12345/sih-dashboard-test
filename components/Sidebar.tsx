'use client';

import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Zap,
  Calendar,
  Swords,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  emailsCount: number;
  urgentCount: number;
  actionCount: number;
  deadlinesCount: number;
  devMode?: boolean;
  onToggleDevMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  emailsCount,
  urgentCount,
  actionCount,
  deadlinesCount,
}) => {
  const mainNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: urgentCount > 0 ? `${urgentCount} Urgent` : null, badgeColor: 'rose' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: emailsCount > 0 ? emailsCount : null, badgeColor: 'slate' },
    { id: 'priority', label: 'Priority', icon: Zap, badge: actionCount > 0 ? `${actionCount} Action` : null, badgeColor: 'amber' },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar, badge: deadlinesCount > 0 ? deadlinesCount : null, badgeColor: 'teal' },
    { id: 'showdown', label: 'Daily Showdown', icon: Swords, badge: 'Daily', badgeColor: 'purple' },
  ];

  const insightsNavItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null, badgeColor: 'slate' },
  ];

  const settingsNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, badgeColor: 'slate' },
  ];

  const renderNavGroup = (title: string, items: typeof mainNavItems) => (
    <div className="space-y-1">
      <div className="px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onClose();
            }}
            className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                }`}
              />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.badgeColor === 'rose'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : item.badgeColor === 'amber'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : item.badgeColor === 'teal'
                    ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                    : item.badgeColor === 'purple'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-teal-400 text-white shadow-md shadow-purple-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[var(--text-main)] flex items-center gap-1.5">
                  NODIFY
                </h1>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Smart Email Operations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-3 px-3 py-4">
            {renderNavGroup('MAIN', mainNavItems)}
            {renderNavGroup('INSIGHTS', insightsNavItems)}
            {renderNavGroup('SETTINGS', settingsNavItems)}
          </nav>
        </div>

        {/* Bottom AI Philosophy Card */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-main)]/30">
          <div className="rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-teal-500/10 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-main)]">AI Email Assistant</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
              &quot;AI decides what deserves your immediate attention. Everything else is organized.&quot;
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-[var(--text-subtle)] font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-teal-500" />
              Nodify v2.0
            </span>
            <span>Gmail + Supabase</span>
          </div>
        </div>
      </aside>
    </>
  );
};

