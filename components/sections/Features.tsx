import { FileText, StickyNote, Key, MousePointerClick } from 'lucide-react';

const features = [
  {
    title: 'No-code Input',
    description: 'Just type what you need — no node dragging, ever.',
    icon: MousePointerClick
  },
  {
    title: 'Production JSON',
    description: 'Get real, importable n8n JSON files with notes per node.',
    icon: FileText
  },
  {
    title: 'Use Your API Keys',
    description: 'Bring your own OpenRouter/Claude key and bypass free limits.',
    icon: Key
  },
  {
    title: 'Sticky Notes',
    description: 'Every generated workflow includes visual notes per node.',
    icon: StickyNote
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ title, description, icon: Icon }, idx) => (
            <div key={idx} className="p-6 border border-border rounded-2xl flex flex-col gap-4 card-hover">
              <Icon size={32} strokeWidth={1} className="text-highlight icon-hover" />
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 