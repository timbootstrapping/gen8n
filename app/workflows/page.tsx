'use client';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDate } from '@/utils/formatDate';
import { truncate } from '@/utils/truncate';
import { Button } from '@/components/ui/Button';
import { Zap, Clipboard, Download, Trash2, X } from 'lucide-react';

interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  json: any;
  sticky_notes: Record<string, string>;
  status: 'pending' | 'ready' | 'error';
  created_at: string;
}

export default function WorkflowsPage() {
  const { loading, user } = useProtectedRoute();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [range, setRange] = useState<[number, number]>([0, 9]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeWf, setActiveWf] = useState<WorkflowRow | null>(null);

  // fetch initial
  useEffect(() => {
    if (!user) return;
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMore = async () => {
    const [from, to] = range;
    const { data } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (data) setWorkflows((prev) => [...prev, ...data]);
  };

  const handleShowMore = () => {
    setRange(([s, e]) => {
      const newRange: [number, number] = [s + 10, e + 10];
      fetchMore();
      return newRange;
    });
  };

  const filtered = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(search.toLowerCase()) ||
    wf.description.toLowerCase().includes(search.toLowerCase())
  );

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
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-gray-500';
      case 'pending':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleModalDelete = async (id: string) => {
    await confirmDelete(id);
    setShowModal(false);
    setActiveWf(null);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      <h1 className="text-3xl font-bold">Your Workflows</h1>

      {/* search */}
      <input
        type="text"
        placeholder="Search workflows..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl bg-[#1a1a1d] text-white p-2 rounded-xl border border-border focus:ring-2 focus:ring-highlight outline-none input-hover"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Zap size={40} strokeWidth={1} className="text-highlight drop-shadow-[0_0_6px_#5d5aff] icon-hover" />
          <p>No workflows found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((wf) => (
            <div key={wf.id} className="bg-surface rounded-2xl p-4 border border-border card-hover">
              <div className="mb-2">
                <h2 className="text-lg font-semibold truncate" title={wf.name}>{wf.name}</h2>
              </div>
              <p className="text-sm text-neutral-300 mb-3">{truncate(wf.description, 120)}</p>
              {wf.status !== 'ready' && (
                <p className={`text-xs ${getStatusStyle(wf.status)} mb-3`}>Status: {wf.status}</p>
              )}
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

      {/* show more */}
      {filtered.length >= range[1] + 1 && (
        <div className="text-center">
          <Button onClick={handleShowMore} className="hover-unified">Show More</Button>
        </div>
      )}

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