import React, { useEffect, useState } from 'react';
import { INITIAL_DOMAINS } from '../../data/mockData';
import { Domain } from '../../types';
import { Code, Bot, Cpu, BarChart3, ShieldCheck, Cloud, Layout, Coffee, Terminal, Smartphone, TrendingUp, Binary, ChevronRight, BookOpen, Clock, Users } from 'lucide-react';

interface Props {
  onSelectDomain: (domain: Domain) => void;
  onApply: () => void;
  selectedDomainId?: string | null;
  searchTerm?: string;
  searchVersion?: number;
}

export const DomainGrid: React.FC<Props> = ({ onSelectDomain, onApply, selectedDomainId, searchTerm = '', searchVersion = 0 }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSyllabusDomain, setSelectedSyllabusDomain] = useState<Domain | null>(null);

  useEffect(() => {
    if (!selectedDomainId) return;

    setSelectedCategory('All');
    window.setTimeout(() => {
      document.getElementById(`domain-${selectedDomainId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }, [selectedDomainId]);

  const categories = ['All', 'Web Development', 'Artificial Intelligence and Machine Learning', 'Cloud', 'Security', 'Design'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code className="w-5 h-5 text-blue-600" />;
      case 'Bot': return <Bot className="w-5 h-5 text-purple-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-emerald-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-red-600" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-sky-600" />;
      case 'Layout': return <Layout className="w-5 h-5 text-pink-600" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-teal-600" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-violet-600" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-rose-600" />;
      default: return <Binary className="w-5 h-5 text-blue-600" />;
    }
  };

  const categoryFiltered = selectedCategory === 'All'
    ? INITIAL_DOMAINS
    : INITIAL_DOMAINS.filter((d) => d.category === selectedCategory);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filtered = normalizedSearchTerm
    ? categoryFiltered.filter((d) => `${d.name} ${d.category}`.toLowerCase().includes(normalizedSearchTerm))
    : categoryFiltered;

  useEffect(() => {
    if (!searchVersion || !normalizedSearchTerm || !filtered[0]) return;

    window.setTimeout(() => {
      document.getElementById(`domain-${filtered[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }, [searchVersion]);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-orange-50/10 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Explore <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">22+ Enterprise</span> Internship Domains
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Curated industry curricula designed by lead architects from Microsoft, Google, and Websums Software.
          </p>

          {/* Category Pill Filters */}
          <div className="flex flex-wrap justify-center gap-2 pt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dom) => (
            <div
              key={dom.id}
              id={`domain-${dom.id}`}
              className="bg-white rounded-[2rem] p-7 border border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100/50 border border-orange-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {getIcon(dom.iconName)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                    {dom.category}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-3 leading-tight">
                  {dom.name}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-6 font-medium">
                  {dom.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 relative z-10">
                <div className="flex items-center justify-between text-[12px] text-slate-600 font-bold">
                  <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>{dom.durationWeeks} Weeks</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>{dom.studentsEnrolled} Active</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedSyllabusDomain(dom)}
                    className="flex-1 py-3 text-xs font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center space-x-1.5 group/btn"
                  >
                    <BookOpen className="w-4 h-4 text-orange-500 group-hover/btn:scale-110 transition-transform" />
                    <span>Syllabus</span>
                  </button>
                  <button
                    onClick={onApply}
                    className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center space-x-1.5 group/btn"
                  >
                    <span>Apply</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Syllabus Modal Preview */}
        {selectedSyllabusDomain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedSyllabusDomain.name} Syllabus</h3>
                  <p className="text-xs text-slate-500">{selectedSyllabusDomain.durationWeeks} Weeks Detailed Curriculum</p>
                </div>
                <button
                  onClick={() => setSelectedSyllabusDomain(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {selectedSyllabusDomain.syllabus.map((week) => (
                  <div key={week.week} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="font-bold text-orange-600 text-xs">Week {week.week}: {week.title}</div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                      {week.topics.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => { setSelectedSyllabusDomain(null); onApply(); }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md"
                >
                  Enroll in this Domain
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
