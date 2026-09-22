import React, { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Send, MessageSquarePlus } from 'lucide-react';

const INITIAL_TESTIMONIALS = [
    {
      name: 'Dr. Suresh Belhekar',
      role: 'Chairman, Belhekar Group of Institute',
      domain: '',
      image: '',
      text: 'Websums Software gave me practical learning and helped me grow with confidence.'
    },
    {
      name: 'Vishal Waghchaure',
      role: 'Owner, Waghchaure Lawance',
      domain: '',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'A great platform with useful guidance, practical work, and a supportive team.'
    },
    {
      name: 'Samaj Bhushan Eknathrao Dhakne',
      role: 'College of Engineering, Shegaon',
      domain: '',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      text: 'The training was helpful, simple to understand, and valuable for students.'
    },
    {
      name: 'Dnyaneshwar Polytechnic',
      role: 'Principal, Ahire Sir',
      domain: '',
      image: '',
      text: 'An excellent initiative that supports education and innovation.'
    }
  ];

export const TestimonialsSection: React.FC = () => {
  const [allTestimonials, setAllTestimonials] = useState(INITIAL_TESTIMONIALS);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useRef<1 | -1>(1);

  useEffect(() => {
    const autoScroll = window.setInterval(() => {
      const carousel = testimonialsRef.current;
      if (!carousel) return;

      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      const reachedEnd = carousel.scrollLeft >= maxScrollLeft - 8;
      const reachedStart = carousel.scrollLeft <= 8;

      if (reachedEnd) scrollDirection.current = -1;
      if (reachedStart) scrollDirection.current = 1;

      carousel.scrollBy({
        left: scrollDirection.current * carousel.clientWidth,
        behavior: 'smooth'
      });
    }, 4500);

    return () => window.clearInterval(autoScroll);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    domain: '',
    text: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;

    const newTestimonial = {
      ...formData,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&size=150`,
    };

    setAllTestimonials([newTestimonial, ...allTestimonials]);
    setFormData({ name: '', role: '', domain: '', text: '' });
  };

  const scrollTestimonials = (direction: 'left' | 'right') => {
    testimonialsRef.current?.scrollBy({
      left: direction === 'right' ? testimonialsRef.current.clientWidth : -testimonialsRef.current.clientWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f5f5f4] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-5 pt-6 text-center">
          <h2 className="text-4xl font-black leading-[1.1] tracking-[-0.04em] text-slate-900 md:text-7xl">
            Loved by <span className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] bg-clip-text text-transparent">10,000+</span> Students &amp; Engineers
          </h2>
          <p className="text-lg font-medium text-slate-600 md:text-2xl">
            Read real stories from our alumni who secured high-paying tech roles.
          </p>
        </div>

        <div className="relative mt-12 md:mt-16">
          <div
            ref={testimonialsRef}
            className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {allTestimonials.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex min-h-[270px] w-full shrink-0 snap-start flex-col justify-between rounded-[2rem] border border-slate-200 bg-[#f8f8f7] p-6 shadow-[0_12px_24px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]"
              >
                <Quote className="absolute right-5 top-5 h-10 w-10 text-slate-200 transition-all duration-300 group-hover:scale-110 group-hover:text-slate-300" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xl font-medium leading-relaxed text-slate-700 italic">
                    "{item.text}"
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-bold text-slate-900">{item.name}</h4>
                    <p className="text-base font-semibold text-blue-600">{item.role}</p>
                    {item.domain && <p className="text-sm font-medium text-slate-500">{item.domain}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allTestimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => scrollTestimonials('left')}
                aria-label="Scroll testimonials left"
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-x-1 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Testimonials</span>
              <button
                onClick={() => scrollTestimonials('right')}
                aria-label="Scroll testimonials right"
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-all duration-300 hover:translate-x-1 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
