'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import type { User } from '@supabase/supabase-js';

export default function GeneratePage() {
  // User & loading state
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Form / network state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch the current Supabase user on mount
  useEffect(() => {
    (async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      setUser(supabaseUser);
      setIsUserLoaded(true);
    })();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!isUserLoaded) return; // should not happen – button is disabled

    if (!user?.id) {
      setMessage('Please log in to generate workflows.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const workflow_name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const nodes = String(formData.get('nodes') || '').trim();
    const base_url = String(formData.get('baseUrl') || '').trim();

    if (!workflow_name || !description || !base_url) {
      setMessage('Please fill out all required fields.');
      return;
    }

    // Build payload per spec
    const payload = {
      workflow_name,
      description,
      nodes,
      base_url,
      user_id: user.id,
      email: user.email,
      api_keys: {
        openrouter: (user.user_metadata as any)?.openrouter_key ?? null,
        anthropic: (user.user_metadata as any)?.anthropic_key ?? null,
      },
    };

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setMessage('Workflow request sent! It will appear in your list soon.');
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong while sending the request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Generate Workflow</h1>
      {message && (
        <p className="mb-6 text-sm text-center text-muted-foreground">{message}</p>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2">Workflow Name *</label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-transparent border border-border rounded-2xl px-4 py-2"
          />
        </div>
        <div>
          <label className="block mb-2">Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full bg-transparent border border-border rounded-2xl px-4 py-2"
          />
        </div>
        <div>
          <label className="block mb-2">Suggested Nodes / Services</label>
          <input
            type="text"
            name="nodes"
            placeholder="e.g. Slack, Google Sheets"
            className="w-full bg-transparent border border-border rounded-2xl px-4 py-2"
          />
        </div>
        <div>
          <label className="block mb-2">n8n Base URL *</label>
          <input
            type="url"
            name="baseUrl"
            defaultValue="https://n8n.ximus.io"
            required
            className="w-full bg-transparent border border-border rounded-2xl px-4 py-2"
          />
        </div>
        <Button type="submit" disabled={!isUserLoaded || isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </div>
  );
} 