'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import HeroStarfield from '@/components/ui/HeroStarfield';
import { ArrowLeft, Download, ExternalLink, CreditCard, Key, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';
import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { getUserCreditBalance } from '@/lib/creditHelpers';

interface CreditBalance {
  credits: number;
  reserved_credits: number;
  use_own_api_keys: boolean;
  has_required_api_keys: boolean;
  main_provider: string | null;
  fallback_provider: string | null;
}

export default function GeneratePage() {
  const { loading: authLoading, user } = useProtectedRoute();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    name: string;
    json: any;
  } | null>(null);
  const [error, setError] = useState('');
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Load credit balance
  useEffect(() => {
    if (!user) return;
    
    const loadBalance = async () => {
      setBalanceLoading(true);
      const balance = await getUserCreditBalance(user.id);
      setCreditBalance(balance);
      setBalanceLoading(false);
    };

    loadBalance();
  }, [user]);

  const availableCredits = creditBalance ? creditBalance.credits - creditBalance.reserved_credits : 0;

  const canGenerate = creditBalance && (
    (creditBalance.use_own_api_keys && creditBalance.has_required_api_keys) ||
    (!creditBalance.use_own_api_keys && availableCredits > 0)
  );

  const getStatusMessage = () => {
    if (!creditBalance) return '';
    
    if (creditBalance.use_own_api_keys) {
      if (creditBalance.has_required_api_keys) {
        return `Using your API keys (${creditBalance.main_provider} + ${creditBalance.fallback_provider}) • Unlimited generations`;
      } else {
        return 'Missing required API keys • Need both main and fallback providers in settings';
      }
    } else {
      if (availableCredits > 0) {
        const reservedText = creditBalance.reserved_credits > 0 
          ? ` (${creditBalance.reserved_credits} reserved)`
          : '';
        return `${availableCredits} credit${availableCredits === 1 ? '' : 's'} available${reservedText}`;
      } else {
        return creditBalance.reserved_credits > 0
          ? `${creditBalance.reserved_credits} credit${creditBalance.reserved_credits === 1 ? '' : 's'} reserved • Purchase more or add API keys`
          : 'No credits available • Purchase credits or add API keys';
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    if (!canGenerate) {
      setError('Cannot generate workflows. Please check your credit balance or API keys.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          user_id: user!.id,
          workflow_id: `workflow_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate workflow');
      }

      const data = await response.json();
      setResult({
        id: data.workflowId || 'generated',
        name: data.name || 'Generated Workflow',
        json: data.workflow || data
      });

      // Refresh balance after successful generation
      if (user) {
        const newBalance = await getUserCreditBalance(user.id);
        setCreditBalance(newBalance);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadWorkflow = () => {
    if (!result) return;
    
    const blob = new Blob([JSON.stringify(result.json, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading || balanceLoading) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <HeroStarfield />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Starfield Background */}
      <div className="absolute inset-0 z-0">
        <HeroStarfield />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground nav-hover"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="backdrop-blur-xl bg-surface/20 border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-5xl font-bold mb-4 text-foreground"
              >
                Generate a Production-Ready n8n Workflow
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-foreground/80 max-w-2xl mx-auto"
              >
                Describe what you need in plain English. Gen8n will generate the complete JSON workflow for you.
              </motion.p>
            </div>

            {/* Status Banner */}
            {creditBalance && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`mb-6 p-4 rounded-2xl border ${
                  canGenerate 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {creditBalance.use_own_api_keys ? (
                      <Key className="w-5 h-5" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    <span className="font-medium">{getStatusMessage()}</span>
                  </div>
                  
                  {!canGenerate && (
                    <Link href="/settings">
                      <Button 
                        size="sm" 
                        className="bg-[#a259ff] hover:bg-[#9333ea]"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Fix in Settings
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {!result ? (
              /* Generation Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-3">
                    Workflow Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a workflow that monitors a Slack channel for new messages, extracts important information using AI, and saves it to a Google Sheet..."
                    rows={6}
                    className="w-full bg-surface/30 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder-foreground/50 focus:border-highlight/50 focus:outline-none focus:ring-2 focus:ring-highlight/20 backdrop-blur-sm input-hover resize-none"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim() || !canGenerate}
                    size="lg"
                    className="hover-unified"
                  >
                    {isLoading ? 'Generating...' : 'Generate Workflow'}
                  </Button>
                  
                  <Link href="/dashboard">
                    <Button
                      intent="secondary"
                      size="lg"
                      className="hover-unified w-full sm:w-auto"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>

                {!canGenerate && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-3">
                      To generate workflows, you need either:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                      <div className="bg-surface/20 border border-border/30 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-[#a259ff] font-medium mb-1">
                          <CreditCard className="w-4 h-4" />
                          Gen8n Credits
                        </div>
                        <p className="text-gray-400">Purchase credits for $1.50 per generation</p>
                      </div>
                      <div className="bg-surface/20 border border-border/30 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-[#a259ff] font-medium mb-1">
                          <Key className="w-4 h-4" />
                          Your API Keys
                        </div>
                        <p className="text-gray-400">Use your own keys for unlimited generations</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Results Display */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Workflow Generated Successfully!</h2>
                  <p className="text-foreground/70">{result.name}</p>
                </div>

                <div className="bg-surface/30 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
                  <pre className="text-sm text-foreground/90 overflow-auto max-h-[400px] leading-relaxed">
                    {JSON.stringify(result.json, null, 2)}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={downloadWorkflow}
                    className="hover-unified"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setResult(null);
                      setPrompt('');
                      setError('');
                    }}
                    intent="secondary"
                    className="hover-unified"
                    size="lg"
                  >
                    Generate Another
                  </Button>
                  
                  <Link href="/dashboard">
                    <Button
                      intent="secondary"
                      size="lg"
                      className="hover-unified w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
} 