import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  GraduationCap, 
  Users, 
  Layers, 
  IndianRupee, 
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Student } from '../../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Student, 'id' | 'feeDetails'> & { totalFee?: number; paidAmount?: number }) => void;
  initialBatch?: string;
  availableBatches?: string[];
  availableDomains?: string[];
  defaultMentorName?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialBatch = 'Batch W-2026-A',
  availableBatches = ['Batch W-2026-A', 'Batch W-2026-B', 'Batch W-2026-C', 'Batch RK-Gurukul-DS'],
  availableDomains = ['MERN Stack Development', 'Full Stack Java', 'Data Science & AI', 'Cloud & DevOps'],
  defaultMentorName = 'Mentor'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    domain: availableDomains[0] || 'MERN Stack Development',
    batch: initialBatch === 'All' ? (availableBatches[0] || 'Batch W-2026-A') : initialBatch,
    college: '',
    mentorName: defaultMentorName,
    totalFee: 15000,
    paidAmount: 5000
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        batch: initialBatch && initialBatch !== 'All' ? initialBatch : prev.batch || availableBatches[0] || 'Batch W-2026-A',
        mentorName: defaultMentorName || prev.mentorName
      }));
    }
  }, [isOpen, initialBatch, defaultMentorName, availableBatches]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in Student Name, Email, and Phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      onAdd({
        userId: `usr-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        domain: formData.domain,
        batch: formData.batch,
        college: formData.college.trim() || 'Engineering Institute',
        mentorName: formData.mentorName || defaultMentorName,
        profileCompletion: 80,
        attendancePercentage: 100,
        assignmentsSubmitted: 0,
        totalAssignments: 8,
        averageGrade: 'N/A',
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        totalFee: Number(formData.totalFee || 15000),
        paidAmount: Number(formData.paidAmount || 0)
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingDue = Math.max(0, Number(formData.totalFee || 0) - Number(formData.paidAmount || 0));
  const feeStatus = formData.paidAmount >= formData.totalFee 
    ? 'Paid' 
    : formData.paidAmount > 0 
      ? 'Partial' 
      : 'Unpaid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/90 overflow-hidden relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-slate-50/80 to-white shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <UserPlus className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Enroll New Student / Intern
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/80">
                  Mentor Panel
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add student to <strong className="text-orange-600">{formData.batch}</strong> with instant login credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold scrollbar-thin">
          
          {/* Row 1: Full Name */}
          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Student Full Name *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Pooja Sanjay Patil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 text-xs font-bold transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address (Login ID) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Phone / WhatsApp *</span>
                <span className="text-[9px] font-bold text-orange-600 lowercase">(login password)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 text-xs font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Domain & Batch Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Internship Domain *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 text-xs font-bold transition-all appearance-none cursor-pointer"
                >
                  {availableDomains.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Target Batch Allocation *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 text-xs font-bold transition-all appearance-none cursor-pointer"
                >
                  {availableBatches.filter(b => b !== 'All').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: College / Institute & Assigned Mentor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                College / University *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Institute of Tech"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Assigned Mentor
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.mentorName}
                  onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-500 text-slate-800 text-xs font-bold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Fee Structure Details */}
          <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Internship Fee Structure</span>
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                feeStatus === 'Paid' 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : feeStatus === 'Partial' 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {feeStatus === 'Paid' ? '✅ Fully Paid' : feeStatus === 'Partial' ? '⚠️ Partial Due' : '🔴 Unpaid'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-emerald-900 mb-1">
                  Total Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-emerald-200 bg-white font-black text-xs text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-900 mb-1">
                  Initial Paid Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-emerald-200 bg-white font-black text-xs text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-emerald-900/80">
              <span>Pending Balance Due:</span>
              <span className="text-rose-600 font-extrabold text-xs">
                ₹{pendingDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 font-medium flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              The student will automatically be marked <strong>Active</strong> in <strong>{formData.batch}</strong> and can immediately be marked present in daily attendance.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 stroke-[2.3]" />
              <span>{isSubmitting ? 'Enrolling...' : 'Enroll Student & Add to Batch'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
