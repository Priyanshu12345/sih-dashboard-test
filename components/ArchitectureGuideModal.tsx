'use client';

import React from 'react';
import {
  X,
  Cpu,
  ArrowRight,
  Database,
  Webhook,
  Code2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="architecture-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="architecture-guide-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#30363d] bg-[#0d1117] text-[#c9d1d9] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Email Intelligence Pipeline Architecture
              </h2>
              <p className="text-xs text-gray-400">
                End-to-end data flow & processing verification
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step Flow Banner */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3">
              Workflow Sequence
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 text-center">
              <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 mb-1.5">
                  <Webhook className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold text-white">1. Webhook</div>
                <div className="text-[10px] text-gray-400">Raw Email Ingestion</div>
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-400 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold text-white">2. AI Model</div>
                <div className="text-[10px] text-gray-400">Classify & Extract</div>
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 mb-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold text-white">3. JS Validation</div>
                <div className="text-[10px] text-gray-400">Schema & Integrity</div>
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 mb-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold text-white">4. Transform</div>
                <div className="text-[10px] text-gray-400">Rules & Days Calc</div>
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#010409] p-3">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/10 text-teal-400 mb-1.5">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs font-bold text-white">5. Supabase</div>
                <div className="text-[10px] text-gray-400">Store in `emails`</div>
              </div>
            </div>
          </div>

          {/* Supabase Schema Checklist */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">
              Expected Supabase `emails` Fields
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 font-mono">
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">id</span> (text/uuid)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">sender</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">subject</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">body</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">category</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">ai_priority</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">final_priority</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">action_required</span> (bool)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">action</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">deadline</span> (date)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">summary</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">confidence</span> (num)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">days_remaining</span> (int)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">validation_status</span> (text)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">received_at</span> (time)
              </div>
              <div className="rounded-md bg-[#010409] p-2 text-gray-300 border border-[#30363d]">
                <span className="text-teal-400">created_at</span> (time)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
