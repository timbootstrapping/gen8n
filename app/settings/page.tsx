'use client';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { loading, user } = useProtectedRoute();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const [openrouterKey, setOpenrouterKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [apiMsg, setApiMsg] = useState('');
  const [plan, setPlan] = useState('-');
  const [usage, setUsage] = useState(0);

  // load api keys / plan / usage
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('users')
        .select('api_keys, plan, usage_count')
        .eq('id', user.id)
        .single();
      if (data) {
        setPlan(data.plan ?? '-');
        setUsage(data.usage_count ?? 0);
        setOpenrouterKey(data.api_keys?.openrouter ?? '');
        setAnthropicKey(data.api_keys?.anthropic ?? '');
      }
    };
    fetch();
  }, [user]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPwMsg('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwMsg(error ? error.message : 'Password updated!');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveKeys = async () => {
    const { error } = await supabase
      .from('users')
      .update({ api_keys: { openrouter: openrouterKey, anthropic: anthropicKey } })
      .eq('id', user!.id);
    setApiMsg(error ? error.message : 'API keys saved');
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="space-y-8 py-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p>Email: {user?.email}</p>
        {/* Future name fields */}
      </section>

      {/* Change password */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-[#1a1a1d] border border-border rounded-xl px-3 py-2"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-[#1a1a1d] border border-border rounded-xl px-3 py-2"
        />
        {pwMsg && <p className="text-sm text-highlight">{pwMsg}</p>}
        <Button onClick={handlePasswordChange}>Update Password</Button>
      </section>

      {/* API keys */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <input
          type="text"
          placeholder="OpenRouter Key"
          value={openrouterKey}
          onChange={(e) => setOpenrouterKey(e.target.value)}
          className="w-full bg-[#1a1a1d] border border-border rounded-xl px-3 py-2"
        />
        <input
          type="text"
          placeholder="Claude/Anthropic Key"
          value={anthropicKey}
          onChange={(e) => setAnthropicKey(e.target.value)}
          className="w-full bg-[#1a1a1d] border border-border rounded-xl px-3 py-2"
        />
        {apiMsg && <p className="text-sm text-highlight">{apiMsg}</p>}
        <Button onClick={handleSaveKeys}>Save Keys</Button>
      </section>

      {/* Plan & usage */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Plan & Usage</h2>
        <p>Plan: {plan}</p>
        <p>Workflows this month: {usage}</p>
        <Button intent="secondary" onClick={() => (window.location.href = '/#pricing')}>
          Change Plan
        </Button>
      </section>
    </div>
  );
} 