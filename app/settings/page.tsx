'use client';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { User, Settings } from '@/types/database';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Key, Settings as SettingsIcon, User as UserIcon, Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import ApiKeyToggle from '@/components/settings/ApiKeyToggle';
import CreditPurchase from '@/components/settings/CreditPurchase';
import { getUserCreditBalance, toggleApiKeyUsage } from '@/lib/creditHelpers';

// Provider configurations
const API_PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)', desc: 'Most accurate for structured JSON', required: true },
  { value: 'openai', label: 'OpenAI', desc: 'Widely supported, good performance', required: false },
  { value: 'openrouter', label: 'OpenRouter', desc: 'Gateway to multiple models', required: false },
  { value: 'google', label: 'Google', desc: 'PaLM / Gemini models', required: false }
];

interface ApiKey {
  id: string;
  provider: string;
  label: string;
  key: string;
  masked: string;
  name: string;
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

  // Credit and API key state
  const [credits, setCredits] = useState(0);
  const [reservedCredits, setReservedCredits] = useState(0);
  const [useOwnApiKeys, setUseOwnApiKeys] = useState(false);
  const [hasRequiredApiKeys, setHasRequiredApiKeys] = useState(false);
  const [mainProvider, setMainProvider] = useState<string | null>(null);
  const [fallbackProvider, setFallbackProvider] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiMsg, setApiMsg] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Visibility state for keys
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Active section
  const [activeSection, setActiveSection] = useState<'profile' | 'api-keys' | 'billing'>('billing');

  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      // Load profile data and credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, credits, reserved_credits')
        .eq('id', user.id)
        .single();
      
      if (userData && !userError) {
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setCredits(userData.credits || 0);
        setReservedCredits(userData.reserved_credits || 0);
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

      // Load settings data (API keys and preferences)
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setUseOwnApiKeys(settingsData.use_own_api_keys || false);
        setMainProvider(settingsData.main_provider || null);
        setFallbackProvider(settingsData.fallback_provider || null);
        
        // Build API keys array
        const keys: ApiKey[] = [];
        if (settingsData.anthropic_key) {
          keys.push({
            id: 'anthropic',
            provider: 'anthropic',
            label: 'Anthropic API Key',
            name: settingsData.anthropic_key_name || 'Anthropic API Key',
            key: settingsData.anthropic_key,
            masked: `sk-...${settingsData.anthropic_key.slice(-4)}`
          });
        }
        if (settingsData.openai_key) {
          keys.push({
            id: 'openai',
            provider: 'openai',
            label: 'OpenAI API Key',
            name: settingsData.openai_key_name || 'OpenAI API Key',
            key: settingsData.openai_key,
            masked: `sk-...${settingsData.openai_key.slice(-4)}`
          });
        }
        if (settingsData.openrouter_key) {
          keys.push({
            id: 'openrouter',
            provider: 'openrouter',
            label: 'OpenRouter API Key',
            name: settingsData.openrouter_key_name || 'OpenRouter API Key',
            key: settingsData.openrouter_key,
            masked: `sk-...${settingsData.openrouter_key.slice(-4)}`
          });
        }
        if (settingsData.google_key) {
          keys.push({
            id: 'google',
            provider: 'google',
            label: 'Google API Key',
            name: settingsData.google_key_name || 'Google API Key',
            key: settingsData.google_key,
            masked: `${settingsData.google_key.substring(0, 8)}...${settingsData.google_key.slice(-4)}`
          });
        }
        setApiKeys(keys);
        
        // Check if user has both main and fallback API keys
        const hasMainKey = settingsData.main_provider ? getApiKeyByProvider(settingsData, settingsData.main_provider) : false;
        const hasFallbackKey = settingsData.fallback_provider && settingsData.fallback_provider !== settingsData.main_provider 
          ? getApiKeyByProvider(settingsData, settingsData.fallback_provider) : false;
        
        setHasRequiredApiKeys(hasMainKey && hasFallbackKey);
      }
    };

    loadUserData();
  }, [user]);

  // Helper function to check if API key exists for a provider
  const getApiKeyByProvider = (settings: any, provider: string): boolean => {
    switch (provider) {
      case 'anthropic':
        return !!settings.anthropic_key;
      case 'openai':
        return !!settings.openai_key;
      case 'openrouter':
        return !!settings.openrouter_key;
      case 'google':
        return !!settings.google_key;
      default:
        return false;
    }
  };

  // Handle API key toggle
  const handleToggleApiKeys = async (useOwnKeys: boolean) => {
    if (!user) return;
    
    setToggleLoading(true);
    try {
      const success = await toggleApiKeyUsage(user.id, useOwnKeys);
      if (success) {
        setUseOwnApiKeys(useOwnKeys);
      } else {
        alert('Failed to update preference');
      }
    } catch (error) {
      console.error('Error toggling API keys:', error);
      alert('Failed to update preference');
    } finally {
      setToggleLoading(false);
    }
  };

  // Handle credit purchase
  const handlePurchaseCredits = async (quantity: number) => {
    setPurchaseLoading(true);
    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start purchase process');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Refresh credit balance (called after successful purchases)
  const refreshCreditBalance = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('credits, reserved_credits')
        .eq('id', user.id)
        .single();
      
      if (userData && !error) {
        setCredits(userData.credits || 0);
        setReservedCredits(userData.reserved_credits || 0);
      }
    } catch (error) {
      console.error('Error refreshing credit balance:', error);
    }
  };

  // Listen for successful purchase events (when user returns from Stripe)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('purchase_success') === 'true') {
      // Refresh balance after successful purchase
      refreshCreditBalance();
      
      // Clear the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
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
    setPwLoading(false);
    
    if (!error) {
      setNewPassword('');
      setConfirmPassword('');
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setPwMsg(''), 3000);
  };

  // Add API key
  const handleAddApiKey = async () => {
    if (!newKeyProvider || !newKeyValue.trim() || !newKeyLabel.trim()) {
      return;
    }
    
    setModalLoading(true);
    
    const keyColumn = `${newKeyProvider}_key`;
    const nameColumn = `${newKeyProvider}_key_name`;
    
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user!.id,
        [keyColumn]: newKeyValue.trim(),
        [nameColumn]: newKeyLabel.trim()
      });
    
    if (error) {
      setApiMsg(error.message);
    } else {
      setApiMsg('API key added successfully!');
      
      // Add to local state
      const newKey: ApiKey = {
        id: newKeyProvider,
        provider: newKeyProvider,
        label: newKeyLabel,
        name: newKeyLabel,
        key: newKeyValue,
        masked: newKeyProvider === 'google' 
          ? `${newKeyValue.substring(0, 8)}...${newKeyValue.slice(-4)}`
          : `sk-...${newKeyValue.slice(-4)}`
      };
      
      setApiKeys(prev => {
        const filtered = prev.filter(k => k.provider !== newKeyProvider);
        return [...filtered, newKey];
      });
      
      // Update required keys status
      if (newKeyProvider === 'anthropic') {
        setHasRequiredApiKeys(true);
      }
      
      // Close modal
      setIsAddModalOpen(false);
      setNewKeyProvider('');
      setNewKeyLabel('');
      setNewKeyValue('');
    }
    
    setModalLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setApiMsg(''), 3000);
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    setApiLoading(true);
    
    const keyColumn = `${keyId}_key`;
    const nameColumn = `${keyId}_key_name`;
    
    const { error } = await supabase
      .from('settings')
      .update({
        [keyColumn]: null,
        [nameColumn]: null
      })
      .eq('user_id', user!.id);
    
    if (error) {
      setApiMsg(error.message);
    } else {
      setApiMsg('API key deleted successfully!');
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      
      // Update required keys status
      if (keyId === 'anthropic') {
        setHasRequiredApiKeys(false);
        // If user was using own keys and just deleted required key, switch to credits
        if (useOwnApiKeys) {
          handleToggleApiKeys(false);
        }
      }
    }
    
    setApiLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setApiMsg(''), 3000);
  };

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
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account, API keys, and billing preferences.</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-6 border-b border-[#2a2a2a] mb-8">
          <button
            onClick={() => setActiveSection('billing')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeSection === 'billing'
                ? 'border-[#a259ff] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing & Usage
            </div>
          </button>
          <button
            onClick={() => setActiveSection('api-keys')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeSection === 'api-keys'
                ? 'border-[#a259ff] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </div>
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeSection === 'profile'
                ? 'border-[#a259ff] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </div>
          </button>
        </div>

        {/* Content */}
        {activeSection === 'billing' && (
          <div className="space-y-8">
            <ApiKeyToggle
              useOwnApiKeys={useOwnApiKeys}
              credits={credits}
              reservedCredits={reservedCredits}
              hasRequiredApiKeys={hasRequiredApiKeys}
              mainProvider={mainProvider}
              fallbackProvider={fallbackProvider}
              onChange={handleToggleApiKeys}
              onPurchaseCredits={() => setIsPurchaseModalOpen(true)}
              loading={toggleLoading}
            />
          </div>
        )}

        {activeSection === 'api-keys' && (
          <div className="space-y-8">
            {/* API Keys Section */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">API Keys</h3>
                  <p className="text-sm text-gray-400">Manage your provider API keys for unlimited generation.</p>
                </div>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#a259ff] hover:bg-[#9333ea]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Key
                </Button>
              </div>

              {apiMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  apiMsg.includes('success') 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {apiMsg}
                </div>
              )}

              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys configured</p>
                    <p className="text-sm">Add an Anthropic API key to enable unlimited generations with your own keys.</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{key.name}</h4>
                          <span className="px-2 py-1 bg-[#2a2a2a] text-xs rounded-full">
                            {API_PROVIDERS.find(p => p.value === key.provider)?.label || key.provider}
                          </span>
                          {key.provider === 'anthropic' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {visibleKeys.has(key.id) ? key.key : key.masked}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                          disabled={apiLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
              
              {profileMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  profileMsg.includes('success') 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {profileMsg}
                </div>
              )}

              <div className="grid gap-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">n8n Base URL</label>
                  <input
                    type="url"
                    value={n8nBaseUrl}
                    onChange={(e) => setN8nBaseUrl(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    placeholder="https://your-n8n-instance.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The base URL of your n8n instance where workflows will be deployed.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={profileLoading}
                className="bg-[#a259ff] hover:bg-[#9333ea]"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>

            {/* Password Section */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">Change Password</h3>
              
              {pwMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  pwMsg.includes('success') 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {pwMsg}
                </div>
              )}

              <div className="grid gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={pwLoading || !newPassword || !confirmPassword}
                className="bg-[#a259ff] hover:bg-[#9333ea]"
              >
                {pwLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add API Key Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Provider</label>
                <select
                  value={newKeyProvider}
                  onChange={(e) => {
                    setNewKeyProvider(e.target.value);
                    const provider = API_PROVIDERS.find(p => p.value === e.target.value);
                    setNewKeyLabel(provider?.label || '');
                  }}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="">Select provider</option>
                  {API_PROVIDERS.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label} {provider.required ? '(Required)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Key Name</label>
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  placeholder="My API Key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  placeholder="sk-..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsAddModalOpen(false)}
                intent="secondary"
                className="flex-1"
                disabled={modalLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddApiKey}
                className="flex-1 bg-[#a259ff] hover:bg-[#9333ea]"
                disabled={modalLoading || !newKeyProvider || !newKeyValue.trim() || !newKeyLabel.trim()}
              >
                {modalLoading ? 'Adding...' : 'Add Key'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Purchase Modal */}
      <CreditPurchase
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchase={handlePurchaseCredits}
        loading={purchaseLoading}
      />
    </main>
  );
} 