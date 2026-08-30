export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ValidationStatus = 'VALID' | 'INVALID' | 'PENDING' | 'WARNING';

export interface EmailRecord {
  id: string | number;
  message_id?: string | null;
  thread_id?: string | null;
  sender: string;
  subject: string;
  body: string;
  category: string;
  ai_priority: PriorityLevel | string;
  final_priority: PriorityLevel | string;
  action_required: boolean;
  action?: string | null;
  deadline?: string | null;
  summary?: string | null;
  confidence: number;
  days_remaining?: number | null;
  deadline_status?: string | null;
  should_alert?: boolean | null;
  validation_status: ValidationStatus | string;
  received_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export type SortField = 'received_at' | 'created_at' | 'final_priority' | 'deadline' | 'confidence';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  search: string;
  priority: string;
  category: string;
  actionRequired: string; // 'all' | 'true' | 'false'
  validationStatus: string;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  source: 'env' | 'custom' | 'none';
  isConnected: boolean;
  error?: string | null;
}

