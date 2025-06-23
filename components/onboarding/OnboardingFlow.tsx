'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import ProgressStepper from './ProgressStepper';
import KeyValidationInput from './KeyValidationInput';
import ApiKeyChoice from './ApiKeyChoice';
import { 
  OnboardingData, 
  saveOnboardingProfile, 
  saveOnboardingSettings, 
  saveOnboardingToStorage, 
  loadOnboardingFromStorage, 
  clearOnboardingStorage,
  saveCurrentStep,
  loadCurrentStep,
  checkOnboardingStatus
} from '@/lib/onboardingHelpers';
import { initializeUserCredits, toggleApiKeyUsage } from '@/lib/creditHelpers';

interface OnboardingFlowProps {
  initialUser?: any;
}

const providers = [
  { value: 'anthropic', label: 'Anthropic (Claude)', desc: 'Most accurate for structured JSON', required: true },
  { value: 'openai', label: 'OpenAI', desc: 'Widely supported, OK output', required: false },
  { value: 'openrouter', label: 'OpenRouter', desc: 'Bring your own gateway', required: false },
  { value: 'google', label: 'Google', desc: 'PaLM / Gemini models', required: false }
];

const usageIntents = [
  'Solo Developer',
  'Startup', 
  'Enterprise',
  'Learning / Exploration',
  'Client Work'
];

const marketingSources = [
  'YouTube',
  'LinkedIn', 
  'Instagram',
  'TikTok',
  'AI Discords/Communities',
  'Google',
  'Other'
];

export default function OnboardingFlow({ initialUser }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [keyValidations, setKeyValidations] = useState<Record<string, boolean>>({});
  const [otherSource, setOtherSource] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [useOwnApiKeys, setUseOwnApiKeys] = useState(false);

  // Load from storage on mount and handle step persistence
  useEffect(() => {
    const initializeOnboarding = async () => {
      const stored = loadOnboardingFromStorage();
      const savedStep = loadCurrentStep();
      
      if (Object.keys(stored).length > 0) {
        setData(stored);
        
        // Extract marketing source if it starts with "Other:"
        if (stored.marketingSource?.startsWith('Other:')) {
          setOtherSource(stored.marketingSource.replace('Other: ', ''));
        }
      }

      // Check if user is authenticated and handle step restoration
      if (initialUser) {
        setIsReturningUser(true);
        
        // Check if they've already completed onboarding
        const hasCompleted = await checkOnboardingStatus(initialUser.id);
        if (hasCompleted) {
          router.push('/dashboard');
          return;
        }
        
        // Restore saved step or skip step 1 if they have data
        if (savedStep && savedStep > 1) {
          setCurrentStep(savedStep);
        } else if (stored.firstName || stored.email) {
          setCurrentStep(2); // Skip account creation if they already have data
        }
      } else {
        // Not authenticated, start from step 1 or restore saved step
        if (savedStep) {
          setCurrentStep(Math.min(savedStep, 1)); // Cap at step 1 if not authenticated
        }
      }
    };

    initializeOnboarding();
  }, [initialUser, router]);

  // Save to storage whenever data changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      saveOnboardingToStorage(data);
    }
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveCurrentStep(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveCurrentStep(newStep);
    }
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email!,
        password: (e.target as any).password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      if (authData.user) {
        updateData({ 
          firstName: data.firstName!, 
          lastName: data.lastName!,
          email: data.email!
        });
        setIsReturningUser(true);
        nextStep();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup`
      }
    });
  };

  const handleApiKeyChoice = async (chooseOwnKeys: boolean) => {
    setLoading(true);
    setUseOwnApiKeys(chooseOwnKeys);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (chooseOwnKeys) {
        // Set preference to use own API keys
        await toggleApiKeyUsage(user.id, true);
        // Go to API key setup
        nextStep();
      } else {
        // Set preference to use Gen8n credits and initialize with 2 free credits
        await toggleApiKeyUsage(user.id, false);
        await initializeUserCredits(user.id);
        // Skip API key setup and go directly to profile info
        setCurrentStep(4);
        saveCurrentStep(4);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeOnboarding = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save profile data
      await saveOnboardingProfile(user.id, data);
      
      // Save settings data (only if using own API keys)
      if (useOwnApiKeys) {
        await saveOnboardingSettings(user.id, data);
      }
      
      // Clear storage
      clearOnboardingStorage();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Account Creation
        // If user is already authenticated, show continue message
        if (isReturningUser && initialUser) {
          return (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Welcome back!</h2>
                <p className="text-gray-400">Let's continue setting up your Gen8n account.</p>
              </div>
              <Button onClick={nextStep} size="lg">
                Continue Setup
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Create Your Account</h2>
              <p className="text-gray-400">Let's get you started with Gen8n</p>
            </div>

            <form onSubmit={handleAccountCreation} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  value={data.firstName || ''}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={data.lastName || ''}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={data.email || ''}
                onChange={(e) => updateData({ email: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                required
              />
              
              <Button 
                type="submit" 
                disabled={loading || !data.firstName || !data.lastName || !data.email}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-400 mb-4">Or continue with</p>
              <Button 
                onClick={handleGoogleSignup}
                intent="secondary"
                className="w-full"
                size="lg"
              >
                Sign up with Google
              </Button>
            </div>
          </div>
        );

      case 2: // API Key vs Credits Choice
        return (
          <ApiKeyChoice 
            onChoice={handleApiKeyChoice}
            loading={loading}
          />
        );

      case 3: // API Key Setup (only if user chose own keys)
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Configure Your API Keys</h2>
              <p className="text-gray-400">Add your API keys to start generating workflows</p>
            </div>

            <div className="space-y-4">
              {providers.map((provider) => (
                <KeyValidationInput
                  key={provider.value}
                  provider={provider.value}
                  label={provider.label}
                  description={provider.desc}
                  required={provider.required}
                  value={data[`${provider.value}Key` as keyof OnboardingData] as string || ''}
                  isValid={keyValidations[provider.value]}
                  onChange={(value, isValid) => {
                    updateData({ [`${provider.value}Key`]: value } as any);
                    setKeyValidations(prev => ({ ...prev, [provider.value]: isValid }));
                  }}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} intent="secondary" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!keyValidations.anthropic}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 4: // Profile Information
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Tell us about yourself</h2>
              <p className="text-gray-400">This helps us customize your experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What's your company or project?
                </label>
                <input
                  type="text"
                  value={data.companyOrProject || ''}
                  onChange={(e) => updateData({ companyOrProject: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  placeholder="Acme Corp, Personal Project, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How do you plan to use Gen8n?
                </label>
                <select
                  value={data.usageIntent || ''}
                  onChange={(e) => updateData({ usageIntent: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="">Select usage type</option>
                  {usageIntents.map(intent => (
                    <option key={intent} value={intent}>{intent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  n8n Base URL
                </label>
                <input
                  type="url"
                  value={data.n8nBaseUrl || ''}
                  onChange={(e) => updateData({ n8nBaseUrl: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  placeholder="https://your-n8n-instance.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The URL where your n8n instance is hosted
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} intent="secondary" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 5: // Marketing Source
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">How did you hear about us?</h2>
              <p className="text-gray-400">Help us understand how people discover Gen8n</p>
            </div>

            <div className="grid gap-3">
              {marketingSources.map(source => (
                <button
                  key={source}
                  onClick={() => {
                    if (source === 'Other') {
                      updateData({ marketingSource: `Other: ${otherSource}` });
                    } else {
                      updateData({ marketingSource: source });
                      setOtherSource('');
                    }
                  }}
                  className={`p-4 text-left rounded-xl border-2 transition-all ${
                    data.marketingSource === source || (source === 'Other' && data.marketingSource?.startsWith('Other:'))
                      ? 'border-[#a259ff] bg-[#a259ff]/10 text-white'
                      : 'border-[#2a2a2a] bg-[#1a1a1a] text-gray-300 hover:border-[#3a3a3a]'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>

            {(data.marketingSource === 'Other' || data.marketingSource?.startsWith('Other:')) && (
              <input
                type="text"
                value={otherSource}
                onChange={(e) => {
                  setOtherSource(e.target.value);
                  updateData({ marketingSource: `Other: ${e.target.value}` });
                }}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                placeholder="Please specify..."
              />
            )}

            <div className="flex gap-4">
              <Button onClick={prevStep} intent="secondary" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!data.marketingSource}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 6: // Summary & Consent
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-gray-400">Review your setup and start generating workflows</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{data.firstName} {data.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{data.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Usage Type:</span>
                  <span className="text-white">{useOwnApiKeys ? 'Own API Keys' : 'Gen8n Credits (2 free)'}</span>
                </div>
                {data.companyOrProject && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white">{data.companyOrProject}</span>
                  </div>
                )}
                {data.n8nBaseUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">n8n URL:</span>
                    <span className="text-white text-xs">{data.n8nBaseUrl}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#a259ff] bg-[#2a2a2a] border-[#3a3a3a] rounded focus:ring-[#a259ff]"
                />
                <span className="text-sm text-gray-300">
                  I agree to Gen8n's Terms of Service and Privacy Policy. I understand that 
                  {useOwnApiKeys 
                    ? ' my API keys will be securely stored and only used for workflow generation.'
                    : ' I will be charged for additional credits after using my 2 free credits.'
                  }
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <Button onClick={prevStep} intent="secondary" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={finalizeOnboarding}
                disabled={loading || !consentGiven}
                className="flex-1"
                size="lg"
              >
                {loading ? 'Finishing Setup...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProgressStepper 
          currentStep={currentStep} 
          totalSteps={6}
          stepTitles={[
            'Account',
            'Usage Type',
            'API Keys',
            'Profile',
            'Source',
            'Complete'
          ]}
        />
        
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 mt-8"
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
} 