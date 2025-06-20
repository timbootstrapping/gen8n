const faqs = [
  {
    q: 'How do I use Gen8n?',
    a: 'Fill out the form, wait ~15 sec, download the JSON.'
  },
  {
    q: 'Can I import the file into my own n8n?',
    a: 'Yes. Every file is production-ready and fully editable.'
  },
  {
    q: 'Do I need my own Claude/OpenAI key?',
    a: 'Optional. If you go beyond free limits, we let you bring your own.'
  },
  {
    q: 'Will this build perfect workflows?',
    a: 'No — but they\'re great starting points with sticky notes per node.'
  }
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold">FAQ</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map(({ q, a }) => (
            <details key={q} className="border border-border rounded-2xl p-4 card-hover">
              <summary className="cursor-pointer list-none flex justify-between items-center">
                <span>{q}</span>
                <span className="text-highlight icon-hover">+</span>
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
} 