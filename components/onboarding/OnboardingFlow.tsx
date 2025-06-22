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
  clearOnboardingStorage 
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

  // Load from storage on mount
  useEffect(() => {
    const stored = loadOnboardingFromStorage();
    if (Object.keys(stored).length > 0) {
      setData(stored);
      // If user is already authenticated and has some data, skip to step 2
      if (initialUser && stored.firstName) {
        setCurrentStep(2);
      }
    }
  }, [initialUser]);

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
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
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
            
            <select
              value={data.usageIntent || ''}
              onChange={(e) => updateData({ usageIntent: e.target.value })}
              required
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            >
              <option value="" disabled>Select Usage Intent</option>
              {usageIntents.map(intent => (
                <option key={intent} value={intent} className="bg-[#1a1a1d]">
                  {intent}
                </option>
              ))}
            </select>
            
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
              <select
                value={data.mainProvider || ''}
                onChange={(e) => updateData({ mainProvider: e.target.value })}
                required
                className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
              >
                <option value="" disabled>Select Provider</option>
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value} className="bg-[#1a1a1d]">
                    {provider.label}
                  </option>
                ))}
              </select>
              
              {data.mainProvider && (
                <p className="text-sm text-gray-400">
                  {providers.find(p => p.value === data.mainProvider)?.desc}
                </p>
              )}
              
              <label className="block text-sm font-medium mt-6">Fallback Provider (optional)</label>
              <select
                value={data.fallbackProvider || ''}
                onChange={(e) => updateData({ fallbackProvider: e.target.value })}
                className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
              >
                <option value="">None</option>
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value} className="bg-[#1a1a1d]">
                    {provider.label}
                  </option>
                ))}
              </select>
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
              
              <div className="flex items-center gap-2 mt-6 p-4 bg-[#1a1a1d] rounded-2xl">
                <input 
                  type="checkbox" 
                  id="skip"
                  checked={data.skippedKeys || false}
                  onChange={(e) => updateData({ skippedKeys: e.target.checked })}
                />
                <label htmlFor="skip" className="text-sm">
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
            
            <select
              value={data.marketingSource || ''}
              onChange={(e) => updateData({ marketingSource: e.target.value })}
              required
              className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
            >
              <option value="" disabled>Select Source</option>
              {marketingSources.map(source => (
                <option key={source} value={source} className="bg-[#1a1a1d]">
                  {source}
                </option>
              ))}
            </select>
            
            {data.marketingSource === 'Other' && (
              <input
                type="text"
                value={otherSource}
                onChange={(e) => {
                  setOtherSource(e.target.value);
                  updateData({ marketingSource: `Other: ${e.target.value}` });
                }}
                placeholder="Please specify"
                required
                className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 input-hover focus:border-highlight outline-none"
              />
            )}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={prevStep} className="flex-1" intent="secondary">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="flex-1 hover-unified"
                disabled={!data.marketingSource}
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
            
            <div className="flex items-start gap-2">
              <input type="checkbox" id="consent" required />
              <label htmlFor="consent" className="text-sm">
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
                disabled={loading}
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