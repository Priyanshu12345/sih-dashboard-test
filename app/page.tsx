'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { KpiCards } from '@/components/KpiCards';
import { PriorityOverview } from '@/components/PriorityOverview';
import { UpcomingDeadlines } from '@/components/UpcomingDeadlines';
import { EmailTable } from '@/components/EmailTable';
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
import { Database, Sparkles, AlertCircle, Info, PlusCircle } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function DashboardPage() {
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
      // Keep existing data or load samples if empty
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
          // On Insert
          setEmails((prev) => [newEmail, ...prev.filter((e) => e.id !== newEmail.id)]);
          setLastUpdated(new Date());
          // Show toast
          setNotification({
            id: `notif-${Date.now()}`,
            title: 'New email processed',
            email: newEmail,
          });
        },
        (updatedEmail) => {
          // On Update
          setEmails((prev) =>
            prev.map((item) => (item.id === updatedEmail.id ? updatedEmail : item))
          );
          setLastUpdated(new Date());
        },
        (deletedRef) => {
          // On Delete
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

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] antialiased selection:bg-teal-500 selection:text-white font-sans">
      {/* 1. TOP NAVIGATION */}
      <Navbar
        configState={configState}
        realtimeStatus={realtimeStatus}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenHelp={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Unconfigured / Preview Notice Banner */}
        {!configState.isConnected && (
          <div
            id="supabase-status-banner"
            className="flex flex-col justify-between gap-3 rounded-xl border border-[#30363d] bg-[#0d1117] p-4 sm:flex-row sm:items-center shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Supabase Live Sync Ready</span>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] text-teal-300 font-semibold">
                    Test Mode Active
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {configState.source === 'none'
                    ? 'Displaying verified test records. Connect your Supabase credentials in .env.local or click Configure to view your live table.'
                    : `Connection issue: ${configState.error || 'Check URL and Anon Key'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-[#21262d] flex items-center gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5 text-teal-400" />
                <span>Inject Test Email</span>
              </button>

              <button
                onClick={() => setIsConfigOpen(true)}
                className="rounded-md bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-[#010409] transition-all hover:bg-teal-400 shadow-xs"
              >
                Configure Supabase
              </button>
            </div>
          </div>
        )}

        {/* 2. DASHBOARD HEADER & TELEMETRY */}
        <DashboardHeader
          totalRecords={emails.length}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => loadData(true)}
          configState={configState}
          realtimeStatus={realtimeStatus}
          onOpenTestModal={() => setIsTestModalOpen(true)}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        {/* 3. KPI CARDS */}
        <KpiCards emails={emails} isLoading={isLoading} />

        {/* Bento Grid layout for Analytics & Data */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Email Table (8 cols on lg) */}
          <div className="lg:col-span-8">
            <EmailTable
              emails={emails}
              isLoading={isLoading}
              error={fetchError}
              onRetry={() => loadData(false)}
              onSelectEmail={(email) => setSelectedEmail(email)}
              activePriorityFilter={activePriorityFilter}
              onPriorityFilterChange={(p) => setActivePriorityFilter(p)}
            />
          </div>

          {/* Right Column: Priority Overview & Upcoming Deadlines (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <PriorityOverview
              emails={emails}
              onSelectPriorityFilter={(p) => setActivePriorityFilter(p)}
              activePriorityFilter={activePriorityFilter}
            />

            <UpcomingDeadlines
              emails={emails}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />
          </div>
        </div>
      </main>

      {/* 6. EMAIL DETAIL PANEL (RIGHT DRAWER) */}
      <EmailDetailDrawer
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />

      {/* Supabase Configuration & SQL Schema Modal */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        configState={configState}
        onConfigSaved={() => loadData(false)}
      />

      {/* Inject Test Email Modal */}
      <TestEmailModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onEmailInserted={handleEmailInserted}
      />

      {/* Architecture & Pipeline Inspection Modal */}
      <ArchitectureGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Realtime Toast Notification */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
        onSelect={(email) => setSelectedEmail(email)}
      />
    </div>
  );
}
