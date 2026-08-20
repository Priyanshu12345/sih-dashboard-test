'use client';

import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Database,
  Radio,
  PlusCircle,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SupabaseConfigState } from '@/types/email';

interface NavbarProps {
  configState: SupabaseConfigState;
  realtimeStatus: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenConfig: () => void;
  onOpenTestModal: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  configState,
  realtimeStatus,
  isRefreshing,
  onRefresh,
  onOpenConfig,
  onOpenTestModal,
  onOpenHelp,
}) => {
  const isConnected = configState.isConnected;
  const isCustomOrEnv = configState.source !== 'none';

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 h-16 w-full border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md shrink-0"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-lg shadow-sm">
            <span>M</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white leading-none">MailMind</h1>
            </div>
            <p className="text-[10px] text-teal-400 font-medium tracking-wider uppercase mt-0.5">
              AI Email Intelligence
            </p>
          </div>
        </div>

        {/* Center/Right: Connection status & actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Realtime Live Indicator */}
          <div
            id="realtime-status-badge"
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium md:flex ${
              realtimeStatus === 'SUBSCRIBED'
                ? 'border-emerald-500/40 bg-[#161b22] text-emerald-300'
                : 'border-[#30363d] bg-[#161b22] text-gray-400'
            }`}
            title={`Supabase Realtime status: ${realtimeStatus}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                realtimeStatus === 'SUBSCRIBED'
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-500'
              }`}
            />
            <span className="text-xs font-medium">
              {realtimeStatus === 'SUBSCRIBED' ? 'Realtime Live' : 'Polling Active'}
            </span>
          </div>

          {/* Supabase Connection Status Pill */}
          <button
            id="supabase-status-pill"
            onClick={onOpenConfig}
            className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:bg-[#21262d] ${
              isConnected
                ? 'border-emerald-500/40 bg-[#161b22] text-gray-300'
                : isCustomOrEnv
                ? 'border-amber-500/40 bg-[#161b22] text-amber-300'
                : 'border-[#30363d] bg-[#161b22] text-gray-400 hover:border-gray-500'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isConnected ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </span>
            <Database className="h-3.5 w-3.5 text-gray-400 group-hover:text-white" />
            <span className="font-medium text-xs">
              {isConnected
                ? 'Supabase Connected'
                : isCustomOrEnv
                ? 'Connecting...'
                : 'Configure Supabase'}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            id="nav-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
            title="Reload latest records from Supabase"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Test Email Injection Button */}
          <button
            id="nav-test-email-btn"
            onClick={onOpenTestModal}
            className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-[#21262d] hover:text-white"
            title="Insert a test email into Supabase"
          >
            <PlusCircle className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Insert Test Email</span>
            <span className="sm:hidden">Test</span>
          </button>

          {/* Help / SQL Schema guide */}
          <button
            id="nav-help-btn"
            onClick={onOpenHelp}
            className="rounded-md border border-[#30363d] bg-[#161b22] p-1.5 text-gray-400 hover:bg-[#21262d] hover:text-white transition-colors"
            title="View Workflow Architecture & Supabase SQL Schema"
          >
            <Code2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
