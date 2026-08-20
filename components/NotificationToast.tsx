'use client';

import React from 'react';
import { Sparkles, Mail, ArrowRight, X } from 'lucide-react';
import { EmailRecord } from '@/types/email';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    email: EmailRecord;
  } | null;
  onDismiss: () => void;
  onSelect: (email: EmailRecord) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onSelect,
}) => {
  if (!notification) return null;

  return (
    <div
      id="realtime-notification-toast"
      className="fixed bottom-5 right-5 z-50 flex max-w-md items-start gap-3 rounded-xl border border-teal-500/40 bg-[#0d1117] p-4 shadow-2xl backdrop-blur-xs animate-in slide-in-from-bottom-5 text-[#c9d1d9]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
            {notification.title}
          </span>
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h4 className="mt-0.5 text-xs font-bold text-white truncate">
          {notification.email.subject}
        </h4>

        <p className="text-[11px] text-gray-400 truncate">
          From: {notification.email.sender}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              String(notification.email.final_priority).toUpperCase() === 'HIGH'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-[#161b22] text-gray-300 border border-[#30363d]'
            }`}
          >
            {String(notification.email.final_priority || 'LOW').toUpperCase()} PRIORITY
          </span>

          <button
            onClick={() => {
              onSelect(notification.email);
              onDismiss();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:underline"
          >
            <span>Inspect</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
