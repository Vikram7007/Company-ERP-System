import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Award, Users, BookOpen, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const TYPING_WORDS = ['Enterprise Level', 'Production Grade', 'Industry Standard', 'High Impact'];

interface Props {
  onApply: () => void;
  onVerify: () => void;
}

export const HeroSection: React.FC<Props> = ({ onApply, onVerify }) => {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
        if (currentText.length <= 1) { // stop exactly when empty
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }
      }, 40);
    } else {
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
        if (currentText.length === currentWord.length) {
          timeout = setTimeout(() => setIsDeleting(true), 2500);
        }
      }, 90);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, wordIndex]);

  return (
    <section className="relative overflow-hidden pt-16 pb-24 bg-gradient-to-b from-orange-50/80 via-white to-orange-50/30 rounded-[2.5rem] border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
      {/* Decorative Warm Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[4000ms]"></div>
      <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-amber-400/15 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>ISO 9001:2025 Certified Enterprise Internship Portal</span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto space-y-6 relative z-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            Accelerate Your Tech Career with <br className="hidden md:block" />
            <span className="inline-flex min-w-[220px] sm:min-w-[280px] md:min-w-[340px] justify-center mt-2 md:mt-0 md:mr-3">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent border-r-4 border-orange-500 pr-1.5 animate-[pulse_1s_ease-in-out_infinite]">
                {currentText || '\u00A0'}
              </span>
            </span>
            Internships
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Websums Software Pvt. Ltd. delivers hands-on industry experience across 22+ domains with live mentor guidance, production codebases, and QR-verifiable certificates.
          </p>

          {/* CTA Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
            <button
              onClick={onApply}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <span>Apply for Internship</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            <button
              onClick={onVerify}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 rounded-full shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <Award className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              <span>Verify Student Certificate</span>
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-16 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm py-2 px-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200/60 hover:-translate-y-1.5 transition-all duration-300 text-center group cursor-default">
              <div className="text-3xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">10,000+</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Interns Trained</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm py-2 px-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200/60 hover:-translate-y-1.5 transition-all duration-300 text-center group cursor-default">
              <div className="text-3xl font-black text-orange-600 group-hover:scale-105 transition-transform">22+</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Domains</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm py-2 px-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200/60 hover:-translate-y-1.5 transition-all duration-300 text-center group cursor-default">
              <div className="text-3xl font-black text-emerald-500 group-hover:text-emerald-600 transition-colors">98.4%</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Placement Rate</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm py-2 px-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200/60 hover:-translate-y-1.5 transition-all duration-300 text-center group cursor-default">
              <div className="text-3xl font-black text-purple-500 group-hover:text-purple-600 transition-colors">500+</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Hiring Partners</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
