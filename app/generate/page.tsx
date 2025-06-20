'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import HeroStarfield from '@/components/ui/HeroStarfield';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    name: string;
    json: any;
  } | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      setResult({
        id: data.workflowId,
        name: data.name || 'Generated Workflow',
        json: data.workflow
      });
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
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
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
                    <Download size={16} className="mr-2" />
                    Download JSON
                  </Button>
                  
                  <Link href="/workflows">
                    <Button
                      intent="secondary"
                      size="lg"
                      className="hover-unified w-full sm:w-auto"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      View All Workflows
                    </Button>
                  </Link>

                  <Button
                    onClick={() => {
                      setResult(null);
                      setPrompt('');
                      setError('');
                    }}
                    intent="ghost"
                    size="lg"
                    className="hover-unified"
                  >
                    Generate Another
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "AI-Powered",
                description: "Advanced AI analyzes your requirements and generates optimal workflows"
              },
              {
                title: "Production-Ready", 
                description: "Generated workflows are immediately usable in your n8n instance"
              },
              {
                title: "No-Code Required",
                description: "Describe in plain English - no technical knowledge needed"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="backdrop-blur-sm bg-surface/10 border border-border/30 rounded-xl p-6 text-center card-hover"
              >
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
} 