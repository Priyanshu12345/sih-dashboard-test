'use client';

import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Wand2,
} from 'lucide-react';
import { EmailRecord } from '@/types/email';
import { insertEmailRecord } from '@/lib/supabaseClient';

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailInserted: (record: EmailRecord) => void;
}

const TEMPLATES: Array<{
  name: string;
  data: Partial<EmailRecord>;
}> = [
  {
    name: 'Dean Semester Fee Deadline (User Example)',
    data: {
      sender: 'dean@college.edu',
      subject: 'Semester Fee Deadline',
      body: 'The last date for semester fee payment is August 25.',
      category: 'Education',
      ai_priority: 'HIGH',
      final_priority: 'HIGH',
      action_required: true,
      action: 'Pay the semester fee',
      deadline: '2026-08-25',
      summary: 'The deadline for semester fee payment is August 25, 2026.',
      confidence: 1.0,
      days_remaining: 5,
      validation_status: 'VALID',
    },
  },
  {
    name: 'Emergency Server Database Maintenance',
    data: {
      sender: 'ops@cloud-platform.com',
      subject: 'URGENT: Database Maintenance & Failover Window',
      body: 'Production PostgreSQL cluster 04 will undergo emergency patch updates tonight at 23:00 UTC. Expect up to 2 minutes of transient read/write latency.',
      category: 'Operations',
      ai_priority: 'HIGH',
      final_priority: 'HIGH',
      action_required: true,
      action: 'Notify on-call engineers and enable maintenance mode in proxy',
      deadline: '2026-08-21',
      summary: 'Urgent database failover window tonight at 23:00 UTC.',
      confidence: 0.97,
      days_remaining: 1,
      validation_status: 'VALID',
    },
  },
  {
    name: 'Conference Travel Grant Approval',
    data: {
      sender: 'grants@research-foundation.org',
      subject: 'Travel Grant Approved: ACM SIGMOD 2026',
      body: 'We are pleased to inform you that your student travel grant of $800 for ACM SIGMOD 2026 has been approved. Please submit travel receipts and expense sheet by September 5.',
      category: 'Research',
      ai_priority: 'MEDIUM',
      final_priority: 'MEDIUM',
      action_required: true,
      action: 'Book flights and upload expense receipts',
      deadline: '2026-09-05',
      summary: 'Travel grant of $800 approved. Submit receipts by Sep 5.',
      confidence: 0.95,
      days_remaining: 16,
      validation_status: 'VALID',
    },
  },
  {
    name: 'Weekly Engineering Changelog',
    data: {
      sender: 'newsletter@internal-eng.io',
      subject: 'Weekly Platform Digest #48',
      body: 'Updates this week: Migrated email processing pipeline to modern worker queue, reduced webhook p99 latency to 120ms, added Supabase Realtime synchronization.',
      category: 'Newsletter',
      ai_priority: 'LOW',
      final_priority: 'LOW',
      action_required: false,
      action: null,
      deadline: null,
      summary: 'Weekly engineering platform release notes.',
      confidence: 0.89,
      days_remaining: null,
      validation_status: 'VALID',
    },
  },
];

export const TestEmailModal: React.FC<TestEmailModalProps> = ({
  isOpen,
  onClose,
  onEmailInserted,
}) => {
  const [formData, setFormData] = useState<Partial<EmailRecord>>({
    sender: 'dean@college.edu',
    subject: 'Semester Fee Deadline',
    body: 'The last date for semester fee payment is August 25.',
    category: 'Education',
    ai_priority: 'HIGH',
    final_priority: 'HIGH',
    action_required: true,
    action: 'Pay the semester fee',
    deadline: '2026-08-25',
    summary: 'The deadline for semester fee payment is August 25, 2026.',
    confidence: 1.0,
    days_remaining: 5,
    validation_status: 'VALID',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setFormData({ ...tmpl.data });
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const nowIso = new Date().toISOString();
      const payload: Partial<EmailRecord> = {
        ...formData,
        received_at: nowIso,
        created_at: nowIso,
        confidence: Number(formData.confidence) || 1.0,
        days_remaining: formData.days_remaining ? Number(formData.days_remaining) : null,
      };

      const result = await insertEmailRecord(payload);

      if (result.success && result.data) {
        setStatusMessage({
          type: 'success',
          text: `Record successfully inserted into Supabase 'emails' table! (ID: ${result.data.id})`,
        });
        onEmailInserted(result.data);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Fallback for demo mode: create client-side mock ID if Supabase is offline
        const localMock: EmailRecord = {
          id: `test-${Date.now()}`,
          sender: formData.sender || 'test@example.com',
          subject: formData.subject || 'Test Subject',
          body: formData.body || '',
          category: formData.category || 'General',
          ai_priority: formData.ai_priority || 'LOW',
          final_priority: formData.final_priority || 'LOW',
          action_required: Boolean(formData.action_required),
          action: formData.action || null,
          deadline: formData.deadline || null,
          summary: formData.summary || null,
          confidence: Number(formData.confidence) || 1.0,
          days_remaining: formData.days_remaining ? Number(formData.days_remaining) : null,
          validation_status: formData.validation_status || 'VALID',
          received_at: nowIso,
          created_at: nowIso,
        };

        onEmailInserted(localMock);
        setStatusMessage({
          type: 'success',
          text: `Injected into local dashboard state (${result.error || 'Supabase offline/preview mode'}).`,
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Submission error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="test-email-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="test-email-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#30363d] bg-[#0d1117] text-[#c9d1d9] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Inject Test Email Record</h2>
              <p className="text-xs text-gray-400">
                Simulate an incoming webhook & AI processing workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-[#21262d] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Quick Preset Templates */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
              <Wand2 className="h-3.5 w-3.5 text-teal-400" />
              <span>Quick Test Presets</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-lg border border-[#30363d] bg-[#161b22] p-2.5 text-left transition-all hover:border-teal-500/40 hover:bg-[#21262d]"
                >
                  <div className="text-xs font-semibold text-white">{tmpl.name}</div>
                  <div className="mt-0.5 text-[11px] text-gray-400 truncate">
                    {tmpl.data.subject}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sender & Subject */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Sender</label>
                <input
                  type="email"
                  required
                  value={formData.sender || ''}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  placeholder="sender@domain.com"
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject"
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Body */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Full Email Body</label>
              <textarea
                required
                rows={3}
                value={formData.body || ''}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="The email text payload..."
                className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Category, AI Priority, Final Priority */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Education, Finance..."
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">AI Priority</label>
                <select
                  value={formData.ai_priority || 'LOW'}
                  onChange={(e) => setFormData({ ...formData, ai_priority: e.target.value })}
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Final Priority</label>
                <select
                  value={formData.final_priority || 'LOW'}
                  onChange={(e) => setFormData({ ...formData, final_priority: e.target.value })}
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            {/* Action Required, Action Text, Deadline */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Action Required?</label>
                <select
                  value={formData.action_required ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, action_required: e.target.value === 'true' })}
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-300">Action Item (if any)</label>
                <input
                  type="text"
                  value={formData.action || ''}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="e.g., Pay fee, renew certificate..."
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Deadline & Days Remaining & Confidence */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Deadline (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Days Remaining</label>
                <input
                  type="number"
                  value={formData.days_remaining !== undefined && formData.days_remaining !== null ? formData.days_remaining : ''}
                  onChange={(e) => setFormData({ ...formData, days_remaining: e.target.value === '' ? null : Number(e.target.value) })}
                  placeholder="5"
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Confidence (0 - 1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.confidence ?? 1}
                  onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
                  className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">AI Summary</label>
              <input
                type="text"
                value={formData.summary || ''}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary extracted by model"
                className="w-full rounded-md border border-[#30363d] bg-[#010409] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                  statusMessage.type === 'success'
                    ? 'border border-teal-500/30 bg-teal-500/10 text-teal-300'
                    : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-[#21262d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-md bg-teal-500 px-5 py-2 text-xs font-semibold text-[#010409] hover:bg-teal-400 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Inserting...' : 'Insert to Supabase'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
