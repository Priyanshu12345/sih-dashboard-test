'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { SupabaseConfigState } from '@/types/email';
import {
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  seedSampleRecordsToSupabase,
} from '@/lib/supabaseClient';
import { INITIAL_SAMPLE_EMAILS } from '@/lib/sampleData';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configState: SupabaseConfigState;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  configState,
  onConfigSaved,
}) => {
  const [urlInput, setUrlInput] = useState(configState.url || '');
  const [keyInput, setKeyInput] = useState(configState.anonKey || '');
  const [activeTab, setActiveTab] = useState<'settings' | 'sql' | 'env'>('settings');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(urlInput, keyInput);
    onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    clearCustomSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    onConfigSaved();
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedSampleRecordsToSupabase(INITIAL_SAMPLE_EMAILS);
      if (res.success) {
        setSeedResult(`Successfully inserted/upserted ${res.inserted} test records into Supabase 'emails' table!`);
        onConfigSaved();
      } else {
        setSeedResult(`Seeding error: ${res.error}`);
      }
    } catch (err: unknown) {
      setSeedResult(`Failed: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const sqlSchemaScript = `-- Run this in Supabase Dashboard -> SQL Editor:

-- 1. Create the 'emails' table
CREATE TABLE IF NOT EXISTS public.emails (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  ai_priority TEXT DEFAULT 'LOW',
  final_priority TEXT DEFAULT 'LOW',
  action_required BOOLEAN DEFAULT false,
  action TEXT,
  deadline DATE,
  summary TEXT,
  confidence NUMERIC DEFAULT 1.0,
  days_remaining INTEGER,
  validation_status TEXT DEFAULT 'VALID',
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous reads for dashboard verification
CREATE POLICY "Allow public read access"
  ON public.emails
  FOR SELECT
  USING (true);

-- 4. Allow anonymous inserts for webhook/testing
CREATE POLICY "Allow public insert for testing"
  ON public.emails
  FOR INSERT
  WITH CHECK (true);

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;`;

  const envFileExample = `# Set these in your .env.local file (or environment secrets):
NEXT_PUBLIC_SUPABASE_URL="https://xyzcompany.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Or if using Vite environment variables:
VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  const copyToClipboard = (text: string, type: 'sql' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  return (
    <div
      id="supabase-config-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="supabase-config-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] text-[#c9d1d9] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Supabase Connection & Schema</h2>
              <p className="text-xs text-gray-400">Configure credentials, table structure & realtime</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-[#21262d] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-[#30363d] bg-[#0d1117] px-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Live Credentials
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'env'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            .env Guide
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'sql'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>SQL Schema Script</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Status indicator */}
              <div
                className={`flex items-center gap-2.5 rounded-lg border p-3 text-xs ${
                  configState.isConnected
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}
              >
                {configState.isConnected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                )}
                <div>
                  <span className="font-semibold">
                    {configState.isConnected
                      ? 'Supabase client is connected and communicating with `emails` table.'
                      : 'Supabase credentials pending or invalid. You can enter them below or in .env.'}
                  </span>
                  {configState.error && (
                    <div className="mt-1 font-mono text-[11px] text-rose-300">
                      Error: {configState.error}
                    </div>
                  )}
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Supabase Project URL (VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full rounded-md border border-[#30363d] bg-[#010409] py-2.5 pl-10 pr-3 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Anon Key Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Supabase Anon / Publishable Key (VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-md border border-[#30363d] bg-[#010409] py-2.5 pl-10 pr-3 font-mono text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Use only the public <code className="text-teal-300 font-mono">anon</code> key. Never put the service_role secret key in the browser.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-md border border-[#30363d] bg-[#161b22] px-3.5 py-2 text-xs font-medium text-gray-400 hover:bg-[#21262d] hover:text-gray-200"
                >
                  Clear Overrides
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-[#21262d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-teal-500 px-5 py-2 text-xs font-semibold text-[#010409] hover:bg-teal-400"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>

              {/* Quick Seed helper */}
              <div className="mt-4 rounded-xl border border-[#30363d] bg-[#161b22] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span className="text-xs font-semibold text-white">Seed Demo Records to Supabase</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeed}
                    disabled={isSeeding || !configState.isConnected}
                    className="flex items-center gap-1.5 rounded-md bg-[#0d1117] border border-[#30363d] px-3 py-1.5 text-xs font-medium text-teal-300 hover:bg-[#21262d] disabled:opacity-40"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'Pushing records...' : 'Push 10 Test Emails'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Quickly populates your connected Supabase `emails` table with 10 structured emails (including the Dean Semester Fee example) to verify dashboard display.
                </p>
                {seedResult && (
                  <div className="text-[11px] font-mono text-teal-300 bg-teal-500/10 p-2 rounded-md border border-teal-500/20">
                    {seedResult}
                  </div>
                )}
              </div>
            </form>
          )}

          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Environment Configuration
                </span>
                <button
                  onClick={() => copyToClipboard(envFileExample, 'env')}
                  className="flex items-center gap-1.5 text-xs text-teal-400 hover:underline"
                >
                  {copiedEnv ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEnv ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto rounded-md border border-[#30363d] bg-[#010409] p-4 font-mono text-xs text-teal-300 leading-relaxed">
                {envFileExample}
              </pre>

              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-white">How to run locally:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-gray-400">
                  <li>Clone repository and run <code className="text-teal-300 font-mono">npm install</code></li>
                  <li>Copy <code className="text-teal-300 font-mono">.env.example</code> to <code className="text-teal-300 font-mono">.env.local</code></li>
                  <li>Paste your Supabase URL & Anon Key into <code className="text-teal-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-teal-300 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  <li>Run <code className="text-teal-300 font-mono">npm run dev</code> and open <code className="text-teal-300 font-mono">http://localhost:3000</code></li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Supabase Database Creation Script
                </span>
                <button
                  onClick={() => copyToClipboard(sqlSchemaScript, 'sql')}
                  className="flex items-center gap-1.5 text-xs text-teal-400 hover:underline"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="overflow-x-auto rounded-md border border-[#30363d] bg-[#010409] p-4 font-mono text-[11px] text-teal-300 leading-relaxed">
                {sqlSchemaScript}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
