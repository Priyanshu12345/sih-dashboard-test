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
  const [actionFilter, setActionFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [validationFilter, setValidationFilter] = useState('all');

  // Sorting state (default: received_at descending)
  const [sortField, setSortField] = useState<SortField>('received_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract unique categories & validation statuses dynamically
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

  const getConfidencePct = (conf: number | string | undefined | null) => {
    if (conf === undefined || conf === null || conf === '') return 0;
    const val = Number(conf);
    if (isNaN(val)) return 0;
    return val <= 1 ? val * 100 : val;
  };

  const formatReceivedDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const p = String(priority).toUpperCase();
    if (p === 'HIGH') {
      return (
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
          HIGH
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
        LOW
      </span>
    );
  };

  // Render Error State
  if (error && emails.length === 0) {
    return (
      <div
        id="email-table-error-state"
        className="bg-[#0d1117] border border-rose-500/40 rounded-xl p-8 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-white">Unable to connect to Supabase</h3>
        <p className="mt-1 font-mono text-xs text-rose-300/80 max-w-xl mx-auto">
          {error}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500"
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
      className="bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col overflow-hidden"
    >
      {/* Bento Header Bar with Search & Filters */}
      <div className="px-5 py-4 border-b border-[#30363d] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-white text-base">Processed Emails</h3>
          <span className="bg-[#161b22] text-xs px-2 py-0.5 rounded-full border border-[#30363d] text-gray-400 font-mono">
            {filteredEmails.length}
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              id="table-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search emails..."
              className="bg-[#161b22] border border-[#30363d] text-xs rounded-md pl-8 pr-7 py-1.5 outline-none text-[#c9d1d9] placeholder-gray-500 focus:border-teal-500 w-44 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Priority Select */}
          <select
            id="filter-priority-select"
            value={activePriorityFilter}
            onChange={(e) => {
              if (onPriorityFilterChange) onPriorityFilterChange(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#161b22] border border-[#30363d] text-xs rounded-md px-2.5 py-1.5 outline-none text-[#c9d1d9] focus:border-teal-500"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Select */}
          <select
            id="filter-category-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#161b22] border border-[#30363d] text-xs rounded-md px-2.5 py-1.5 outline-none text-[#c9d1d9] focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            {dynamicCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Action Select */}
          <select
            id="filter-action-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#161b22] border border-[#30363d] text-xs rounded-md px-2.5 py-1.5 outline-none text-[#c9d1d9] focus:border-teal-500"
          >
            <option value="all">Action: Any</option>
            <option value="true">Action Required</option>
            <option value="false">No Action</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="bg-[#161b22] border border-[#30363d] text-gray-400 hover:text-white p-1.5 rounded-md text-xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#161b22] text-[10px] uppercase text-gray-400 sticky top-0 border-b border-[#30363d]">
            <tr>
              {/* Priority */}
              <th
                onClick={() => handleSort('final_priority')}
                className="p-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {sortField === 'final_priority' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-teal-400" /> : <ArrowDown className="h-3 w-3 text-teal-400" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </th>

              {/* Sender */}
              <th className="p-3">Sender</th>

              {/* Subject */}
              <th className="p-3 min-w-[180px]">Subject</th>

              {/* Category */}
              <th className="p-3">Category</th>

              {/* Action Required */}
              <th className="p-3 text-center">Action</th>

              {/* Deadline */}
              <th
                onClick={() => handleSort('deadline')}
                className="p-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Deadline</span>
                  {sortField === 'deadline' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-teal-400" /> : <ArrowDown className="h-3 w-3 text-teal-400" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </th>

              {/* Confidence */}
              <th
                onClick={() => handleSort('confidence')}
                className="p-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  {sortField === 'confidence' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-teal-400" /> : <ArrowDown className="h-3 w-3 text-teal-400" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </th>

              {/* Status */}
              <th className="p-3 text-center">Status</th>

              {/* Received */}
              <th
                onClick={() => handleSort('received_at')}
                className="p-3 cursor-pointer hover:text-white text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Time</span>
                  {sortField === 'received_at' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-teal-400" /> : <ArrowDown className="h-3 w-3 text-teal-400" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#30363d]">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3"><div className="h-4 w-12 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-28 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-40 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-16 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-10 mx-auto rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-20 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-16 rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-12 mx-auto rounded bg-[#161b22]" /></td>
                  <td className="p-3"><div className="h-4 w-12 ml-auto rounded bg-[#161b22]" /></td>
                </tr>
              ))
            ) : paginatedEmails.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-gray-600" />
                  <h4 className="mt-2 text-xs font-semibold text-gray-300">
                    No emails match your filter criteria
                  </h4>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 rounded-md bg-[#161b22] border border-[#30363d] px-3 py-1.5 text-xs text-teal-400 hover:bg-[#21262d]"
                    >
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedEmails.map((email) => {
                const confPct = getConfidencePct(email.confidence);

                return (
                  <tr
                    key={email.id}
                    onClick={() => onSelectEmail(email)}
                    className="hover:bg-[#21262d] transition-colors cursor-pointer"
                  >
                    {/* Priority */}
                    <td className="p-3 whitespace-nowrap">
                      {getPriorityBadge(email.final_priority)}
                    </td>

                    {/* Sender */}
                    <td className="p-3 whitespace-nowrap font-mono text-gray-300">
                      {email.sender}
                    </td>

                    {/* Subject & Summary */}
                    <td className="p-3 max-w-xs">
                      <div className="font-semibold text-white truncate">
                        {email.subject}
                      </div>
                      {email.summary && (
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">
                          {email.summary}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3 whitespace-nowrap text-gray-400">
                      {email.category || 'General'}
                    </td>

                    {/* Action Required */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {email.action_required ? (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          YES
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">NO</span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="p-3 whitespace-nowrap font-mono text-gray-300">
                      {email.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-teal-400" />
                          <span>{String(email.deadline)}</span>
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Confidence Meter */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(confPct, 100)}%` }}
                            className="bg-teal-500 h-1.5 rounded-full"
                          />
                        </div>
                        <span className="font-mono text-[10px] text-gray-400">
                          {formatConfidence(email.confidence)}
                        </span>
                      </div>
                    </td>

                    {/* Validation Status */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className="text-xs text-green-400 font-medium">
                        {String(email.validation_status || 'VALID').toUpperCase()}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="p-3 text-right whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      {formatReceivedDate(email.received_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bento Bottom Bar */}
      <div className="p-3 border-t border-[#30363d] bg-[#161b22]/30 flex flex-wrap justify-between items-center text-[10px] text-gray-500 uppercase font-bold tracking-widest gap-2">
        <span>
          Showing {(currentPage - 1) * pageSize + (sortedEmails.length > 0 ? 1 : 0)} -{' '}
          {Math.min(currentPage * pageSize, sortedEmails.length)} of {sortedEmails.length} records
        </span>

        <div className="flex items-center gap-2 normal-case font-normal">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="bg-[#161b22] border border-[#30363d] text-gray-300 hover:text-white px-2.5 py-1 rounded text-xs disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-mono text-xs text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-[#161b22] border border-[#30363d] text-gray-300 hover:text-white px-2.5 py-1 rounded text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
