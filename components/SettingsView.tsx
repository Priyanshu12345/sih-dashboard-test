'use client';

import React from 'react';
import {
  Settings,
  Sun,
  Moon,
  Database,
  Code2,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Terminal,
} from 'lucide-react';
import { SupabaseConfigState } from '@/types/email';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  configState: SupabaseConfigState;
  devMode: boolean;
  onToggleDevMode: () => void;
  onOpenConfig: () => void;
  onOpenGuide: () => void;
  onOpenTestModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  configState,
  devMode,
  onToggleDevMode,
  onOpenConfig,
  onOpenGuide,
  onOpenTestModal,
}) => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-purple-400" />
          <span>Nodify Settings</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage your interface preferences, email assistant behaviors, and developer tools.
        </p>
      </div>

      {/* User Preferences */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">
          Appearance & Themes
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[var(--text-main)]">Visual Theme</h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Switch between Nodify sleek dark visual language and standard light theme.
            </p>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-2 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Dark Theme Active</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>Light Theme Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Rules Overview */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] border-b border-[var(--border-color)] pb-3">
          AI Alerting Philosophy
        </h2>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-xs space-y-2 text-indigo-200">
          <p className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>&quot;AI decides what deserves your immediate attention. Everything else is organized.&quot;</span>
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Nodify automatically routes high-urgency messages marked <code className="text-teal-300 font-mono">should_alert = true</code> directly to your Telegram bot and front page. Standard newsletters, promotional updates, and receipts remain accessible in your dashboard for later review without interrupting your focus.
          </p>
        </div>
      </div>

      {/* Developer & Admin Mode Section */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-teal-400" />
              <span>Developer & Admin Controls</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Enable advanced options for Supabase configuration, schema inspection, and test email injection.
            </p>
          </div>

          <button
            onClick={onToggleDevMode}
            className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]"
          >
            {devMode ? (
              <ToggleRight className="h-7 w-7 text-teal-400" />
            ) : (
              <ToggleLeft className="h-7 w-7 text-[var(--text-subtle)]" />
            )}
            <span>{devMode ? 'Dev Mode ON' : 'Dev Mode OFF'}</span>
          </button>
        </div>

        {devMode ? (
          <div className="space-y-4 pt-2">
            {/* Supabase status */}
            <div
              className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
                configState.isConnected
                  ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {configState.isConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold">
                    {configState.isConnected
                      ? `Supabase Connected (${configState.source === 'env' ? 'via .env' : 'Custom Credentials'})`
                      : 'Test Mode (Sandbox / Sample Records)'}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {configState.isConnected
                      ? `Connected to ${configState.url}`
                      : 'Configure your database credentials to sync live emails from Supabase.'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenConfig}
                className="rounded-xl bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-[#010409] hover:bg-teal-400 shrink-0"
              >
                Configure Supabase
              </button>
            </div>

            {/* Quick Dev Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={onOpenTestModal}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4 text-left hover:border-purple-500 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-main)]">Inject Test Email</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Simulate webhook processing & AI extraction</div>
                </div>
              </button>

              <button
                onClick={onOpenGuide}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4 text-left hover:border-teal-500 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-main)]">Architecture Guide</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Inspect Supabase DB schema & workflow</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-subtle)] italic">
            Developer tools are currently hidden. Toggle Dev Mode above to access Supabase sync settings and test email injection.
          </p>
        )}
      </div>
    </div>
  );
};
