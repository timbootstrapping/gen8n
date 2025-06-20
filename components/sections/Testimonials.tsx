import Image from 'next/image';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/80?img=5',
    text: 'Gen8n saved me hours. Now I just describe what I need and tweak the JSON.'
  },
  {
    name: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/80?img=12',
    text: 'The sticky notes are a game-changer — perfect documentation out of the box.'
  },
  {
    name: 'Charlotte Lee',
    avatar: 'https://i.pravatar.cc/80?img=25',
    text: 'I went Pro right away. Unlimited workflows for the win!'
  }
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold">Loved by builders</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, avatar, text }, idx) => (
            <div key={idx} className="border border-border rounded-2xl p-6 flex flex-col gap-4 bg-background/60 card-hover">
              <div className="flex items-center gap-4">
                <Image src={avatar} alt={name} width={40} height={40} className="rounded-full" />
                <div>
                  <p className="font-medium">{name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} strokeWidth={1} className="text-highlight fill-highlight icon-hover" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">"{text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 