'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import ProgressStepper from './ProgressStepper';
import KeyValidationInput from './KeyValidationInput';
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

interface OnboardingFlowProps {
  initialUser?: any;
}

const providers = [
  { value: 'anthropic', label: 'Anthropic (Claude Opus)', desc: 'Most accurate for structured JSON' },
  { value: 'openai', label: 'OpenAI', desc: 'Widely supported, OK output' },
  { value: 'openrouter', label: 'OpenRouter', desc: 'Bring your own gateway' },
  { value: 'google', label: 'Google', desc: 'PaLM / Gemini models' }
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

  const finalizeOnboarding = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save profile data
      await saveOnboardingProfile(user.id, data);
      
      // Save settings data
      await saveOnboardingSettings(user.id, data);
      
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
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-bold mb-6">👋 Welcome Back!</h1>
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <p className="text-lg">You're already signed in as:</p>
                <p className="text-highlight font-medium">{initialUser.email}</p>
                <p className="text-sm text-gray-400">Let's continue your onboarding!</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    clearOnboardingStorage();
                    setCurrentStep(1);
                    setIsReturningUser(false);
                    setData({});
                  }} 
                  className="flex-1" 
                  intent="secondary"
                >
                  Reset Onboarding
                </Button>
                <Button 
                  onClick={nextStep} 
                  className="flex-1 hover-unified"
                >
                  Continue Onboarding
                </Button>
              </div>
            </div>
          );
        }

        return (
          <form onSubmit={handleAccountCreation} className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Create Your Gen8n Account</h1>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={data.firstName || ''}
                onChange={(e) => updateData({ firstName: e.target.value })}
                placeholder="First Name"
                required
                className="flex-1 bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
              />
              <input
                type="text"
                value={data.lastName || ''}
                onChange={(e) => updateData({ lastName: e.target.value })}
                placeholder="Last Name"
                required
                className="flex-1 bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
              />
            </div>
            
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="Email"
              required
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            />
            
            <Button type="submit" className="w-full hover-unified" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">or</p>
              <Button type="button" onClick={handleGoogleSignup} className="hover-unified">
                Continue with Google
              </Button>
            </div>
          </form>
        );

      case 2: // Company Info
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Tell Us About Your Project</h1>
            
            <input
              type="text"
              value={data.companyOrProject || ''}
              onChange={(e) => updateData({ companyOrProject: e.target.value })}
              placeholder="Company or Project Name"
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            />
            
            <div className="relative">
              <select
                value={data.usageIntent || ''}
                onChange={(e) => updateData({ usageIntent: e.target.value })}
                required
                className="w-full bg-[#1a1a1d] border border-border rounded-2xl px-4 py-2 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
              >
                <option value="" disabled className="bg-[#1a1a1d] text-gray-400">Select Usage Intent</option>
                {usageIntents.map(intent => (
                  <option key={intent} value={intent} className="bg-[#1a1a1d] text-white">
                    {intent}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <input
              type="url"
              value={data.n8nBaseUrl || ''}
              onChange={(e) => updateData({ n8nBaseUrl: e.target.value })}
              placeholder="n8n Base URL (e.g. https://your-n8n.app.n8n.cloud/)"
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              This is your n8n instance URL where workflows will be generated. You can change this later in settings.
            </p>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 hover-unified"
                disabled={!data.usageIntent}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 3: // Provider Selection
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Choose Your Model Provider</h1>
            <p className="text-center text-gray-400 mb-6">Which AI model should power your workflow generation?</p>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium">Main Provider *</label>
              <div className="relative">
                <select
                  value={data.mainProvider || ''}
                  onChange={(e) => updateData({ mainProvider: e.target.value })}
                  required
                  className="w-full bg-[#1a1a1d] border border-border rounded-2xl px-4 py-2 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
                >
                  <option value="" disabled className="bg-[#1a1a1d] text-gray-400">Select Provider</option>
                  {providers.map(provider => (
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
              
              {data.mainProvider && (
                <p className="text-sm text-gray-400">
                  {providers.find(p => p.value === data.mainProvider)?.desc}
                </p>
              )}
              
              <label className="block text-sm font-medium mt-6">Fallback Provider (optional)</label>
              <div className="relative">
                <select
                  value={data.fallbackProvider || ''}
                  onChange={(e) => updateData({ fallbackProvider: e.target.value })}
                  className="w-full bg-[#1a1a1d] border border-border rounded-2xl px-4 py-2 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
                >
                  <option value="" className="bg-[#1a1a1d] text-gray-400">None</option>
                  {providers.map(provider => (
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
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 hover-unified"
                disabled={!data.mainProvider}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 4: // API Keys
        const currentKeys = data.apiKeys || {};
        const requiredKeyValid = data.mainProvider !== 'anthropic' || keyValidations.anthropic;
        
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Enter Your API Keys</h1>
            <p className="text-center text-gray-400 mb-6">Your keys are encrypted and stored securely.</p>
            
            <div className="space-y-4">
              {data.mainProvider && (
                <KeyValidationInput
                  label={providers.find(p => p.value === data.mainProvider)?.label || ''}
                  placeholder={`Enter your ${data.mainProvider} API key`}
                  provider={data.mainProvider}
                  required={data.mainProvider === 'anthropic'}
                  value={currentKeys[data.mainProvider] || ''}
                  onChange={(value) => updateData({ 
                    apiKeys: { ...currentKeys, [data.mainProvider!]: value }
                  })}
                  onValidation={(isValid) => setKeyValidations(prev => ({ 
                    ...prev, [data.mainProvider!]: isValid 
                  }))}
                />
              )}
              
              {data.fallbackProvider && (
                <KeyValidationInput
                  label={providers.find(p => p.value === data.fallbackProvider)?.label || ''}
                  placeholder={`Enter your ${data.fallbackProvider} API key`}
                  provider={data.fallbackProvider}
                  required={false}
                  value={currentKeys[data.fallbackProvider] || ''}
                  onChange={(value) => updateData({ 
                    apiKeys: { ...currentKeys, [data.fallbackProvider!]: value }
                  })}
                  onValidation={(isValid) => setKeyValidations(prev => ({ 
                    ...prev, [data.fallbackProvider!]: isValid 
                  }))}
                />
              )}
              
              <div className="flex items-center gap-3 mt-6 p-4 bg-[#1a1a1d] rounded-2xl">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="skip"
                    checked={data.skippedKeys || false}
                    onChange={(e) => updateData({ skippedKeys: e.target.checked })}
                    className="sr-only"
                  />
                  <label 
                    htmlFor="skip" 
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      data.skippedKeys 
                        ? 'bg-highlight border-highlight' 
                        : 'border-gray-400 hover:border-highlight'
                    }`}
                  >
                    {data.skippedKeys && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                </div>
                <label htmlFor="skip" className="text-sm cursor-pointer">
                  Skip and try a free demo (2 runs)
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 hover-unified"
                disabled={!data.skippedKeys && !requiredKeyValid}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 5: // Marketing Attribution
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Where did you hear about Gen8n?</h1>
            
            <div className="relative">
              <select
                value={data.marketingSource?.startsWith('Other:') ? 'Other' : (data.marketingSource || '')}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Other') {
                    // When selecting "Other", don't immediately update the data
                    // Just trigger the input field to show
                    updateData({ marketingSource: 'Other' });
                    setOtherSource(''); // Reset the other source input
                  } else {
                    // For other selections, update normally and clear other source
                    updateData({ marketingSource: value });
                    setOtherSource('');
                  }
                }}
                required
                className="w-full bg-[#1a1a1d] border border-border rounded-2xl px-4 py-2 pr-10 input-hover focus:border-highlight outline-none appearance-none cursor-pointer text-white"
              >
                <option value="" disabled className="bg-[#1a1a1d] text-gray-400">Select Source</option>
                {marketingSources.map(source => (
                  <option key={source} value={source} className="bg-[#1a1a1d] text-white">
                    {source}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {(data.marketingSource === 'Other' || data.marketingSource?.startsWith('Other:')) && (
              <div>
                <input
                  type="text"
                  value={otherSource}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOtherSource(value);
                    // Update the data with the combined format
                    updateData({ marketingSource: value ? `Other: ${value}` : 'Other' });
                  }}
                  placeholder="Please specify"
                  required
                  className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Please tell us where you discovered Gen8n</p>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 hover-unified"
                disabled={
                  !data.marketingSource || 
                  (data.marketingSource === 'Other' && !otherSource.trim()) ||
                  (data.marketingSource?.startsWith('Other:') && !otherSource.trim())
                }
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 6: // Confirmation
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Almost Done!</h1>
            
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Name</span>
                <span className="text-gray-300">{data.firstName} {data.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Company</span>
                <span className="text-gray-300">{data.companyOrProject || 'Not specified'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Usage Intent</span>
                <span className="text-gray-300">{data.usageIntent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Main Provider</span>
                <span className="text-gray-300">{providers.find(p => p.value === data.mainProvider)?.label}</span>
              </div>
              {data.fallbackProvider && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Fallback Provider</span>
                  <span className="text-gray-300">{providers.find(p => p.value === data.fallbackProvider)?.label}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-medium">API Keys</span>
                <span className="text-gray-300">{data.skippedKeys ? 'Demo Mode' : 'Configured'}</span>
              </div>
            </div>
            
            <div className="bg-[#1a1a1d] border border-border rounded-2xl p-4 text-sm text-gray-300">
              <strong>Note:</strong> Running generations using your keys may incur costs depending on your model provider (e.g. ~$0.30 per Claude Opus run).
            </div>
            
            <div className="flex items-start gap-3">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="sr-only" 
                />
                <label 
                  htmlFor="consent" 
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    consentGiven 
                      ? 'bg-highlight border-highlight' 
                      : 'border-gray-400 hover:border-highlight'
                  }`}
                >
                  {consentGiven && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              </div>
              <label htmlFor="consent" className="text-sm cursor-pointer">
                I understand that my API key will be used to power generations.
              </label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={finalizeOnboarding} 
                className="flex-1 hover-unified"
                disabled={loading || !consentGiven}
              >
                {loading ? 'Setting up...' : 'Start Using Gen8n'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-20 pt-24 space-y-6">
      <ProgressStepper currentStep={currentStep} totalSteps={6} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 