'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Inbox,
  Calendar,
  AlertTriangle,
  RotateCcw,
  User,
} from 'lucide-react';
import {
  EmailRecord,
  SortField,
  SortDirection,
  FilterState,
  PriorityLevel,
} from '@/types/email';

interface EmailTableProps {
  emails: EmailRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectEmail: (email: EmailRecord) => void;
  activePriorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
}

export const EmailTable: React.FC<EmailTableProps> = ({
  emails,
  isLoading,
  error,
  onRetry,
  onSelectEmail,
  activePriorityFilter = 'all',
  onPriorityFilterChange,
}) => {
  // Local Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');

  // Sorting state (default: received_at descending)
  const [sortField, setSortField] = useState<SortField>('received_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract unique categories dynamically
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    emails.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [emails]);

  const dynamicStatuses = useMemo(() => {
    const set = new Set<string>();
    emails.forEach((e) => {
      if (e.validation_status) set.add(String(e.validation_status).toUpperCase());
    });
    return Array.from(set).sort();
  }, [emails]);

  // Handle Sort Column Click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter & Search Logic
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      // 1. Search in sender, subject, body, summary
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSender = (item.sender || '').toLowerCase().includes(query);
        const matchesSubject = (item.subject || '').toLowerCase().includes(query);
        const matchesBody = (item.body || '').toLowerCase().includes(query);
        const matchesSummary = (item.summary || '').toLowerCase().includes(query);

        if (!matchesSender && !matchesSubject && !matchesBody && !matchesSummary) {
          return false;
        }
      }

      // 2. Priority Filter
      if (activePriorityFilter !== 'all') {
        if (
          String(item.final_priority).toUpperCase() !==
          activePriorityFilter.toUpperCase()
        ) {
          return false;
        }
      }

      // 3. Category Filter
      if (categoryFilter !== 'all') {
        if (
          (item.category || '').toLowerCase() !== categoryFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // 4. Action Required Filter
      if (actionFilter !== 'all') {
        const isActionTrue = Boolean(item.action_required);
        if (actionFilter === 'true' && !isActionTrue) return false;
        if (actionFilter === 'false' && isActionTrue) return false;
      }

      // 5. Validation Status Filter
      if (validationFilter !== 'all') {
        if (
          String(item.validation_status).toUpperCase() !==
          validationFilter.toUpperCase()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    emails,
    searchTerm,
    activePriorityFilter,
    categoryFilter,
    actionFilter,
    validationFilter,
  ]);

  // Sort Logic
  const sortedEmails = useMemo(() => {
    const priorityWeight: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return [...filteredEmails].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'received_at') {
        const timeA = a.received_at ? new Date(a.received_at).getTime() : 0;
        const timeB = b.received_at ? new Date(b.received_at).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === 'created_at') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === 'final_priority') {
        const weightA = priorityWeight[String(a.final_priority).toUpperCase()] || 0;
        const weightB = priorityWeight[String(b.final_priority).toUpperCase()] || 0;
        comparison = weightA - weightB;
      } else if (sortField === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
        comparison = dateA - dateB;
      } else if (sortField === 'confidence') {
        const confA = Number(a.confidence) || 0;
        const confB = Number(b.confidence) || 0;
        comparison = confA - confB;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredEmails, sortField, sortDirection]);

  // Paginated Emails
  const totalPages = Math.ceil(sortedEmails.length / pageSize) || 1;
  const paginatedEmails = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmails.slice(start, start + pageSize);
  }, [sortedEmails, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    if (onPriorityFilterChange) onPriorityFilterChange('all');
    setCategoryFilter('all');
    setActionFilter('all');
    setValidationFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    activePriorityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    actionFilter !== 'all' ||
    validationFilter !== 'all';

  // Format Helpers
  const formatConfidence = (conf: number | string | undefined | null) => {
    if (conf === undefined || conf === null || conf === '') return '0%';
    const val = Number(conf);
    if (isNaN(val)) return String(conf);
    const pct = val <= 1 ? Math.round(val * 100) : Math.round(val);
    return `${pct}%`;
  };

  const formatReceivedDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const p = String(priority).toUpperCase();
    if (p === 'HIGH' || p === 'URGENT') {
      return (
        <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
          HIGH
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="rounded-full bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
        LOW
      </span>
    );
  };

  // Render Error State
  if (error && emails.length === 0) {
    return (
      <div
        id="email-table-error-state"
        className="rounded-2xl border border-rose-500/30 bg-[var(--bg-card)] p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-[var(--text-main)]">Unable to connect to Supabase</h3>
        <p className="mt-1 font-mono text-xs text-rose-400 max-w-xl mx-auto">
          {error}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 shadow-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="processed-emails-bento-card"
      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col overflow-hidden transition-colors"
    >
      {/* Header Bar with Title, Search & Filters (Reference layout: Customer Order table) */}
      <div className="px-6 py-5 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-[var(--text-main)] text-base">Recent Emails</h3>
            <span className="rounded-full bg-[var(--bg-main)] text-xs px-2.5 py-0.5 border border-[var(--border-color)] text-[var(--text-muted)] font-mono font-bold">
              {filteredEmails.length}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Live activity log with AI classification</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="table-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search sender, subject..."
              className="w-48 sm:w-60 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:border-teal-500 outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] outline-none cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <option value="all">All Categories</option>
            {dynamicCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border-color)] bg-[var(--bg-main)]/50 text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Profile / Sender</th>
              <th className="px-6 py-3.5">Subject & Category</th>
              <th className="px-6 py-3.5 cursor-pointer hover:text-[var(--text-main)]" onClick={() => handleSort('received_at')}>
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3.5 cursor-pointer hover:text-[var(--text-main)]" onClick={() => handleSort('final_priority')}>
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-[var(--border-color)]" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-48 rounded bg-[var(--border-color)]" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-[var(--border-color)]" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-[var(--border-color)]" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 w-12 rounded bg-[var(--border-color)] ml-auto" /></td>
                </tr>
              ))
            ) : paginatedEmails.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-main)] mb-3">
                    <Inbox className="h-6 w-6 text-[var(--text-subtle)]" />
                  </div>
                  <p className="font-bold text-sm text-[var(--text-main)]">No records found</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting search or priority filters</p>
                </td>
              </tr>
            ) : (
              paginatedEmails.map((item) => {
                const initials = (item.sender || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectEmail(item)}
                    className="group cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
                  >
                    {/* Profile / Sender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-main)] group-hover:text-blue-500 transition-colors">
                            {item.sender || 'Unknown Sender'}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono truncate max-w-[140px]">
                            {item.sender ? `${item.sender.toLowerCase().replace(/\s+/g, '.')}@org` : 'email@domain'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Category */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-[var(--text-main)] truncate">
                        {item.subject || 'No Subject'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="rounded bg-[var(--bg-main)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] border border-[var(--border-color)]">
                          {item.category || 'General'}
                        </span>
                        {item.action_required && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Action Req.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--text-muted)] font-medium">
                      {formatReceivedDate(item.received_at)}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(item.final_priority || item.ai_priority)}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEmail(item);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <span>View</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-main)]/30 text-xs text-[var(--text-muted)]">
        <div>
          Showing <span className="font-bold text-[var(--text-main)]">{paginatedEmails.length}</span> of{' '}
          <span className="font-bold text-[var(--text-main)]">{sortedEmails.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 font-semibold text-[var(--text-main)] disabled:opacity-40 hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-[var(--text-main)] font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 font-semibold text-[var(--text-main)] disabled:opacity-40 hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
