import { Button } from '@/components/ui/Button';

export default function GeneratePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Generate Workflow</h1>
      <form className="space-y-6">
        <div>
          <label className="block mb-2">Workflow Name *</label>
          <input type="text" name="name" required className="w-full bg-transparent border border-border rounded-2xl px-4 py-2" />
        </div>
        <div>
          <label className="block mb-2">Description *</label>
          <textarea name="description" required rows={4} className="w-full bg-transparent border border-border rounded-2xl px-4 py-2" />
        </div>
        <div>
          <label className="block mb-2">Suggested Nodes / Services</label>
          <input type="text" name="nodes" placeholder="e.g. Slack, Google Sheets" className="w-full bg-transparent border border-border rounded-2xl px-4 py-2" />
        </div>
        <div>
          <label className="block mb-2">n8n Base URL</label>
          <input type="url" name="baseUrl" defaultValue="https://n8n.ximus.io" className="w-full bg-transparent border border-border rounded-2xl px-4 py-2" />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
} 