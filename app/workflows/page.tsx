'use client';

import { useProtectedRoute } from '@/lib/useProtectedRoute';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDate } from '@/utils/formatDate';
import { truncate } from '@/utils/truncate';
import { Button } from '@/components/ui/Button';
import { Zap } from 'lucide-react';

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
    const blob = new Blob([JSON.stringify(wf.json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wf.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = (wf: WorkflowRow) => {
    navigator.clipboard.writeText(JSON.stringify(wf.json, null, 2));
    alert('Copied to clipboard');
  };

  const confirmDelete = async (id: string) => {
    if (confirm('Delete this workflow?')) {
      await supabase.from('workflows').delete().eq('id', id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    }
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold truncate" title={wf.name}>{wf.name}</h2>
                <span className="text-xs text-neutral-400">{formatDate(wf.created_at)}</span>
              </div>
              <p className="text-sm text-neutral-300 mb-3">{truncate(wf.description, 120)}</p>
              {wf.status !== 'ready' && (
                <p className="text-xs text-yellow-400">Status: {wf.status}</p>
              )}
              <div className="flex gap-2 flex-wrap mt-2">
                <Button size="sm" onClick={() => openModal(wf)} className="action-hover">View</Button>
                <Button intent="secondary" size="sm" onClick={() => downloadJSON(wf)} className="action-hover">Download</Button>
                <Button intent="secondary" size="sm" onClick={() => copyJSON(wf)} className="action-hover">Copy</Button>
                <Button intent="secondary" size="sm" className="danger-hover" onClick={() => confirmDelete(wf.id)}>Delete</Button>
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
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-xl font-semibold">{activeWf.name}</h2>
            <pre className="text-sm bg-[#1a1a1d] p-4 border border-border overflow-auto max-h-[400px] rounded-xl text-foreground">
{JSON.stringify(activeWf.json, null, 2)}
            </pre>
            <div>
              {Object.entries(activeWf.sticky_notes || {}).map(([node, note]) => (
                <div key={node} className="mt-2">
                  <strong className="text-highlight">{node}:</strong>
                  <p className="text-sm text-neutral-300">{note}</p>
                </div>
              ))}
            </div>
            <Button intent="secondary" onClick={() => setShowModal(false)} className="hover-unified">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 