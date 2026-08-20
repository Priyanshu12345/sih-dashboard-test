'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { SupabaseConfigState } from '@/types/email';

interface DashboardHeaderProps {
  totalRecords: number;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  configState: SupabaseConfigState;
  realtimeStatus: string;
  onOpenTestModal: () => void;
  onOpenConfig: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalRecords,
  lastUpdated,
  isRefreshing,
  onRefresh,
  configState,
  realtimeStatus,
  onOpenTestModal,
  onOpenConfig,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentDateTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header id="dashboard-header" className="pt-2 pb-2 shrink-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Email Intelligence Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Monitor, classify and prioritize incoming emails in real-time.
          </p>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <p className="text-xs font-mono text-gray-500">
            LAST UPDATED: {lastUpdated ? lastUpdated.toISOString().replace('T', ' ').substring(0, 19) : (currentDateTime || 'SYNCING')}
          </p>
          <div className="flex items-center gap-1.5 justify-start sm:justify-end">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
            <p className="text-xs text-teal-500 font-medium">
              Backend Status: {configState.isConnected ? 'Active & Synced' : 'Active (Test Mode)'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
