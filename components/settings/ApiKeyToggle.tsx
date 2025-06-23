'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, CreditCard, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApiKeyToggleProps {
  useOwnApiKeys: boolean;
  credits: number;
  reservedCredits: number;
  hasRequiredApiKeys: boolean;
  mainProvider: string | null;
  fallbackProvider: string | null;
  onChange: (useOwnKeys: boolean) => Promise<void>;
  onPurchaseCredits: () => void;
  loading?: boolean;
}

export default function ApiKeyToggle({
  useOwnApiKeys,
  credits,
  reservedCredits,
  hasRequiredApiKeys,
  mainProvider,
  fallbackProvider,
  onChange,
  onPurchaseCredits,
  loading
}: ApiKeyToggleProps) {
  const [switching, setSwitching] = useState(false);
  const availableCredits = credits - reservedCredits;

  const handleToggle = async (newValue: boolean) => {
    // Prevent switching to own keys if user doesn't have required keys
    if (newValue && !hasRequiredApiKeys) {
      return;
    }

    // Prevent switching to credits if user has 0 available credits
    if (!newValue && availableCredits <= 0) {
      return;
    }

    setSwitching(true);
    try {
      await onChange(newValue);
    } finally {
      setSwitching(false);
    }
  };

  const getRequiredKeysStatus = () => {
    if (!mainProvider) return 'No main provider selected';
    if (!fallbackProvider) return 'No fallback provider selected';
    if (mainProvider === fallbackProvider) return 'Main and fallback providers must be different';
    return 'Both main and fallback API keys required';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Workflow Generation</h3>
        <p className="text-gray-400 text-sm">
          Choose how you want to generate workflows. You can switch between options anytime.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Gen8n Credits Option */}
        <motion.div
          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
            !useOwnApiKeys
              ? 'border-[#a259ff] bg-[#a259ff]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          } ${availableCredits === 0 && useOwnApiKeys ? 'opacity-50' : ''}`}
          onClick={() => handleToggle(false)}
          whileHover={availableCredits > 0 || !useOwnApiKeys ? { scale: 1.01 } : {}}
          whileTap={availableCredits > 0 || !useOwnApiKeys ? { scale: 0.99 } : {}}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              !useOwnApiKeys ? 'bg-[#a259ff]' : 'bg-[#2a2a2a]'
            }`}>
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-white">Use Gen8n Credits</h4>
                {!useOwnApiKeys && (
                  <span className="px-2 py-0.5 bg-[#a259ff]/20 text-[#a259ff] text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {availableCredits > 0 
                  ? `${availableCredits} credit${availableCredits === 1 ? '' : 's'} available • $1.50 per generation`
                  : reservedCredits > 0
                    ? `${reservedCredits} credit${reservedCredits === 1 ? '' : 's'} reserved • ${credits} total`
                    : 'No credits available'
                }
              </p>
            </div>

            {availableCredits === 0 && !useOwnApiKeys && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchaseCredits();
                  }}
                  size="sm"
                  className="bg-[#a259ff] hover:bg-[#9333ea]"
                >
                  Buy Credits
                </Button>
              </div>
            )}

            {availableCredits > 0 && !useOwnApiKeys && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {availableCredits} available
                </span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPurchaseCredits();
                  }}
                  size="sm"
                  intent="secondary"
                >
                  Add More
                </Button>
              </div>
            )}
          </div>

          {availableCredits === 0 && useOwnApiKeys && (
            <div className="mt-3 flex items-center gap-2 text-sm text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Purchase credits to enable this option</span>
            </div>
          )}
        </motion.div>

        {/* Own API Keys Option */}
        <motion.div
          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
            useOwnApiKeys
              ? 'border-[#a259ff] bg-[#a259ff]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          } ${!hasRequiredApiKeys && !useOwnApiKeys ? 'opacity-50' : ''}`}
          onClick={() => handleToggle(true)}
          whileHover={hasRequiredApiKeys || useOwnApiKeys ? { scale: 1.01 } : {}}
          whileTap={hasRequiredApiKeys || useOwnApiKeys ? { scale: 0.99 } : {}}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              useOwnApiKeys ? 'bg-[#a259ff]' : 'bg-[#2a2a2a]'
            }`}>
              <Key className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-white">Use My Own API Keys</h4>
                {useOwnApiKeys && (
                  <span className="px-2 py-0.5 bg-[#a259ff]/20 text-[#a259ff] text-xs rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {hasRequiredApiKeys 
                  ? `Unlimited generations • Using ${mainProvider} + ${fallbackProvider}`
                  : getRequiredKeysStatus()
                }
              </p>
            </div>

            {hasRequiredApiKeys && (
              <div className="text-sm text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Ready
              </div>
            )}
          </div>

          {!hasRequiredApiKeys && !useOwnApiKeys && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Configure main and fallback providers in API Keys tab</span>
              </div>
              <div className="text-xs text-gray-500">
                <strong>Recommended:</strong> Anthropic (main) + OpenAI (fallback)
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {(switching || loading) && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-[#a259ff] rounded-full animate-spin"></div>
            Updating settings...
          </div>
        </div>
      )}
    </div>
  );
} 