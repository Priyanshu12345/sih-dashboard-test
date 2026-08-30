'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Inbox,
  Filter,
  AlertTriangle,
  Zap,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Bell,
  Clock,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface InboxViewProps {
  emails: EmailRecord[];
  isLoading: boolean;
  onSelectEmail: (email: EmailRecord) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  isLoading,
  onSelectEmail,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'urgent' | 'action' | 'high' | 'medium' | 'low' | 'deadline'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      // Search term filter across Sender, Subject, Summary
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSender = (item.sender || '').toLowerCase().includes(query);
        const matchesSubject = (item.subject || '').toLowerCase().includes(query);
        const matchesSummary = (item.summary || '').toLowerCase().includes(query);
        const matchesBody = (item.body || '').toLowerCase().includes(query);
        if (!matchesSender && !matchesSubject && !matchesSummary && !matchesBody) {
          return false;
        }
      }

      // Filter tabs
      if (activeFilter === 'urgent') {
        return Boolean(item.should_alert);
      }
      if (activeFilter === 'action') {
        return Boolean(item.action_required);
      }
      if (activeFilter === 'high') {
        return String(item.final_priority).toUpperCase() === 'HIGH';
      }
      if (activeFilter === 'medium') {
        return String(item.final_priority).toUpperCase() === 'MEDIUM';
      }
      if (activeFilter === 'low') {
        return String(item.final_priority).toUpperCase() === 'LOW';
      }
      if (activeFilter === 'deadline') {
        return item.deadline !== null && item.deadline !== undefined && String(item.deadline).trim() !== '';
      }

      return true;
    });
  }, [emails, activeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredEmails.length / pageSize) || 1;
  const paginatedEmails = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmails.slice(start, start + pageSize);
  }, [filteredEmails, currentPage, pageSize]);

  const filterTabs = [
    { id: 'all', label: 'All Emails', count: emails.length },
    { id: 'urgent', label: 'Urgent', count: emails.filter((e) => e.should_alert).length },
    { id: 'action', label: 'Action Required', count: emails.filter((e) => e.action_required).length },
    { id: 'high', label: 'High Priority', count: emails.filter((e) => String(e.final_priority).toUpperCase() === 'HIGH').length },
    { id: 'medium', label: 'Medium', count: emails.filter((e) => String(e.final_priority).toUpperCase() === 'MEDIUM').length },
    { id: 'low', label: 'Low', count: emails.filter((e) => String(e.final_priority).toUpperCase() === 'LOW').length },
    { id: 'deadline', label: 'With Deadline', count: emails.filter((e) => e.deadline).length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6 text-purple-500" />
            <span>Smart Inbox</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            All emails classified, summarized, and organized by Nodify AI.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search sender, subject, summary..."
            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as typeof activeFilter);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Emails Card List */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-24 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] animate-pulse"
            />
          ))
        ) : paginatedEmails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-12 text-center bg-[var(--bg-card)]">
            <Inbox className="mx-auto h-10 w-10 text-[var(--text-subtle)]" />
            <h3 className="mt-3 text-sm font-bold text-[var(--text-main)]">No emails match your criteria</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Try adjusting your search or active filter.</p>
          </div>
        ) : (
          paginatedEmails.map((email) => {
            const isUrgent = Boolean(email.should_alert);
            const isHigh = String(email.final_priority).toUpperCase() === 'HIGH';

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`group relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] ${
                  isUrgent
                    ? 'border-rose-500/50 shadow-md shadow-rose-500/5'
                    : isHigh
                    ? 'border-amber-500/30'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs text-white ${
                        isUrgent
                          ? 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-md shadow-rose-500/20'
                          : isHigh
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                          : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                      }`}
                    >
                      {(email.sender || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs text-[var(--text-main)] truncate max-w-[200px]">
                          {email.sender}
                        </span>

                        {isUrgent && (
                          <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold text-rose-500 flex items-center gap-1">
                            <Bell className="h-3 w-3 animate-bounce" />
                            URGENT ALERT
                          </span>
                        )}

                        <span className="rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                          {email.category || 'General'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-purple-400 transition-colors mt-0.5 truncate">
                        {email.subject}
                      </h3>

                      {email.summary && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-1">
                          {email.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action & Deadline Meta */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
                    {email.deadline && (
                      <div className="text-left sm:text-right font-mono text-[11px]">
                        <span className="text-[var(--text-subtle)] block text-[10px] uppercase font-bold">Deadline</span>
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {String(email.deadline)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                          isHigh
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : String(email.final_priority).toUpperCase() === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {String(email.final_priority).toUpperCase()}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmail(email);
                        }}
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-2 text-[var(--text-muted)] hover:bg-purple-600 hover:text-white transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-4 text-xs text-[var(--text-muted)]">
          <div>
            Showing <span className="font-bold text-[var(--text-main)]">{paginatedEmails.length}</span> of{' '}
            <span className="font-bold text-[var(--text-main)]">{filteredEmails.length}</span> emails
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 font-semibold text-[var(--text-main)] disabled:opacity-40 hover:bg-[var(--bg-card-hover)]"
            >
              Previous
            </button>
            <span className="font-mono font-bold text-[var(--text-main)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 font-semibold text-[var(--text-main)] disabled:opacity-40 hover:bg-[var(--bg-card-hover)]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
