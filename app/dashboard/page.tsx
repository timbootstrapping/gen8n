"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";
import { formatDate } from '@/utils/formatDate';
import { truncate } from '@/utils/truncate';

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

  const [plan, setPlan] = useState<string>("-");
  const [usage, setUsage] = useState<number>(0);
  const [totalWorkflows, setTotalWorkflows] = useState<number>(0);
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowRow[]>([]);
  
  // modal state
  const [showModal, setShowModal] = useState(false);
  const [activeWf, setActiveWf] = useState<WorkflowRow | null>(null);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  // Fetch stats once user loaded
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data: userRow } = await supabase
        .from("users")
        .select("plan, usage_count")
        .eq("id", user.id)
        .single();

      if (userRow) {
        setPlan(userRow.plan ?? "-");
        setUsage(userRow.usage_count ?? 0);
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
      const triggerRes = await fetch("/api/trigger-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: workflowId,
          name,
          description,
          nodes,
          base_url: baseUrl,
          user_id: user.id,
          email: user.email,
          api_keys: {
            openrouter: (user.user_metadata as any)?.openrouter_key ?? process.env.OPENROUTER_API_KEY ?? null,
            anthropic: (user.user_metadata as any)?.anthropic_key ?? process.env.ANTHROPIC_API_KEY ?? null,
          },
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
    setShowModal(true);
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
      setTotalWorkflows((prev) => prev - 1);
    }
  };

  const handleModalDelete = async (id: string) => {
    await confirmDelete(id);
    setShowModal(false);
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
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.first_name}!</h1>
          <p className="text-gray-400">Ready to generate some amazing n8n workflows?</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard title="Plan" value={plan} Icon={Zap} />
        <StatCard title="Usage This Month" value={usage.toString()} Icon={Clock} />
        <StatCard title="Total Workflows" value={totalWorkflows.toString()} Icon={CheckCircle} />
      </div>

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
            placeholder="Description"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none input-hover resize-none"
          />
          <input
            type="text"
            value={nodes}
            onChange={(e) => setNodes(e.target.value)}
            placeholder="Suggested nodes/services (optional)"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none input-hover"
          />
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="n8n Base URL"
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

        {/* View workflows card */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-6 card-hover">
          <div className="flex items-center gap-3">
            <List
              size={28}
              strokeWidth={1}
              className="text-highlight drop-shadow-[0_0_6px_#5d5aff] icon-hover"
            />
            <h2 className="text-2xl font-semibold">View All Workflows</h2>
          </div>
          <p className="text-gray-400">
            Manage and download your existing workflows
          </p>
          <Button intent="secondary" rounded="full" size="lg" onClick={() => (window.location.href = "/workflows")} className="hover-unified"
          >
            View All Workflows
          </Button>
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
              className="text-highlight drop-shadow-[0_0_6px_#5d5aff] icon-hover"
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
                      className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#5d5aff] hover:border-highlight action-hover"
                    >
                      <Clipboard size={14} className="text-neutral-300 hover:text-white transition-colors" />
                    </button>
                    <button 
                      onClick={() => downloadJSON(wf)} 
                      title="Download JSON"
                      className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#5d5aff] hover:border-highlight action-hover"
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

      {/* modal */}
      {showModal && activeWf && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 modal-scrollbar">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{activeWf.name}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                title="Close"
                className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#5d5aff] hover:border-highlight action-hover"
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
                  className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#5d5aff] hover:border-highlight action-hover"
                >
                  <Clipboard size={14} className="text-neutral-300 hover:text-white transition-colors" />
                </button>
                <button 
                  onClick={() => downloadJSON(activeWf)} 
                  title="Download JSON"
                  className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#3a3a3d] border border-border transition-all duration-200 hover:shadow-[0_0_8px_#5d5aff] hover:border-highlight action-hover"
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

function StatCard({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string;
  Icon: IconType;
}) {
  return (
    <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 card-hover group">
      <Icon
        size={32}
        strokeWidth={1}
        className="text-highlight group-hover:drop-shadow-[0_0_6px_#5d5aff] transition icon-hover"
      />
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
} 