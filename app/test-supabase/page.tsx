'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabasePage() {
    const [emails, setEmails] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmails() {
            try {
                if (!supabase) {
                    setError('Supabase client not configured or missing credentials');
                    setLoading(false);
                    return;
                }
                const { data, error } = await supabase
                    .from('emails')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    setError(error.message);
                } else {
                    setEmails(data || []);
                }
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        }

        fetchEmails();
    }, []);

    if (loading) {
        return <main style={{ padding: 40 }}>Loading emails...</main>;
    }

    if (error) {
        return (
            <main style={{ padding: 40 }}>
                <h1>❌ Supabase Error</h1>
                <p>{error}</p>
            </main>
        );
    }

    return (
        <main style={{ padding: 40 }}>
            <h1>✅ Supabase Connected</h1>
            <p>Total emails: {emails.length}</p>

            {emails.map((email) => (
                <div
                    key={email.id}
                    style={{
                        border: '1px solid #ccc',
                        padding: 16,
                        marginTop: 16,
                        borderRadius: 8,
                    }}
                >
                    <h3>{email.subject}</h3>
                    <p>Sender: {email.sender}</p>
                    <p>Priority: {email.final_priority}</p>
                    <p>Deadline: {email.deadline || 'None'}</p>
                    <p>Status: {email.validation_status}</p>
                </div>
            ))}
        </main>
    );
}