'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Tag,
  CheckSquare,
  AlertTriangle,
  Flame,
  FileText,
  Code,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Share2,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface EmailDetailDrawerProps {
  email: EmailRecord | null;
  onClose: () => void;
  onDelete?: (id: string | number) => void;
}

export const EmailDetailDrawer: React.FC<EmailDetailDrawerProps> = ({
  email,
  onClose,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'json' | 'body'>('structured');
  const [copied, setCopied] = useState(false);

  if (!email) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(email, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority?: string) => {
    const p = String(priority).toUpperCase();
    if (p === 'HIGH') {
      return (
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded text-xs font-semibold">
          HIGH PRIORITY
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded text-xs font-semibold">
          MEDIUM PRIORITY
        </span>
      );
    }
    return (
      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded text-xs font-semibold">
        LOW PRIORITY
      </span>
    );
  };

  const formatConfidence = (conf: number | string | undefined | null) => {
    if (conf === undefined || conf === null || conf === '') return '0%';
    const val = Number(conf);
    if (isNaN(val)) return String(conf);
    const pct = val <= 1 ? Math.round(val * 100) : Math.round(val);
    return `${pct}%`;
  };

  const confidencePct = Number(email.confidence) <= 1 ? (Number(email.confidence) || 0) * 100 : Number(email.confidence) || 0;

  return (
    <div
      id="email-detail-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="email-detail-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col border-l border-[#30363d] bg-[#0d1117] text-[#c9d1d9] shadow-2xl transition-transform"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Email Inspection Details</h2>
              <p className="text-[11px] text-gray-500 font-mono">
                ID: {String(email.id)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-[#21262d]"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-[#21262d] hover:text-white"
              title="Close inspection panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#30363d] bg-[#0d1117] px-6">
          <button
            onClick={() => setActiveTab('structured')}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'structured'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Structured Fields
          </button>
          <button
            onClick={() => setActiveTab('body')}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'body'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Full Email Body
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'json'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Raw JSON Record</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'structured' && (
            <div className="space-y-4">
              {/* Subject & Sender Highlight */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {email.subject}
                  </h3>
                  <span className="shrink-0">
                    {getPriorityBadge(email.final_priority)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 text-xs sm:grid-cols-2 border-t border-[#30363d]">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">Sender:</span>
                    <span className="font-mono text-white select-all">{email.sender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">Category:</span>
                    <span className="rounded bg-[#0d1117] border border-[#30363d] px-2 py-0.5 font-medium text-teal-300">
                      {email.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Comparison */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Priority Transformation Audit
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">AI Model Output</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-gray-200">
                        {String(email.ai_priority || 'N/A').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">
                      Post-Transform (Final)
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-teal-300">
                        {String(email.final_priority || 'N/A').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Required & Recommended Action */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-teal-400" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                      Action Required
                    </h4>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      email.action_required
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-[#0d1117] text-gray-400 border border-[#30363d]'
                    }`}
                  >
                    {email.action_required ? 'YES - ACTION REQUIRED' : 'NO ACTION REQUIRED'}
                  </span>
                </div>

                {email.action && (
                  <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-3">
                    <span className="text-[11px] font-semibold text-teal-400 block mb-1">
                      Action:
                    </span>
                    <p className="text-xs text-gray-200">{email.action}</p>
                  </div>
                )}
              </div>

              {/* Deadline & Days Remaining */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Time Sensitivity & Deadline
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">Extracted Deadline</span>
                    <div className="mt-1 flex items-center gap-2 font-mono text-sm font-bold text-white">
                      <Calendar className="h-4 w-4 text-teal-400" />
                      <span>{String(email.deadline || 'None')}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">Days Remaining</span>
                    <div className="mt-1 flex items-center gap-2 font-mono text-sm font-bold">
                      {email.days_remaining !== undefined && email.days_remaining !== null ? (
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            email.days_remaining <= 2
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : email.days_remaining <= 7
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          }`}
                        >
                          {email.days_remaining} Days Remaining
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">No active cutoff</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence & Validation Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                    AI Confidence Score
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">
                      {formatConfidence(email.confidence)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                    <div
                      style={{ width: `${Math.min(confidencePct, 100)}%` }}
                      className="h-full bg-teal-400"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                    Validation Status
                  </span>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {String(email.validation_status || 'VALID').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              {email.summary && (
                <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-2">
                    AI Summary
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-300">
                    {email.summary}
                  </p>
                </div>
              )}

              {/* Timestamps audit */}
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-xs text-gray-400 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>received_at:</span>
                  <span className="text-gray-200">{String(email.received_at || 'N/A')}</span>
                </div>
                <div className="flex justify-between">
                  <span>created_at:</span>
                  <span className="text-gray-200">{String(email.created_at || 'N/A')}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Original Email Message Content</span>
                <span className="font-mono">{email.body?.length || 0} characters</span>
              </div>
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-xs leading-relaxed text-gray-200 whitespace-pre-wrap font-sans">
                {email.body || 'No email body stored.'}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Supabase Stored Document (`emails`)</span>
                <button
                  onClick={handleCopyJson}
                  className="text-teal-400 hover:underline text-xs flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy JSON
                </button>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-[#30363d] bg-[#010409] p-4 font-mono text-[11px] leading-relaxed text-teal-300">
                {JSON.stringify(email, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-6 py-3">
          <div className="text-xs text-gray-500 font-mono">
            Record ID: {String(email.id)}
          </div>
          <button
            onClick={onClose}
            className="rounded-md bg-[#0d1117] border border-[#30363d] px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-[#21262d]"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
