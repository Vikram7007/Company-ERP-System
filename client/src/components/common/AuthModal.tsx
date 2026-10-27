import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { X, Lock, Mail, UserCheck, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
  onSuccess?: (message?: string, targetView?: 'landing' | 'dashboard') => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, defaultRole = 'CEO', onSuccess }) => {
  const { login, loginWithCredentials } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Synchronize role if defaultRole changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole(defaultRole);
      setEmail('');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setOtpSent(false);
    }
  }, [isOpen, defaultRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === 'forgot') {
        if (!otpSent) {
          const response = await fetch('/api/auth/request-password-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role: selectedRole })
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.success) throw new Error(result.message || 'Unable to send OTP');
          setOtpSent(true);
        } else {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword, role: selectedRole })
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.success) throw new Error(result.message || 'Unable to change password');
          if (onSuccess) onSuccess(`${selectedRole} password changed successfully.`, 'landing');
          onClose();
        }
        return;
      }

      if (tab === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: selectedRole })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.message || 'Registration failed');
        login({ ...result.data.user, token: result.data.token });
        if (onSuccess) onSuccess('Registration successful! Your student account is ready.', 'dashboard');
        onClose();
        return;
      } else {
        await loginWithCredentials(email, password, selectedRole);
      }
      if (onSuccess) onSuccess(undefined, 'dashboard');
      onClose();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <img src="/logo.png" alt="Websums Logo" className="w-14 h-14 object-contain drop-shadow-md mx-auto mb-2" />
          <h3 className="text-xl font-extrabold text-slate-900">
            {tab === 'login' && 'Sign In to Enterprise Portal'}
            {tab === 'register' && 'Create Student Account'}
            {tab === 'forgot' && `Reset ${selectedRole} Password`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Websums Software Pvt. Ltd.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {tab === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Role Type</label>
            <div className={`grid gap-2 ${tab === 'register' ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {(tab === 'register' ? ['Student'] as Role[] : ['CEO', 'Mentor', 'Student'] as Role[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setSelectedRole(r);
                    setEmail('');
                    setPassword('');
                    setOtpSent(false);
                  }}
                  className={`py-2 rounded-xl border font-bold text-xs transition-all ${
                    selectedRole === r
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {tab === 'forgot' && (
            <>
              {otpSent && (
                <>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-800">
                    OTP sent to the registered email.
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">OTP</label>
                    <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white" />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@websums.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white"
                />
              </div>
              {selectedRole === 'Mentor' && (
                <p className="mt-1.5 text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80">
                  💡 <strong>Mentor Note:</strong> Your initial login password is your registered mobile number.
                </p>
              )}
            </div>
          )}

          {tab === 'forgot' && otpSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold">
              ✅ 6-digit OTP code sent to <strong>{email}</strong>. Please check your inbox (or spam folder) and enter it above to reset your password.
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{tab === 'login' ? 'Sign In Now' : tab === 'register' ? 'Register Student Account' : otpSent ? 'Change Password' : 'Send OTP'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          {tab === 'login' ? (
            <>
              <button onClick={() => setTab('forgot')} className="hover:text-orange-600 font-medium">Forgot Password?</button>
              <button onClick={() => { setTab('register'); setSelectedRole('Student'); }} className="font-bold text-orange-600 hover:underline">New Student Account?</button>
            </>
          ) : (
            <button onClick={() => setTab('login')} className="font-bold text-orange-600 hover:underline mx-auto">
              Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
