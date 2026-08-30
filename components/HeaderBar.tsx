'use client';

import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  RefreshCw,
  Database,
  Calendar,
  Sparkles,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { SupabaseConfigState } from '@/types/email';

interface HeaderBarProps {
  activeTab: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSidebar: () => void;
  configState: SupabaseConfigState;
  realtimeStatus: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  devMode?: boolean;
  onToggleDevMode?: () => void;
  onOpenConfig?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  theme,
  onToggleTheme,
  onOpenSidebar,
  configState,
  realtimeStatus,
  isRefreshing,
  onRefresh,
  devMode = false,
  onToggleDevMode,
  onOpenConfig,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'inbox':
        return 'Inbox';
      case 'priority':
        return 'Priority Feed';
      case 'deadlines':
        return 'Upcoming Deadlines';
      case 'showdown':
        return 'Daily Email Showdown';
      case 'analytics':
        return 'Email Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Nodify';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-header)]/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors duration-300">
      {/* Left side: Mobile Toggle + Dynamic Active Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">
            {getTabTitle(activeTab)}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Operations</span>
          </div>
        </div>
      </div>

      {/* Right side: Sync Status + Refresh + Theme Switcher + Profile */}
      <div className="flex items-center gap-3">
        {/* Realtime Status Badge */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-teal-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                realtimeStatus === 'SUBSCRIBED' ? 'bg-teal-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-[var(--text-main)]">
            {configState.isConnected ? (
              <span className="flex items-center gap-1">
                Supabase <span className="text-teal-600 dark:text-teal-400 font-bold">Live</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Sandbox Mode</span>
            )}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data from Supabase"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-teal-500' : ''}`} />
        </button>

        {/* Dev Mode Toggle / Config helper (if devMode enabled) */}
        {devMode && onOpenConfig && (
          <button
            onClick={onOpenConfig}
            title="Database Configuration"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition-colors"
          >
            <Database className="h-4 w-4 text-teal-400" />
            <span className="hidden sm:inline">DB Config</span>
          </button>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex h-9 items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 text-xs font-bold text-[var(--text-main)] shadow-xs hover:bg-[var(--bg-card-hover)] transition-all"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-3 ml-1">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md">
              KK
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-header)] bg-teal-500" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-[var(--text-main)] leading-tight">Kristi K.</div>
            <div className="text-[10px] font-medium text-[var(--text-muted)]">Inbox Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
};

