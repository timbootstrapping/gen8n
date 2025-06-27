"use client";

import { useEffect, useState, useRef } from "react";
import { useProtectedRoute } from "@/lib/useProtectedRoute";
import {
  CheckCircle,
  Clock,
  Zap,
  List,
  Clipboard,
  Download,
  Trash2,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from '@/components/ui/Button';
import { supabase } from "@/lib/supabaseClient";
import { formatDate } from '@/utils/formatDate';
import { truncate } from '@/utils/truncate';
import { motion } from 'framer-motion';

interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  status: "pending" | "complete" | "error";
  created_at: string;
  json: any;
  sticky_notes: Record<string, string>;
}

export default function Dashboard() {
  const { loading, user } = useProtectedRoute();

  const [firstName, setFirstName] = useState<string>("");
  const [plan, setPlan] = useState<string>("-");
  const [usage, setUsage] = useState<number>(0);
  const [totalWorkflows, setTotalWorkflows] = useState<number>(0);
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowRow[]>([]);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowRow[]>([]);
  
  // slide-out state
  const [showSlideOut, setShowSlideOut] = useState(false);
  const [activeWf, setActiveWf] = useState<WorkflowRow | null>(null);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  // Fetch stats once user loaded
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("first_name, plan, usage_count")
        .eq("id", user.id)
        .single();

      if (userRow && !userError) {
        setFirstName(userRow.first_name || "");
        setPlan(userRow.plan ?? "-");
        setUsage(userRow.usage_count ?? 0);
      }

      // If no first name found in users table, try auth metadata
      if (!userRow?.first_name || userError) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user?.user_metadata?.first_name) {
          setFirstName(authUser.user.user_metadata.first_name);
        }
      }

      // total workflows count
      const { count } = await supabase
        .from("workflows")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (typeof count === "number") setTotalWorkflows(count);

      // recent 3 workflows
      const { data: recent } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setRecentWorkflows(recent ?? []);

      // all workflows for the "View all Workflows" section
      const { data: all } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAllWorkflows(all ?? []);
    };

    fetchStats();
  }, [user]);

  // handle workflow generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setFormMsg("");

    let workflowId: string | null = null;

    try {
      // 1. Insert placeholder row and capture the new workflow ID
      const { data: insertData, error: insertError } = await supabase
        .from("workflows")
        .insert({
          user_id: user.id,
          name,
          description,
          json: {},
          sticky_notes: {},
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !insertData) throw insertError || new Error("Insert failed");

      workflowId = insertData.id;

      // 2. Trigger the workflow generation webhook via our API
      // Get the current session and access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');

      const triggerRes = await fetch("/api/trigger-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          name,
          description,
          nodes,
          user_id: user.id,
        }),
      });

      if (!triggerRes.ok) throw new Error("Webhook trigger failed");

      // 3. Success UI updates
      setFormMsg("Workflow request sent! It will appear in your list soon.");
      setName("");
      setDescription("");
      setNodes("");

      // refresh stats
      setTotalWorkflows((prev) => prev + 1);
      setUsage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      // rollback placeholder if created
      if (workflowId) {
        await supabase.from("workflows").delete().eq("id", workflowId);
      }
      setFormMsg("Error sending request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal and workflow helper functions
  const openModal = (wf: WorkflowRow) => {
    setActiveWf(wf);
    setShowSlideOut(true);
  };

  const downloadJSON = (wf: WorkflowRow) => {
    const jsonData = typeof wf.json === "string" ? JSON.parse(wf.json) : wf.json;
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wf.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = (wf: WorkflowRow) => {
    const jsonData = typeof wf.json === "string" ? JSON.parse(wf.json) : wf.json;
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert('Copied to clipboard');
  };

  const confirmDelete = async (id: string) => {
    if (confirm('Delete this workflow?')) {
      await supabase.from('workflows').delete().eq('id', id);
      setRecentWorkflows((prev) => prev.filter((w) => w.id !== id));
      setAllWorkflows((prev) => prev.filter((w) => w.id !== id));
      setTotalWorkflows((prev) => prev - 1);
    }
  };

  const handleModalDelete = async (id: string) => {
    await confirmDelete(id);
    setShowSlideOut(false);
    setActiveWf(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-gray-500';
      case 'pending':
        return 'text-yellow-400';
      case 'error':
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 space-y-14">
      {/* Header */}
      <div className="flex justify-between items-start flex-col md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-gray-400">Ready to generate some amazing n8n workflows?</p>
        </div>
      </div>

      {/* Statistics Cards Section */}
      <DashboardStats
        credits={usage}
        isPremium={plan === "premium"}
        workflowsMonth={totalWorkflows}
        workflowsTotal={totalWorkflows}
        hoursSaved={0}
      />

      {/* Action panel */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Generate form */}
        <form
          onSubmit={handleGenerate}
          className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-2xl font-semibold mb-2">Generate New Workflow</h2>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workflow Name"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none input-hover"
          />
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Generate me a workflow that ..."
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none input-hover resize-none"
          />
          <input
            type="text"
            value={nodes}
            onChange={(e) => setNodes(e.target.value)}
            placeholder="Suggested nodes (optional)"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none input-hover"
          />
          {formMsg && <p className="text-sm text-highlight">{formMsg}</p>}
          <Button
            type="submit"
            intent="primary"
            className="w-full hover-unified"
            disabled={submitting}
          >
            {submitting ? "Generating..." : "Generate Workflow"}
          </Button>
        </form>

        {/* View workflows section */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <List
              size={28}
              strokeWidth={1}
              className="text-highlight drop-shadow-[0_0_6px_#8b5cf6] icon-hover"
            />
            <h2 className="text-2xl font-semibold">View All Workflows</h2>
          </div>
          
          {allWorkflows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <p className="text-gray-400">
                Manage and download your existing workflows
              </p>
              <Button intent="secondary" rounded="full" size="lg" onClick={() => (window.location.href = "/workflows")} className="hover-unified">
                View All Workflows
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {allWorkflows.slice(0, 5).map((wf) => (
                <div 
                  key={wf.id} 
                  className="flex items-center justify-between p-3 bg-[#1a1a1d] border border-border rounded-xl hover:bg-[#2a2a2d] transition-all duration-200 cursor-pointer card-hover"
                  onClick={() => openModal(wf)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 text-center">
                      <span className="text-lg font-semibold text-highlight">
                        {wf.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(wf.status)}`}>
                      {wf.status}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(wf.created_at)}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              ))}
              {allWorkflows.length > 5 && (
                <div className="text-center pt-4">
                  <Button intent="secondary" size="sm" onClick={() => (window.location.href = "/workflows")} className="hover-unified">
                    View All {allWorkflows.length} Workflows
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      


      {/* Recent workflows */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recent Workflows</h2>

        {recentWorkflows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Zap
              size={40}
              strokeWidth={1}
              className="text-highlight drop-shadow-[0_0_6px_#8b5cf6] icon-hover"
            />
            <p>No workflows yet</p>
            <Button onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })} className="hover-unified">
              Generate First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recentWorkflows.map((wf) => (
              <div key={wf.id} className="bg-surface rounded-2xl p-4 border border-border card-hover">
                <div className="mb-2">
                  <h2 className="text-lg font-semibold truncate" title={wf.name}>{wf.name}</h2>
                </div>
                <p className="text-sm text-neutral-300 mb-3">{truncate(wf.description, 120)}</p>
                <p className={`text-xs ${getStatusStyle(wf.status)} mb-3`}>Status: {wf.status}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => openModal(wf)} className="action-hover">View</Button>
                    <button 
                      onClick={() => copyJSON(wf)} 
                      title="Copy JSON"
                      className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#8b5cf6] hover:border-highlight action-hover"
                    >
                      <Clipboard size={14} className="text-neutral-300 hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => downloadJSON(wf)} 
                      title="Download JSON"
                      className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#8b5cf6] hover:border-highlight action-hover"
                    >
                      <Download size={14} className="text-neutral-300 hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(wf.id)} 
                      title="Delete Workflow"
                      className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-red-600 border border-border transition-all duration-200 hover:shadow-[0_0_8px_#ff4444] hover:border-red-400 danger-hover"
                    >
                      <Trash2 size={14} className="text-neutral-300 hover:text-white transition-colors" />
                    </button>
                  </div>
                  <span className="text-xs text-neutral-400 ml-2">{formatDate(wf.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* slide-out */}
      {showSlideOut && activeWf && (
        <div className="fixed inset-0 bg-black/60 z-50 flex">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={() => setShowSlideOut(false)}
          />
          <div className="bg-surface border-l border-border w-full max-w-2xl h-full overflow-y-auto p-6 space-y-4 modal-scrollbar animate-slide-in-right">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{activeWf.name}</h2>
              <button 
                onClick={() => setShowSlideOut(false)} 
                title="Close"
                className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#8b5cf6] hover:border-highlight action-hover"
              >
                <X size={16} className="text-neutral-300 hover:text-white transition-colors" />
              </button>
            </div>
            <div className="relative">
              <pre className="text-sm bg-[#1a1a1d] p-4 border border-border overflow-auto max-h-[400px] rounded-xl text-foreground json-scrollbar">
{JSON.stringify(typeof activeWf.json === "string" ? JSON.parse(activeWf.json) : activeWf.json, null, 2)}
              </pre>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                  onClick={() => copyJSON(activeWf)} 
                  title="Copy JSON"
                  className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#8b5cf6] hover:border-highlight action-hover"
                >
                  <Clipboard size={14} className="text-neutral-300 hover:text-white transition-colors" />
                </button>
                <button 
                  onClick={() => downloadJSON(activeWf)} 
                  title="Download JSON"
                  className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#8b5cf6] hover:border-highlight action-hover"
                >
                  <Download size={14} className="text-neutral-300 hover:text-white transition-colors" />
                </button>
                <button 
                  onClick={() => handleModalDelete(activeWf.id)} 
                  title="Delete Workflow"
                  className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-red-600 border border-border transition-all duration-200 hover:shadow-[0_0_8px_#ff4444] hover:border-red-400 danger-hover"
                >
                  <Trash2 size={14} className="text-neutral-300 hover:text-white transition-colors" />
                </button>
              </div>
            </div>
            <div>
              {Object.entries(activeWf.sticky_notes || {}).map(([node, note]) => (
                <div key={node} className="mt-2">
                  <strong className="text-highlight">{node}:</strong>
                  <p className="text-sm text-neutral-300">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */

type IconType = typeof Zap;

function DashboardStats({
  credits,
  isPremium,
  workflowsMonth,
  workflowsTotal,
  hoursSaved,
}: {
  credits: number;
  isPremium: boolean;
  workflowsMonth: number;
  workflowsTotal: number;
  hoursSaved: number;
}) {
  // Animation variants for Framer Motion
  const cardVariants = {
    initial: { y: 0, boxShadow: '0 0 0 #0000' },
    hover: { y: -6, boxShadow: '0 4px 32px #8b5cf633' },
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {/* Card 1: Credits Remaining */}
      <motion.div
        className="bg-[#18181A] rounded-2xl p-6 flex flex-col gap-2 border border-[#232326] group cursor-pointer transition relative"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        <div className="flex items-center gap-2 mb-2 relative">
          <Zap size={22} className="text-[#8b5cf6]" />
          <span className="text-white text-lg font-semibold">{isPremium ? 'Unlimited Credits' : 'Credits Remaining'}</span>
        </div>
        <motion.div
          className="text-4xl font-bold text-[#8b5cf6] mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {isPremium ? (
            <span className="text-[#8b5cf6]">∞</span>
          ) : (
            <AnimatedCount value={credits} />
          )}
        </motion.div>
        <span className="text-sm text-[#8a8a8a]">{isPremium ? 'Premium: Unlimited Credits' : 'AI Generations Left'}</span>
      </motion.div>

      {/* Card 2: Workflows Generated */}
      <motion.div
        className="bg-[#18181A] rounded-2xl p-6 flex flex-col gap-2 border border-[#232326] group cursor-pointer transition relative"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        <div className="flex items-center gap-2 mb-2 relative">
          <List size={22} className="text-[#8b5cf6]" />
          <span className="text-white text-lg font-semibold">Workflows Generated</span>
        </div>
        <motion.div
          className="text-4xl font-bold text-[#8b5cf6] mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <AnimatedCount value={workflowsMonth} />
          <span className="text-base text-[#8a8a8a] ml-2">this month</span>
          <span className="text-base text-[#8a8a8a] ml-2">/</span>
          <AnimatedCount value={workflowsTotal} />
          <span className="text-base text-[#8a8a8a] ml-2">total</span>
        </motion.div>
      </motion.div>

      {/* Card 3: AI Automation Time Saved */}
      <motion.div
        className="bg-[#18181A] rounded-2xl p-6 flex flex-col gap-2 border border-[#232326] group cursor-pointer transition relative"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
      >
        <div className="flex items-center gap-2 mb-2 relative">
          <Clock size={22} className="text-[#8b5cf6]" />
          <span className="text-white text-lg font-semibold">Time Saved</span>
        </div>
        <motion.div
          className="text-4xl font-bold text-[#8b5cf6] mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <AnimatedCount value={hoursSaved} />
          <span className="text-base text-[#8a8a8a] ml-2">estimated hours saved</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- AnimatedCount helper ---
function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = { val: 0 };
    const duration = 1.2;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(progress * value);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    animate(performance.now());
    return () => {};
  }, [value]);
  return <span>{display}</span>;
} 
