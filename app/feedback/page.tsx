import { Button } from '@/components/ui/Button';

export default function FeedbackPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Send Feedback</h1>
      <form className="space-y-6">
        <div>
          <label className="block mb-2">Type</label>
          <select className="w-full bg-transparent border border-border rounded-2xl px-4 py-2">
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="comment">Comment</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Content</label>
          <textarea rows={5} className="w-full bg-transparent border border-border rounded-2xl px-4 py-2" />
        </div>
        <Button>Submit</Button>
      </form>
    </div>
  );
} 