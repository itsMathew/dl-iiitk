import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  ShieldCheck, 
  Layers,
  CalendarCheck
} from 'lucide-react';
import { loginToPortal, syncFullStudentData } from '../services/api';
import { CourseAttendance, StudentProfile } from '../types/attendance';
import { mockCourses, mockStudentProfile } from '../data/mockData';

interface LoginPageProps {
  onSuccess: (data: { profile: StudentProfile; courses: CourseAttendance[]; token: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide your college email and password.');
      return;
    }

    setIsLoading(true);
    setProgressMsg('Authenticating with IIIT Kottayam portal...');

    try {
      // 1. Login to get JWT
      const loginRes = await loginToPortal(email, password);
      const token = loginRes.access;

      // 2. Sync full student attendance and per-course sessions
      const { profile, courses } = await syncFullStudentData(
        token, 
        (status) => setProgressMsg(status)
      );

      onSuccess({ profile, courses, token });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Unable to log into attendance portal.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setError('Please enter a valid JWT token.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setProgressMsg('Syncing attendance records using provided Bearer token...');

    try {
      const { profile, courses } = await syncFullStudentData(
        manualToken.trim(), 
        (status) => setProgressMsg(status)
      );
      onSuccess({ profile, courses, token: manualToken.trim() });
    } catch (err: any) {
      console.error('Token sync error:', err);
      setError(err.message || 'Failed to authenticate with token. It may have expired.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  const handleUseDemo = () => {
    setIsLoading(true);
    setProgressMsg('Loading Mathew George Manachery (CSE Sem 5) verified session records...');
    setTimeout(() => {
      onSuccess({
        profile: mockStudentProfile,
        courses: mockCourses,
        token: 'demo-mode',
      });
      setIsLoading(false);
    }, 600);
  };

  const handleFillDemoCreds = () => {
    setEmail('mathewmanachery24bcs80@iiitkottayam.ac.in');
    setPassword('••••••••••••');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-xl shadow-indigo-500/20 mb-4 ring-1 ring-white/20">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Duty<span className="text-emerald-400">Leaf</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            IIIT Kottayam Attendance Analyzer, Pre-August Policy Modeler & Duty Leave Planner
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-800/80">
          {/* Status Alert Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Authentication Failed</p>
                <p className="mt-0.5 text-xs text-rose-300/90">{error}</p>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="mt-2 inline-flex items-center text-xs font-semibold text-rose-200 hover:text-white underline decoration-rose-400/50 underline-offset-2"
                >
                  Switch to Verified Demo Records (1-Click) →
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Connecting to Attendance Portal</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{progressMsg}</p>
              </div>
            </div>
          ) : !showTokenInput ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  College Webmail Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rollno@iiitkottayam.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Portal Password
                  </label>
                  <button
                    type="button"
                    onClick={handleFillDemoCreds}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Use Sample Creds
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.99]"
                >
                  <span>Sign In & Fetch My Attendance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/90 px-3 text-slate-500 font-medium tracking-wider">
                    Or Instant Access
                  </span>
                </div>
              </div>

              {/* Instant One-Click Demo Mode Button */}
              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2.5 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>One-Click Demo (Mathew George Manachery • Sem 5)</span>
              </button>

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(true)}
                  className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1.5 transition"
                >
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Have an active Bearer JWT token? Paste directly</span>
                </button>
              </div>
            </form>
          ) : (
            /* Direct Token Fallback View */
            <form onSubmit={handleManualTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Paste Bearer JWT Token
                </label>
                <textarea
                  rows={4}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Tip: Copy from browser DevTools Network tab header <code className="text-indigo-300">authorization: Bearer ...</code>
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Back to Password Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>Sync Token</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Security & Feature Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct HTTPS Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Pre-Aug Dual Policies</span>
            </div>
          </div>
        </div>

        {/* Footer college details */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Targeting <a href="https://attendance.iiitkottayam.ac.in" target="_blank" rel="noreferrer" className="text-slate-400 hover:underline">attendance.iiitkottayam.ac.in</a> API
        </div>
      </div>
    </div>
  );
};
