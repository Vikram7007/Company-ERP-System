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
  Sparkles,
  Shield,
  ShieldCheck,
  CheckCheck,
  Check,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock
} from 'lucide-react';
import { Student } from '../../types';
import { apiPost } from '../../utils/api';

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

  // Email verification state
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sending' | 'otp_sent' | 'verified'>('idle');
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [verifiedEmailAddress, setVerifiedEmailAddress] = useState<string | null>(null);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        batch: initialBatch && initialBatch !== 'All' ? initialBatch : prev.batch || availableBatches[0] || 'Batch W-2026-A',
        mentorName: defaultMentorName || prev.mentorName
      }));
      setVerificationStep('idle');
      setVerifiedEmailAddress(null);
      setVerificationOtp('');
      setVerifyError(null);
      setVerifySuccessMsg(null);
    }
  }, [isOpen, initialBatch, defaultMentorName, availableBatches]);

  if (!isOpen) return null;

  const isEmailVerified = verificationStep === 'verified' && verifiedEmailAddress === formData.email.trim().toLowerCase();

  const handleEmailChange = (newEmail: string) => {
    setFormData(prev => ({ ...prev, email: newEmail }));
    if (verificationStep === 'verified' && verifiedEmailAddress !== newEmail.trim().toLowerCase()) {
      setVerificationStep('idle');
      setVerifiedEmailAddress(null);
      setVerifySuccessMsg(null);
      setVerifyError(null);
    }
  };

  // Step 1: Request email verification OTP
  const handleRequestEmailVerification = async () => {
    const emailToVerify = formData.email.trim();
    if (!emailToVerify) {
      setVerifyError('Please enter the student email address first.');
      return;
    }

    setVerifyError(null);
    setVerifySuccessMsg(null);
    setVerificationStep('sending');

    try {
      const res = await apiPost<{ message: string; domainVerified?: boolean; mxServer?: string }>(
        '/api/students/verify-email-request',
        { 
          email: emailToVerify, 
          name: formData.name.trim() || 'Student Intern',
          mentorName: formData.mentorName || defaultMentorName
        }
      );
      setVerificationStep('otp_sent');
      setVerifySuccessMsg(res?.message || `Verification OTP sent to ${emailToVerify}`);
    } catch (err: any) {
      setVerificationStep('idle');
      setVerifyError(err.message || 'Could not verify student email. Ensure email domain is valid and reachable.');
    }
  };

  // Step 2: Confirm OTP entered by mentor/student
  const handleConfirmEmailOtp = async () => {
    const code = verificationOtp.trim();
    if (!code || code.length !== 6) {
      setVerifyError('Please enter a valid 6-digit OTP verification code.');
      return;
    }

    setVerifyError(null);
    setIsConfirmingOtp(true);

    try {
      const res = await apiPost<{ verified: boolean; message: string }>(
        '/api/students/verify-email-confirm',
        { email: formData.email.trim(), otp: code }
      );

      if (res?.verified) {
        setVerificationStep('verified');
        setVerifiedEmailAddress(formData.email.trim().toLowerCase());
        setVerifySuccessMsg('Student email address verified successfully as genuine & original!');
      } else {
        setVerifyError('Verification failed. Please re-check the OTP.');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Incorrect verification code. Please check the inbox.');
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in Student Name, Email, and Phone number.');
      return;
    }

    if (!isEmailVerified) {
      setVerifyError('Student email verification with OTP is mandatory before enrollment.');
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
                Add student to <strong className="text-orange-600">{formData.batch}</strong> with verified credentials.
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
                placeholder="e.g. Saurabh Magar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 text-xs font-bold transition-all"
              />
            </div>
          </div>

          {/* Row 2: Official Email Address with Email Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider">
                Student Email Address (Login ID) *
              </label>
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email Verified ✓</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                  Verification Required
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-xs placeholder:text-slate-400 ${
                    isEmailVerified 
                      ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-400 font-bold' 
                      : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }`}
                />
              </div>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleRequestEmailVerification}
                  disabled={verificationStep === 'sending' || !formData.email.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shrink-0"
                >
                  {verificationStep === 'sending' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Email</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Message */}
            {verifyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* OTP Verification Card */}
            {verificationStep === 'otp_sent' && (
              <div className="p-4 bg-gradient-to-br from-orange-50/90 to-amber-50/60 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-orange-950 text-xs font-extrabold">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Enter 6-Digit Email Verification Code</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  We sent a 6-digit verification code to <strong>{formData.email}</strong> to confirm genuine student identity.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-2.5 rounded-xl border border-orange-300 bg-white font-mono text-center tracking-widest text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmEmailOtp}
                    disabled={isConfirmingOtp || verificationOtp.length !== 6}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isConfirmingOtp ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    <span>Confirm OTP</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">Didn't receive code? Check spam folder or</span>
                  <button
                    type="button"
                    onClick={handleRequestEmailVerification}
                    className="font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* Verification Success Confirmation */}
            {isEmailVerified && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Student email confirmed with active MX mail server. Ready to enroll!</span>
              </div>
            )}
          </div>

          {/* Row 3: Phone / Mobile Number & Primary Batch Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          {/* Row 4: Domain & College / Institute */}
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
          </div>

          {/* Row 5: Assigned Mentor */}
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

          {/* Row 6: Fee Structure Details */}
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

          {/* Quick Notice Card */}
          <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-medium flex items-start space-x-2">
            <KeyRound className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p>
                Student Login: <strong>{formData.email || 'student email'}</strong> • Password: <strong>{formData.phone || 'mobile number'}</strong>
              </p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                The student can immediately log into the student LMS portal with these credentials once verified.
              </p>
            </div>
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
              disabled={isSubmitting || !isEmailVerified}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 ${
                isEmailVerified 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 cursor-pointer active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : !isEmailVerified ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify Email First</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.3]" />
                  <span>Enroll Student & Add to Batch</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
