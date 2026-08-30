import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { EmailRecord, SupabaseConfigState } from '@/types/email';

const DEFAULT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const DEFAULT_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export function getActiveSupabaseConfig(): SupabaseConfigState {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('nodify_supabase_url') || localStorage.getItem('mailmind_supabase_url');
    const customKey = localStorage.getItem('nodify_supabase_key') || localStorage.getItem('mailmind_supabase_key');
    if (customUrl && customKey) {
      return {
        url: customUrl,
        anonKey: customKey,
        source: 'custom',
        isConnected: true,
      };
    }
  }

  if (DEFAULT_URL && DEFAULT_KEY) {
    return {
      url: DEFAULT_URL,
      anonKey: DEFAULT_KEY,
      source: 'env',
      isConnected: true,
    };
  }

  return {
    url: '',
    anonKey: '',
    source: 'none',
    isConnected: false,
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getActiveSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  const keyIdentifier = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedClientKey === keyIdentifier) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedClientKey = keyIdentifier;
    return cachedClient;
  } catch (e) {
    console.error('Error instantiating Supabase client:', e);
    return null;
  }
}

export const supabase: SupabaseClient | null = getSupabaseClient();

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nodify_supabase_url', url.trim());
    localStorage.setItem('nodify_supabase_key', anonKey.trim());
  }
  cachedClient = null;
  cachedClientKey = '';
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nodify_supabase_url');
    localStorage.removeItem('nodify_supabase_key');
    localStorage.removeItem('mailmind_supabase_url');
    localStorage.removeItem('mailmind_supabase_key');
  }
  cachedClient = null;
  cachedClientKey = '';
}

export async function fetchEmailsFromSupabase(): Promise<{
  data: EmailRecord[] | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase credentials not configured' };
  }

  try {
    const { data, error } = await client
      .from('emails')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as EmailRecord[]) || [], error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to query Supabase',
    };
  }
}

export function subscribeToEmailChanges(
  onInsert?: (record: EmailRecord) => void,
  onUpdate?: (record: EmailRecord) => void,
  onDelete?: (record: { id: string | number }) => void,
  onStatusChange?: (status: string) => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  const channel = client
    .channel('emails-realtime-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'emails' },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(payload.new as EmailRecord);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'emails' },
      (payload) => {
        if (onUpdate && payload.new) {
          onUpdate(payload.new as EmailRecord);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'emails' },
      (payload) => {
        if (onDelete && payload.old) {
          onDelete({ id: (payload.old as { id: string | number }).id });
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status);
      }
    });

  return channel;
}

export async function insertEmailRecord(
  record: Partial<EmailRecord>
): Promise<{ success: boolean; data?: EmailRecord; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  try {
    const payload = {
      ...record,
      created_at: record.created_at || new Date().toISOString(),
      received_at: record.received_at || new Date().toISOString(),
    };

    const { data, error } = await client.from('emails').insert([payload]).select().single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EmailRecord };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Insert operation failed',
    };
  }
}

export async function seedSampleRecordsToSupabase(
  records: EmailRecord[]
): Promise<{ success: boolean; inserted: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, inserted: 0, error: 'Supabase client unavailable' };
  }

  try {
    const { data, error } = await client
      .from('emails')
      .upsert(records, { onConflict: 'id' })
      .select();

    if (error) {
      return { success: false, inserted: 0, error: error.message };
    }

    return { success: true, inserted: data ? data.length : records.length };
  } catch (err: unknown) {
    return {
      success: false,
      inserted: 0,
      error: err instanceof Error ? err.message : 'Seeding failed',
    };
  }
}