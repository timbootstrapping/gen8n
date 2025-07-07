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
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold mb-12">Loved by builders</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(({ name, avatar, text }, idx) => (
            <div 
              key={idx} 
              className="group bg-[#18181b] rounded-2xl p-8 flex flex-col gap-6 transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]"
            >
              <div className="flex items-center gap-4">
                <Image 
                  src={avatar} 
                  alt={name} 
                  width={48} 
                  height={48} 
                  className="rounded-full" 
                />
                <div>
                  <p className="font-semibold text-neutral-300 transition-all duration-300 group-hover:text-[#a78bfa]">{name}</p>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        strokeWidth={1} 
                        className="text-[#8b5cf6] fill-[#8b5cf6] transition-all duration-300 group-hover:text-[#a78bfa] group-hover:fill-[#a78bfa]" 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">"{text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 