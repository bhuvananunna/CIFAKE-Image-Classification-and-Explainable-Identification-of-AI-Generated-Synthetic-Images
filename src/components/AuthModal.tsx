import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { registerUser, loginUser } from '../services/db';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Password confirmation does not match.');
          setIsLoading(false);
          return;
        }

        const res = await registerUser(name, email, password);
        if (res.success && res.user) {
          setSuccessMsg('Account registered successfully! Initializing session...');
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 800);
        } else {
          setError(res.error || 'Failed to register account.');
        }
      } else {
        const res = await loginUser(email, password);
        if (res.success && res.user) {
          setSuccessMsg('Authentication verified. Welcome back!');
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Invalid credentials provided.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    const res = await loginUser('student@university.edu', 'Student@2026');
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError('Could not initialize demo login.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e131f] border border-[#1c2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#07090e]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isRegister ? 'Academic Registration' : 'Researcher Authentication'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRegister ? 'Create researcher credentials for session logging' : 'Sign in to access your personal inference records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-1.5 font-medium rounded transition-colors cursor-pointer ${
              !isRegister ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-1.5 font-medium rounded transition-colors cursor-pointer ${
              isRegister ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Institutional / Personal Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Authenticate Session'}
          </button>

          {!isRegister && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-1.5 rounded text-[11px] font-mono text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                Quick-Sign In as Demo (student@university.edu)
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
