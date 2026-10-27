import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Shield, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Lock, 
  RefreshCw, 
  Send, 
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { INITIAL_DOMAINS } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import { apiPost } from '../../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMentorAdded?: (mentorName: string) => void;
}

export const AddMentorModal: React.FC<Props> = ({ isOpen, onClose, onMentorAdded }) => {
  const { addMentor } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    assignedDomains: [INITIAL_DOMAINS[0].name],
    batch: 'Batch W-2026-A'
  });

  // Email verification state
  const [verificationStep, setVerificationStep] = useState<'idle' | 'sending' | 'otp_sent' | 'verified'>('idle');
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [verifiedEmailAddress, setVerifiedEmailAddress] = useState<string | null>(null);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const isEmailVerified = verificationStep === 'verified' && verifiedEmailAddress === formData.email.trim().toLowerCase();

  const handleEmailChange = (newEmail: string) => {
    setFormData((prev) => ({ ...prev, email: newEmail }));
    // If email is changed after verification, reset verification
    if (verificationStep === 'verified' && verifiedEmailAddress !== newEmail.trim().toLowerCase()) {
      setVerificationStep('idle');
      setVerifiedEmailAddress(null);
      setVerifySuccessMsg(null);
      setVerifyError(null);
    }
  };

  const handleDomainToggle = (domainName: string) => {
    setFormData((prev) => {
      const exists = prev.assignedDomains.includes(domainName);
      if (exists) {
        if (prev.assignedDomains.length === 1) return prev; // Keep at least one
        return { ...prev, assignedDomains: prev.assignedDomains.filter((d) => d !== domainName) };
      } else {
        return { ...prev, assignedDomains: [...prev.assignedDomains, domainName] };
      }
    });
  };

  // Step 1: Send verification OTP to verify originality
  const handleRequestEmailVerification = async () => {
    const emailToVerify = formData.email.trim();
    if (!emailToVerify) {
      setVerifyError('Please enter an official mentor email address first.');
      return;
    }

    setVerifyError(null);
    setVerifySuccessMsg(null);
    setVerificationStep('sending');

    try {
      const res = await apiPost<{ message: string; domainVerified?: boolean; mxServer?: string }>(
        '/api/mentors/verify-email-request',
        { email: emailToVerify, name: formData.name || 'Mentor' }
      );
      setVerificationStep('otp_sent');
      setVerifySuccessMsg(res?.message || `Verification OTP sent to ${emailToVerify}`);
    } catch (err: any) {
      setVerificationStep('idle');
      setVerifyError(err.message || 'Could not verify email. Ensure domain is genuine with active mail servers.');
    }
  };

  // Step 2: Confirm OTP entered by user
  const handleConfirmEmailOtp = async () => {
    const code = verificationOtp.trim();
    if (!code || code.length !== 6) {
      setVerifyError('Please enter the valid 6-digit verification code.');
      return;
    }

    setVerifyError(null);
    setIsConfirmingOtp(true);

    try {
      const res = await apiPost<{ verified: boolean; message: string }>(
        '/api/mentors/verify-email-confirm',
        { email: formData.email.trim(), otp: code }
      );

      if (res?.verified) {
        setVerificationStep('verified');
        setVerifiedEmailAddress(formData.email.trim().toLowerCase());
        setVerifySuccessMsg('Email address verified successfully as genuine & original!');
      } else {
        setVerifyError('Verification failed. Please re-check the OTP.');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Incorrect verification code. Please check your inbox.');
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setVerifyError('Original email verification is mandatory before adding a mentor.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMentor({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        assignedDomains: formData.assignedDomains,
        activeBatches: [formData.batch],
        status: 'Active'
      });

      // User requested exact message: "new mentor added sucessfully"
      setToast({ type: 'success', message: 'New mentor added successfully!' });
      if (onMentorAdded) onMentorAdded(formData.name.trim());

      setFormData({
        name: '',
        email: '',
        phone: '',
        assignedDomains: [INITIAL_DOMAINS[0].name],
        batch: 'Batch W-2026-A'
      });
      setVerificationStep('idle');
      setVerifiedEmailAddress(null);
      setVerificationOtp('');

      window.setTimeout(() => {
        onClose();
      }, 1800);
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Mentor registration failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 z-70 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-6 py-3.5 text-sm font-extrabold shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${
          toast.type === 'success' 
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-500/20' 
            : 'border-rose-300 bg-rose-50 text-rose-900 shadow-rose-500/20'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <AlertCircle className="h-5 w-5 stroke-[3]" />
            </div>
          )}
          <div>
            <p className="font-black text-sm">{toast.message}</p>
            {toast.type === 'success' && (
              <p className="text-[11px] font-medium text-emerald-700">Mentor can log in using email & mobile number password.</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
            <UserPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Mentor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                CEO Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Create instructor credentials with verified email & mobile number</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Mentor Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mentor Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Ramesh Kulkarni"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-medium text-xs placeholder:text-slate-400"
            />
          </div>

          {/* Official Email Address with Original Email Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">Official Mentor Email *</label>
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Original Email Verified</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
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
                  placeholder="e.g. ramesh.kulkarni@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 rounded-2xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none transition-all font-medium text-xs placeholder:text-slate-400 ${
                    isEmailVerified 
                      ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-400' 
                      : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }`}
                />
              </div>

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleRequestEmailVerification}
                  disabled={verificationStep === 'sending' || !formData.email.trim()}
                  className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* OTP Verification Box */}
            {verificationStep === 'otp_sent' && (
              <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center space-x-2 text-orange-900 text-xs font-bold">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Enter 6-Digit Email Verification Code</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  We sent a 6-digit verification OTP to <strong>{formData.email}</strong> to verify this is an authentic, original email address.
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
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isConfirmingOtp ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    <span>Confirm Code</span>
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Original email confirmed with active MX mail server. Ready to register!</span>
              </div>
            )}
          </div>

          {/* Phone / Mobile Number & Credentials Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9822122101"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all font-medium text-xs placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Batch Allocation *</label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer text-xs"
              >
                <option value="Batch RK-Gurukul-DS">Batch RK-Gurukul-DS (Data Science)</option>
                <option value="Batch W-2026-A">Batch W-2026-A (Active Current)</option>
                <option value="Batch W-2026-B">Batch W-2026-B</option>
                <option value="Batch W-2026-C">Batch W-2026-C</option>
                <option value="Batch W-2026-D">Batch W-2026-D</option>
              </select>
            </div>
          </div>

          {/* Prominent Login Credentials Info Card */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-orange-200/90 rounded-2xl text-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-orange-950 font-extrabold text-[11px] uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>Mentor Login Credentials Setup</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-700">
              <div className="bg-white/90 p-2 rounded-xl border border-orange-100 flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="truncate"><strong>Login ID:</strong> {formData.email || 'Mentor Email'}</span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-orange-100 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span className="truncate"><strong>Password:</strong> {formData.phone || 'Mentor Mobile No.'}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              💡 The mentor can sign in directly using their email and phone number, and can reset their password via email OTP anytime.
            </p>
          </div>

          {/* Assigned Internship Domains */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Assigned Internship Domains (Select 1 or more) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 border border-slate-200 rounded-2xl bg-slate-50/80">
              {INITIAL_DOMAINS.map((dom) => {
                const selected = formData.assignedDomains.includes(dom.name);
                return (
                  <div
                    key={dom.id}
                    onClick={() => handleDomainToggle(dom.name)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <span className="truncate pr-1">{dom.name}</span>
                    {selected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-white stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isEmailVerified}
              className={`w-full py-3.5 text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 ${
                isEmailVerified
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Mentor & Generating Credentials...</span>
                </>
              ) : !isEmailVerified ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Verify Email First to Enable Registration</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm & Register Mentor</span>
                </>
              )}
            </button>
            {!isEmailVerified && (
              <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                * To protect system integrity, only verified original email addresses can be onboarded.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
