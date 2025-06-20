import { Code2, Wand2, Download } from 'lucide-react';

const steps = [
  {
    title: 'Describe Your Workflow',
    description: 'Tell us what you want to automate. Add services, steps, triggers.',
    icon: Code2
  },
  {
    title: 'AI Generates',
    description: 'Gen8n analyzes your input and builds the JSON using best practices.',
    icon: Wand2
  },
  {
    title: 'Import & Run',
    description: 'Copy or download your file, paste into n8n — automation done.',
    icon: Download
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map(({ title, description, icon: Icon }, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-4 p-6 border border-border rounded-2xl card-hover">
              <Icon size={36} strokeWidth={1} className="text-highlight icon-hover" />
              <h3 className="text-xl font-medium">{title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 