'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Key, CreditCard, Check, Info, ExternalLink } from 'lucide-react';

interface ApiKeyChoiceProps {
  onChoice: (useOwnKeys: boolean) => void;
  loading?: boolean;
}

export default function ApiKeyChoice({ onChoice, loading }: ApiKeyChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<'credits' | 'own-keys' | null>(null);

  const handleContinue = () => {
    if (selectedOption) {
      onChoice(selectedOption === 'own-keys');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Choose Your Setup</h2>
        <p className="text-gray-400">
          How would you like to use Gen8n? You can always change this later in settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Try with Credits Option */}
        <motion.div
          className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'credits'
              ? 'border-[#a259ff] bg-[#a259ff]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          }`}
          onClick={() => setSelectedOption('credits')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              selectedOption === 'credits' ? 'bg-[#a259ff]' : 'bg-[#2a2a2a]'
            }`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">Try with 2 Free Credits</h3>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                  Recommended
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">
                Get started immediately with Gen8n's AI models. Perfect for testing and small projects.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>2 free workflow generations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Buy more credits as needed ($1.50 per generation)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Switch to your own keys anytime</span>
                </div>
              </div>
            </div>
            
            {selectedOption === 'credits' && (
              <div className="p-1 bg-[#a259ff] rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Use Own API Keys Option */}
        <motion.div
          className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'own-keys'
              ? 'border-[#a259ff] bg-[#a259ff]/10'
              : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#1a1a1a]'
          }`}
          onClick={() => setSelectedOption('own-keys')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              selectedOption === 'own-keys' ? 'bg-[#a259ff]' : 'bg-[#2a2a2a]'
            }`}>
              <Key className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Add Your Own API Keys</h3>
              
              <p className="text-gray-300 mb-4">
                Use your own provider accounts for unlimited generations. You pay provider costs directly.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Unlimited generations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Pay provider costs directly (~$0.10-0.50 per generation)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Full control over your AI usage</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Requires main provider + fallback provider API keys</span>
                </div>
              </div>

              {selectedOption === 'own-keys' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-blue-300 mb-1">You'll need to configure a main and fallback provider.</p>
                      <p className="text-blue-300 mb-2">
                        <strong>Recommended:</strong> Anthropic (main) + OpenAI (fallback)
                      </p>
                      <div className="space-y-1">
                        <a 
                          href="https://console.anthropic.com/account/keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-xs"
                        >
                          Get Anthropic API key <ExternalLink className="w-3 h-3" />
                        </a>
                        <br />
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-xs"
                        >
                          Get OpenAI API key <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectedOption === 'own-keys' && (
              <div className="p-1 bg-[#a259ff] rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedOption || loading}
          className="px-8"
          size="lg"
        >
          {loading ? 'Setting up...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
} 