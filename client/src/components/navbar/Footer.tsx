import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

interface FooterProps {
  onSelectDomain: (domainId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectDomain }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-[13px] border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-lg shadow-black/20 ring-1 ring-white/15 shrink-0">
                <img src="/logo.png" alt="Websums Software Private Limited logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Websums</span>
                <span className="block font-black text-base leading-tight tracking-tight">Software Private Limited</span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              Websums Software Private Limited Enterprise Internship Management System. Empowering 10,000+ engineers with industry-grade practical experience.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px] bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 9001:2025 Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm tracking-wide uppercase">Internship Domains</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#domains" onClick={(event) => { event.preventDefault(); onSelectDomain('dom-1'); }} className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>MERN Stack Development</span></a></li>
              <li><a href="#domains" onClick={(event) => { event.preventDefault(); onSelectDomain('dom-2'); }} className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>Artificial Intelligence & ML</span></a></li>
              <li><a href="#domains" onClick={(event) => { event.preventDefault(); onSelectDomain('dom-cloud'); }} className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>DevOps & Cloud Computing</span></a></li>
              <li><a href="#domains" onClick={(event) => { event.preventDefault(); onSelectDomain('dom-sec'); }} className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>Cyber Security & Pentesting</span></a></li>
              <li><a href="#domains" onClick={(event) => { event.preventDefault(); onSelectDomain('dom-uiux'); }} className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>UI/UX Design & Research</span></a></li>
            </ul>
          </div>

          {/* Verification & Portals */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm tracking-wide uppercase">Enterprise Portals</h4>
            <ul className="space-y-3 font-medium">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors flex items-center space-x-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-white font-bold">Verify Certificate</span>
                </a>
              </li>
              <li><a href="#" className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>CEO / Executive Dashboard</span></a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>Mentor Workspace</span></a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors flex items-center space-x-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span><span>Student Learning Hub</span></a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-bold text-white mb-5 text-sm tracking-wide uppercase">Headquarters</h4>
            <div className="space-y-4 font-medium">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="leading-relaxed">Udyog Indrakamal Apprt. Near MIT College, Beed bypass road, Chhatrapati Sambhajinagar (Aurangabad) 431001</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Mail className="w-4 h-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hover:text-orange-500 transition-colors cursor-pointer">support@websums.com</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hover:text-orange-500 transition-colors cursor-pointer">9822122101 / 9527929927</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[12px] font-medium">
          <p>© {new Date().getFullYear()} Websums Software Private Limited. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-500 transition-colors">ISO Audit Verification</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
