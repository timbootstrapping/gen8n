'use client';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { User, Settings } from '@/types/database';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Provider configurations
const API_PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)', desc: 'Most accurate for structured JSON' },
  { value: 'openai', label: 'OpenAI', desc: 'Widely supported, good performance' },
  { value: 'openrouter', label: 'OpenRouter', desc: 'Gateway to multiple models' },
  { value: 'google', label: 'Google', desc: 'PaLM / Gemini models' }
];

interface ApiKey {
  id: string;
  provider: string;
  label: string;
  key: string;
  masked: string;
}

export default function SettingsPage() {
  const { loading, user } = useProtectedRoute();
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [n8nBaseUrl, setN8nBaseUrl] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [preferredProvider, setPreferredProvider] = useState('anthropic');
  const [apiMsg, setApiMsg] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Plan state
  const [plan, setPlan] = useState('free');
  const [usage, setUsage] = useState(0);

  // Visibility state for keys
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      // Load profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, plan, usage_count')
        .eq('id', user.id)
        .single();
      
      if (userData && !userError) {
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setPlan(userData.plan || 'free');
        setUsage(userData.usage_count || 0);
      }
      
      // If no user data found, try to get it from auth metadata
      if (!userData || userError) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user?.user_metadata) {
          setFirstName(authUser.user.user_metadata.first_name || '');
          setLastName(authUser.user.user_metadata.last_name || '');
        }
      }

      // Load additional profile data from profile table
      const { data: profileData } = await supabase
        .from('profile')
        .select('n8n_base_url')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setN8nBaseUrl(profileData.n8n_base_url || '');
      }

      // Load settings data (API keys and preferred provider)
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setPreferredProvider(settingsData.main_provider || 'anthropic');
        
        // Build API keys array
        const keys: ApiKey[] = [];
        if (settingsData.anthropic_key) {
          keys.push({
            id: 'anthropic',
            provider: 'anthropic',
            label: 'Anthropic API Key',
            key: settingsData.anthropic_key,
            masked: `sk-...${settingsData.anthropic_key.slice(-4)}`
          });
        }
        if (settingsData.openai_key) {
          keys.push({
            id: 'openai',
            provider: 'openai',
            label: 'OpenAI API Key',
            key: settingsData.openai_key,
            masked: `sk-...${settingsData.openai_key.slice(-4)}`
          });
        }
        if (settingsData.openrouter_key) {
          keys.push({
            id: 'openrouter',
            provider: 'openrouter',
            label: 'OpenRouter API Key',
            key: settingsData.openrouter_key,
            masked: `sk-...${settingsData.openrouter_key.slice(-4)}`
          });
        }
        if (settingsData.google_key) {
          keys.push({
            id: 'google',
            provider: 'google',
            label: 'Google API Key',
            key: settingsData.google_key,
            masked: `${settingsData.google_key.substring(0, 8)}...${settingsData.google_key.slice(-4)}`
          });
        }
        setApiKeys(keys);
      }
    };

    loadUserData();
  }, [user]);

  // Profile update
  const handleUpdateProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    
    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        first_name: firstName.trim() || null, 
        last_name: lastName.trim() || null 
      })
      .eq('id', user.id);
    
    // Update profile table for n8n base URL
    const { error: profileError } = await supabase
      .from('profile')
      .upsert({
        user_id: user.id,
        n8n_base_url: n8nBaseUrl.trim() || null
      });
    
    const error = userError || profileError;
    setProfileMsg(error ? error.message : 'Profile updated successfully!');
    setProfileLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setProfileMsg(''), 3000);
  };

  // Password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPwMsg('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg('Password must be at least 6 characters');
      return;
    }
    
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwMsg(error ? error.message : 'Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setPwLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setPwMsg(''), 3000);
  };

  // Add new API key
  const handleAddApiKey = async () => {
    if (!user || !newKeyProvider || !newKeyValue.trim()) return;
    
    setModalLoading(true);
    
    const updateData: any = {};
    updateData[`${newKeyProvider}_key`] = newKeyValue.trim();
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        ...updateData
      });
    
    if (error) {
      setApiMsg(error.message);
    } else {
      // Add to local state
      const newKey: ApiKey = {
        id: newKeyProvider,
        provider: newKeyProvider,
        label: newKeyLabel.trim() || `${API_PROVIDERS.find(p => p.value === newKeyProvider)?.label} API Key`,
        key: newKeyValue.trim(),
        masked: newKeyProvider === 'google' 
          ? `${newKeyValue.substring(0, 8)}...${newKeyValue.slice(-4)}`
          : `sk-...${newKeyValue.slice(-4)}`
      };
      
      setApiKeys(prev => [...prev.filter(k => k.provider !== newKeyProvider), newKey]);
      setApiMsg('API key added successfully!');
      
      // Close modal and reset
      setIsAddModalOpen(false);
      setNewKeyProvider('');
      setNewKeyLabel('');
      setNewKeyValue('');
    }
    
    setModalLoading(false);
    setTimeout(() => setApiMsg(''), 3000);
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    if (!user) return;
    
    const updateData: any = {};
    updateData[`${keyId}_key`] = null;
    
    const { error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('user_id', user.id);
    
    if (error) {
      setApiMsg(error.message);
    } else {
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      setVisibleKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
      setApiMsg('API key deleted successfully!');
    }
    
    setTimeout(() => setApiMsg(''), 3000);
  };

  // Update preferred provider
  const handleUpdatePreferredProvider = async () => {
    if (!user) return;
    setApiLoading(true);
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        main_provider: preferredProvider
      });
    
    setApiMsg(error ? error.message : 'Preferred provider updated!');
    setApiLoading(false);
    setTimeout(() => setApiMsg(''), 3000);
  };

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground nav-hover"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">n8n Base URL</label>
          <input
            type="url"
            value={n8nBaseUrl}
            onChange={(e) => setN8nBaseUrl(e.target.value)}
            placeholder="https://your-n8n.app.n8n.cloud/"
            className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Your n8n instance URL where workflows will be generated and managed.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
          <div className="w-full bg-[#0f0f11] border border-border/50 rounded-xl px-4 py-3 text-gray-400">
            {user?.email}
          </div>
        </div>
        
        {profileMsg && (
          <div className={`text-sm p-3 rounded-lg ${profileMsg.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {profileMsg}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleUpdateProfile} 
            disabled={profileLoading}
            className="hover-unified"
          >
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </section>

      {/* Change Password Section */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Change Password</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
            />
          </div>
        </div>
        
        {pwMsg && (
          <div className={`text-sm p-3 rounded-lg ${pwMsg.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {pwMsg}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handlePasswordChange} 
            disabled={pwLoading || !newPassword || !confirmPassword}
            className="hover-unified"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </section>

      {/* API Keys Section */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="hover-unified"
          >
            + Add API Key
          </Button>
        </div>
        
        {/* Existing API Keys */}
        <div className="space-y-3">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No API keys configured yet.</p>
              <p className="text-sm mt-1">Add your first API key to get started.</p>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-[#1a1a1d] border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{API_PROVIDERS.find(p => p.value === apiKey.provider)?.label}</span>
                    <span className="text-xs bg-highlight/20 text-highlight px-2 py-1 rounded-full">
                      {apiKey.provider.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1 font-mono">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.masked}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 hover:bg-surface rounded-lg transition-colors icon-hover"
                    title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="p-2 hover:bg-red-900/20 rounded-lg transition-colors danger-hover"
                    title="Delete key"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Preferred Provider */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-medium mb-4">Preferred Coding Model Provider</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <select
                  value={preferredProvider}
                  onChange={(e) => setPreferredProvider(e.target.value)}
                  className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
                >
                  {API_PROVIDERS.map(provider => (
                    <option key={provider.value} value={provider.value} className="bg-[#1a1a1d] text-white">
                      {provider.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This model will be used for Gen8n's core generation logic. Ensure a valid API key is added for the selected provider.
              </p>
            </div>
            <Button 
              onClick={handleUpdatePreferredProvider}
              disabled={apiLoading}
              className="hover-unified shrink-0"
            >
              {apiLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        
        {apiMsg && (
          <div className={`text-sm p-3 rounded-lg ${apiMsg.includes('success') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
            {apiMsg}
          </div>
        )}
      </section>

      {/* Plan & Usage Section */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Plan & Usage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Current Plan</label>
            <div className="bg-[#1a1a1d] border border-border rounded-xl px-4 py-3">
              <span className="capitalize font-medium">{plan}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Workflows This Month</label>
            <div className="bg-[#1a1a1d] border border-border rounded-xl px-4 py-3">
              <span className="font-medium">{usage}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            intent="secondary" 
            onClick={() => (window.location.href = '/#pricing')} 
            className="hover-unified"
          >
            Change Plan
          </Button>
        </div>
      </section>

      {/* Add API Key Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add API Key</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-[#1a1a1d] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Provider *</label>
                <div className="relative">
                  <select
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
                  >
                    <option value="" className="bg-[#1a1a1d] text-gray-400">Select Provider</option>
                    {API_PROVIDERS.map(provider => (
                      <option key={provider.value} value={provider.value} className="bg-[#1a1a1d] text-white">
                        {provider.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Label (optional)</label>
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g., Personal Key, Work Account"
                  className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">API Key *</label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-[#1a1a1d] border border-border rounded-xl px-4 py-3 input-hover focus:border-highlight outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                intent="secondary"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1"
                disabled={modalLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddApiKey}
                disabled={modalLoading || !newKeyProvider || !newKeyValue.trim()}
                className="flex-1 hover-unified"
              >
                {modalLoading ? 'Adding...' : 'Add Key'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 