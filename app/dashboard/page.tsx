"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/lib/useProtectedRoute";
import {
  CheckCircle,
  Clock,
  Zap,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  status: "pending" | "complete" | "error";
  created_at: string;
  json: any;
  sticky_notes: any;
}

export default function Dashboard() {
  const { loading, user } = useProtectedRoute();

  const [plan, setPlan] = useState<string>("-");
  const [usage, setUsage] = useState<number>(0);
  const [totalWorkflows, setTotalWorkflows] = useState<number>(0);
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowRow[]>([]);

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

    try {
      // send webhook
      await fetch('/api/workflow-webhook', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plan,
          name,
          description,
          nodes,
          baseUrl,
          api_keys: {
            openrouter: process.env.OPENROUTER_API_KEY || '',
            anthropic: process.env.ANTHROPIC_API_KEY || '',
          },
        }),
      });

      // store placeholder workflow row (pending)
      await supabase.from("workflows").insert({
        user_id: user.id,
        name,
        description,
        json: {},
        sticky_notes: {},
        status: "pending",
      });

      setFormMsg("Workflow request sent! It will appear in your list soon.");
      setName("");
      setDescription("");
      setNodes("");

      // refresh stats
      setTotalWorkflows((prev) => prev + 1);
      setUsage((prev) => prev + 1);
    } catch (err) {
      setFormMsg("Error sending request. Please try again.");
    } finally {
      setSubmitting(false);
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
    <div className="py-24 space-y-14">
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
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none transition-colors"
          />
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none transition-colors"
          />
          <input
            type="text"
            value={nodes}
            onChange={(e) => setNodes(e.target.value)}
            placeholder="Suggested nodes/services (optional)"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none transition-colors"
          />
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="n8n Base URL"
            className="bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none transition-colors"
          />
          {formMsg && <p className="text-sm text-highlight">{formMsg}</p>}
          <Button
            type="submit"
            intent="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Generating..." : "Generate Workflow"}
          </Button>
        </form>

        {/* View workflows card */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="flex items-center gap-3">
            <List
              size={28}
              strokeWidth={1}
              className="text-highlight drop-shadow-[0_0_6px_#5d5aff]"
            />
            <h2 className="text-2xl font-semibold">View All Workflows</h2>
          </div>
          <p className="text-gray-400">
            Manage and download your existing workflows
          </p>
          <Button intent="secondary" rounded="full" size="lg" onClick={() => (window.location.href = "/workflows")}
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
              className="text-highlight drop-shadow-[0_0_6px_#5d5aff]"
            />
            <p>No workflows yet</p>
            <Button onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}>
              Generate First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recentWorkflows.map((wf) => (
              <div
                key={wf.id}
                className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2 hover:bg-[#1a1a1a] transition-colors"
              >
                <h3 className="font-medium text-lg truncate" title={wf.name}>{wf.name}</h3>
                <p className="text-sm text-gray-400 capitalize">Status: {wf.status}</p>
                <p className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat(undefined, {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(wf.created_at))}
                </p>

                <div className="mt-2 flex gap-2 text-sm">
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => alert(JSON.stringify(wf.json, null, 2))}
                  >
                    Expand
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([
                        JSON.stringify(wf.json, null, 2),
                      ], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${wf.name}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={async () => {
                      if (confirm("Delete this workflow?")) {
                        await supabase
                          .from("workflows")
                          .delete()
                          .eq("id", wf.id);
                        setRecentWorkflows((prev) => prev.filter((w) => w.id !== wf.id));
                        setTotalWorkflows((prev) => prev - 1);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
    <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 hover:bg-[#1a1a1a] transition-colors group">
      <Icon
        size={32}
        strokeWidth={1}
        className="text-highlight group-hover:drop-shadow-[0_0_6px_#5d5aff] transition"
      />
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
} 