import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { EmailRecord } from '@/types/email';

const LOCAL_STORAGE_KEY_URL = 'mailmind_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'mailmind_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getActiveSupabaseConfig(): {
  url: string;
  anonKey: string;
  source: 'env' | 'custom' | 'none';
} {
  // Check browser localStorage first for runtime override
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(LOCAL_STORAGE_KEY_URL)?.trim();
    const customKey = localStorage.getItem(LOCAL_STORAGE_KEY_KEY)?.trim();
    if (customUrl && customKey) {
      return { url: customUrl, anonKey: customKey, source: 'custom' };
    }
  }

  // Next.js standard or Vite env vars
  const envUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();

  const envKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem(LOCAL_STORAGE_KEY_URL, url.trim());
      localStorage.setItem(LOCAL_STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_URL);
      localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
    }
    cachedClient = null;
    currentClientKey = '';
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_URL);
    localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
    cachedClient = null;
    currentClientKey = '';
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  const clientKey = `${url}:::${anonKey}`;
  if (cachedClient && currentClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function fetchEmailsFromSupabase(): Promise<{
  data: EmailRecord[] | null;
  error: string | null;
  count: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: 'Supabase credentials not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      count: 0,
    };
  }

  try {
    const { data, error } = await client
      .from('emails')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message, count: 0 };
    }

    return {
      data: (data as EmailRecord[]) || [],
      error: null,
      count: data?.length || 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network or query error';
    return { data: null, error: message, count: 0 };
  }
}

export async function insertEmailRecord(record: Partial<EmailRecord>): Promise<{
  success: boolean;
  data?: EmailRecord;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not initialized' };
  }

  try {
    const payload = {
      ...record,
      created_at: record.created_at || new Date().toISOString(),
      received_at: record.received_at || new Date().toISOString(),
    };

    const { data, error } = await client
      .from('emails')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EmailRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Insert error';
    return { success: false, error: msg };
  }
}

export async function deleteEmailRecord(id: string | number): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await client
      .from('emails')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete error' };
  }
}

export async function seedSampleRecordsToSupabase(samples: EmailRecord[]): Promise<{
  success: boolean;
  inserted: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, inserted: 0, error: 'Supabase client not initialized' };
  }

  try {
    // Strip client-side custom string IDs if table has serial or uuid default
    const formatted = samples.map((s) => {
      const copy = { ...s };
      // If id is 'em-001', we can keep it if id is text/varchar or omit if autoincrement
      return copy;
    });

    const { data, error } = await client
      .from('emails')
      .upsert(formatted, { onConflict: 'id' })
      .select();

    if (error) {
      return { success: false, inserted: 0, error: error.message };
    }

    return { success: true, inserted: data?.length || 0 };
  } catch (err: unknown) {
    return { success: false, inserted: 0, error: err instanceof Error ? err.message : 'Seed error' };
  }
}

export function subscribeToEmailChanges(
  onInsert: (record: EmailRecord) => void,
  onUpdate: (record: EmailRecord) => void,
  onDelete: (oldRecord: { id: string | number }) => void,
  onStatusChange?: (status: string) => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('schema-db-changes-emails')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emails' },
        (payload) => {
          if (payload.new) {
            onInsert(payload.new as EmailRecord);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emails' },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new as EmailRecord);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'emails' },
        (payload) => {
          if (payload.old) {
            onDelete(payload.old as { id: string | number });
          }
        }
      )
      .subscribe((status) => {
        if (onStatusChange) {
          onStatusChange(status);
        }
      });

    return channel;
  } catch (err) {
    console.error('Error setting up Supabase realtime subscription:', err);
    return null;
  }
}
