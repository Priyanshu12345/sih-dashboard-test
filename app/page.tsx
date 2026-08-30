'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { OverviewView } from '@/components/OverviewView';
import { InboxView } from '@/components/InboxView';
import { PriorityView } from '@/components/PriorityView';
import { DeadlinesView } from '@/components/DeadlinesView';
import { DailyShowdownView } from '@/components/DailyShowdownView';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { SettingsView } from '@/components/SettingsView';
import { EmailDetailDrawer } from '@/components/EmailDetailDrawer';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { TestEmailModal } from '@/components/TestEmailModal';
import { ArchitectureGuideModal } from '@/components/ArchitectureGuideModal';
import { NotificationToast } from '@/components/NotificationToast';
import { EmailRecord, SupabaseConfigState } from '@/types/email';
import { INITIAL_SAMPLE_EMAILS } from '@/lib/sampleData';
import {
  getActiveSupabaseConfig,
  fetchEmailsFromSupabase,
  subscribeToEmailChanges,
} from '@/lib/supabaseClient';
import { Database, PlusCircle, Sparkles } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function DashboardPage() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Developer / Admin Mode state (hidden controls shown only when enabled)
  const [devMode, setDevMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('nodify_theme') || localStorage.getItem('mailmind_theme')) as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const savedDevMode = localStorage.getItem('nodify_dev_mode') || localStorage.getItem('mailmind_dev_mode');
    if (savedDevMode === 'true') {
      setDevMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nodify_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const toggleDevMode = () => {
    const nextDev = !devMode;
    setDevMode(nextDev);
    localStorage.setItem('nodify_dev_mode', String(nextDev));
  };

  // State
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Config & Realtime State
  const [configState, setConfigState] = useState<SupabaseConfigState>({
    url: '',
    anonKey: '',
    source: 'none',
    isConnected: false,
  });
  const [realtimeStatus, setRealtimeStatus] = useState<string>('CLOSED');

  // Modals & Panels
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    email: EmailRecord;
  } | null>(null);

  // Filters connected across sections
  const [activePriorityFilter, setActivePriorityFilter] = useState<string>('all');

  // Load configuration & data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setIsRefreshing(true);
    setFetchError(null);

    const activeConfig = getActiveSupabaseConfig();

    if (activeConfig.source === 'none' || !activeConfig.url || !activeConfig.anonKey) {
      // Sandbox preview mode with initial sample data
      setConfigState({
        url: '',
        anonKey: '',
        source: 'none',
        isConnected: false,
        error: null,
      });
      setEmails(INITIAL_SAMPLE_EMAILS);
      setLastUpdated(new Date());
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    // Try fetching from real Supabase
    const result = await fetchEmailsFromSupabase();

    if (result.error) {
      setConfigState({
        url: activeConfig.url,
        anonKey: activeConfig.anonKey,
        source: activeConfig.source,
        isConnected: false,
        error: result.error,
      });
      setFetchError(result.error);
      setEmails((prev) => (prev.length > 0 ? prev : INITIAL_SAMPLE_EMAILS));
    } else {
      setConfigState({
        url: activeConfig.url,
        anonKey: activeConfig.anonKey,
        source: activeConfig.source,
        isConnected: true,
        error: null,
      });
      setEmails(result.data || []);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    let isCancelled = false;
    const fetchInit = async () => {
      await loadData();
    };
    if (!isCancelled) {
      fetchInit();
    }
    return () => {
      isCancelled = true;
    };
  }, [loadData]);

  // Supabase Realtime Subscription Listener
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    if (configState.isConnected) {
      channel = subscribeToEmailChanges(
        (newEmail) => {
          setEmails((prev) => [newEmail, ...prev.filter((e) => e.id !== newEmail.id)]);
          setLastUpdated(new Date());
          setNotification({
            id: `notif-${Date.now()}`,
            title: 'New email processed',
            email: newEmail,
          });
        },
        (updatedEmail) => {
          setEmails((prev) =>
            prev.map((item) => (item.id === updatedEmail.id ? updatedEmail : item))
          );
          setLastUpdated(new Date());
        },
        (deletedRef) => {
          setEmails((prev) => prev.filter((item) => item.id !== deletedRef.id));
          setLastUpdated(new Date());
        },
        (status) => {
          setRealtimeStatus(status);
        }
      );
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [configState.isConnected]);

  // Inserted locally or via modal
  const handleEmailInserted = (record: EmailRecord) => {
    setEmails((prev) => [record, ...prev.filter((e) => e.id !== record.id)]);
    setLastUpdated(new Date());
    setNotification({
      id: `notif-${Date.now()}`,
      title: 'New email processed',
      email: record,
    });
  };

  const urgentCount = emails.filter((e) => Boolean(e.should_alert)).length;
  const actionCount = emails.filter((e) => Boolean(e.action_required)).length;
  const deadlinesCount = emails.filter(
    (e) => e.deadline !== null && e.deadline !== undefined && String(e.deadline).trim() !== ''
  ).length;

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        emailsCount={emails.length}
        urgentCount={urgentCount}
        actionCount={actionCount}
        deadlinesCount={deadlinesCount}
        devMode={devMode}
        onToggleDevMode={toggleDevMode}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* 2. HEADER BAR */}
        <HeaderBar
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          configState={configState}
          realtimeStatus={realtimeStatus}
          isRefreshing={isRefreshing}
          onRefresh={() => loadData(true)}
          devMode={devMode}
          onToggleDevMode={toggleDevMode}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Developer Notice Banner (shown only when devMode is enabled AND Supabase is unconnected) */}
          {devMode && !configState.isConnected && (
            <div
              id="supabase-status-banner"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:flex-row sm:items-center shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                    <span>Supabase Live Sync Config</span>
                    <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                      Dev Mode Active
                    </span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {configState.source === 'none'
                      ? 'Displaying verified sample records. Connect your Supabase URL & Key to sync with live DB.'
                      : `Connection issue: ${configState.error || 'Check credentials'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-teal-400" />
                  <span>Inject Test Email</span>
                </button>

                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 text-xs font-bold text-[#010409] shadow-md shadow-teal-500/20 hover:opacity-95"
                >
                  Configure Supabase
                </button>
              </div>
            </div>
          )}

          {/* TAB ROUTING VIEWS */}
          {activeTab === 'overview' && (
            <OverviewView
              emails={emails}
              isLoading={isLoading}
              error={fetchError}
              onRetry={() => loadData(false)}
              onSelectEmail={(email) => setSelectedEmail(email)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              activePriorityFilter={activePriorityFilter}
              onPriorityFilterChange={(p) => setActivePriorityFilter(p)}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              emails={emails}
              isLoading={isLoading}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          )}

          {activeTab === 'priority' && (
            <PriorityView
              emails={emails}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          )}

          {activeTab === 'deadlines' && (
            <DeadlinesView
              emails={emails}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          )}

          {activeTab === 'showdown' && (
            <DailyShowdownView
              emails={emails}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-main)]">Email Analytics</h1>
                  <p className="text-xs text-[var(--text-muted)]">
                    Enterprise metrics, AI confidence distributions, and processing dynamics.
                  </p>
                </div>

                {!configState.isConnected && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                    Sample / Demo Analytics
                  </span>
                )}
              </div>
              <AnalyticsCharts emails={emails} />
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              theme={theme}
              onToggleTheme={toggleTheme}
              configState={configState}
              devMode={devMode}
              onToggleDevMode={toggleDevMode}
              onOpenConfig={() => setIsConfigOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenTestModal={() => setIsTestModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* MODALS & DRAWERS */}
      <EmailDetailDrawer
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        configState={configState}
        onConfigSaved={() => loadData(false)}
      />

      <TestEmailModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onEmailInserted={handleEmailInserted}
      />

      <ArchitectureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
        onSelect={(email) => setSelectedEmail(email)}
      />
    </div>
  );
}

