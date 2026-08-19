import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Send, Upload, ShieldCheck, Loader2, Link2, Check } from 'lucide-react';
import { INITIAL_DOMAINS } from '../../data/mockData';
import { useData } from '../../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addApplication } = useData();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    domain: INITIAL_DOMAINS[0]?.name || 'MERN Stack Development',
    resumeLink: '',
    statement: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  if (!isOpen) return null;

  const validateUrl = (url: string) => {
    if (!url || !url.trim()) return true;
    const pattern = /^(https?:\/\/)?(www\.)?[\w#-]+(\.[\w#-]+)+[/\w-./?%&=]*$/i;
    return pattern.test(url.trim());
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone / WhatsApp number is required';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'University / College Name is required';
    }

    if (!formData.domain) {
      newErrors.domain = 'Please select an internship domain';
    }

    if (formData.resumeLink && !validateUrl(formData.resumeLink)) {
      newErrors.resumeLink = 'Please enter a valid Google Drive, LinkedIn or Portfolio URL';
    }

    if (formData.statement && formData.statement.length > 500) {
      newErrors.statement = 'Statement must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `APP-W2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setApplicationId(generatedId);

      addApplication({
        applicantName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        domain: formData.domain,
        college: formData.college,
        resumeUrl: formData.resumeLink || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        statement: formData.statement
      });

      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const isResumeUrlValid = formData.resumeLink.trim().length > 0 && validateUrl(formData.resumeLink);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] max-w-[740px] w-[calc(100%-32px)] p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative max-h-[90vh] overflow-y-auto">
        
        {/* Accessible Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application modal"
          className="absolute top-4 right-4 w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all duration-150"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="text-center py-6 sm:py-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-9 h-9" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Application Submitted Successfully! 🎉</h3>
              <p className="text-xs text-slate-500 font-medium">Reference ID: <span className="font-mono font-bold text-slate-800">{applicationId}</span></p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 max-w-md mx-auto space-y-2">
              <p>
                Thank you, <strong className="text-slate-900">{formData.fullName}</strong>! Our admissions & mentor team will review your application for <strong className="text-blue-600">{formData.domain}</strong> within 24 hours.
              </p>
              <p className="text-[11px] text-slate-500">
                A confirmation has been sent to <strong className="text-slate-800">{formData.email}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setSubmitted(false); onClose(); }}
              className="px-8 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all duration-150"
            >
              Done & Return to Site
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            {/* Header Section */}
            <div className="flex items-center space-x-3.5 pb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Apply for Enterprise Internship</h3>
                <p className="text-xs text-slate-500 font-medium">Websums Software Pvt. Ltd. • Batch W-2026</p>
              </div>
            </div>

            {/* Progress Bar / Step Indicator */}
            <div className="relative pt-1 pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Step 1 of 1 · Application Details</span>
                <span className="text-blue-600 font-bold">100% Ready</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-full"></div>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
              
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    className={`w-full h-11 px-4 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 ${
                      errors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aarav@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full h-11 px-4 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone & College */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`w-full h-11 px-4 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                    University / College Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Delhi / BITS Pilani"
                    value={formData.college}
                    onChange={(e) => {
                      setFormData({ ...formData, college: e.target.value });
                      if (errors.college) setErrors({ ...errors, college: '' });
                    }}
                    className={`w-full h-11 px-4 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 ${
                      errors.college ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                  {errors.college && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.college}</p>}
                </div>
              </div>

              {/* Internship Domain Selector */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                  Select Internship Domain (22+ Available) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => {
                    setFormData({ ...formData, domain: e.target.value });
                    if (errors.domain) setErrors({ ...errors, domain: '' });
                  }}
                  className="w-full h-11 px-4 text-xs font-medium text-slate-900 bg-slate-50/60 border border-slate-200 hover:border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 cursor-pointer"
                >
                  {INITIAL_DOMAINS.map((dom) => (
                    <option key={dom.id} value={dom.name}>
                      {dom.name} ({dom.category})
                    </option>
                  ))}
                </select>
                {errors.domain && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.domain}</p>}
              </div>

              {/* Resume / Portfolio Link with URL Validation Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-800 text-xs">
                    Resume / LinkedIn / Portfolio Link
                  </label>
                  {isResumeUrlValid && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Valid link</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="Paste Google Drive, LinkedIn, or Portfolio URL"
                    value={formData.resumeLink}
                    onChange={(e) => {
                      setFormData({ ...formData, resumeLink: e.target.value });
                      if (errors.resumeLink) setErrors({ ...errors, resumeLink: '' });
                    }}
                    className={`w-full h-11 pl-10 pr-4 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 ${
                      errors.resumeLink ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  />
                </div>
                {errors.resumeLink && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.resumeLink}</p>}
              </div>

              {/* Statement / Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-800 text-xs">
                    Why do you want to join this internship?
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formData.statement.length} / 500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Tell us briefly about your learning goals, interests, and project experience..."
                  value={formData.statement}
                  onChange={(e) => {
                    setFormData({ ...formData, statement: e.target.value });
                    if (errors.statement) setErrors({ ...errors, statement: '' });
                  }}
                  className={`w-full p-3.5 text-xs font-medium text-slate-900 bg-slate-50/60 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:bg-white transition-all duration-150 placeholder:text-slate-400 resize-y min-h-[95px] max-h-[160px] ${
                    errors.statement ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                ></textarea>
                {errors.statement && <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.statement}</p>}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Internship Application</span>
                    </>
                  )}
                </button>

                {/* Privacy Microcopy */}
                <p className="text-[11px] text-slate-400 font-medium text-center mt-3 flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                  <span>Your information is secure and will only be used for internship selection.</span>
                </p>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
