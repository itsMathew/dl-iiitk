import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Settings, 
  Globe, 
  Check, 
  Server
} from 'lucide-react';
import { loginToPortal, syncFullStudentData } from '../services/api';
import { CourseAttendance, StudentProfile } from '../types/attendance';

interface LoginPageProps {
  onSuccess: (data: { profile: StudentProfile; courses: CourseAttendance[]; token: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showProxySettings, setShowProxySettings] = useState(false);
  const [proxyMode, setProxyMode] = useState<string>('relative');
  const [customProxyUrl, setCustomProxyUrl] = useState<string>('');
  const [manualToken, setManualToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem('dl_proxy_mode') || 'relative';
    const savedCustom = localStorage.getItem('dl_custom_proxy') || '';
    setProxyMode(savedMode);
    setCustomProxyUrl(savedCustom);
  }, []);

  const handleSaveProxyMode = (mode: string, customUrl?: string) => {
    setProxyMode(mode);
    localStorage.setItem('dl_proxy_mode', mode);
    if (customUrl !== undefined) {
      setCustomProxyUrl(customUrl);
      localStorage.setItem('dl_custom_proxy', customUrl);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter your college email and password.');
      return;
    }

    setIsLoading(true);
    setProgressMsg('Authenticating with IIIT Kottayam portal...');

    try {
      const loginRes = await loginToPortal(email.trim(), password);
      const token = loginRes.access;

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
    setProgressMsg('Syncing attendance records using token...');

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black font-black text-lg tracking-tighter mb-3">
            DL
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            DutyLeaf
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            IIIT Kottayam Attendance & Duty Leave Modeler
          </p>
        </div>

        {/* Card Container */}
        <div className="mono-panel rounded-2xl p-6 sm:p-8 border border-zinc-800">
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/80 bg-red-950/30 flex items-start gap-2.5 text-xs text-zinc-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <p className="font-semibold text-white">{error}</p>
                {proxyMode === 'relative' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveProxyMode('corsproxy');
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-mono underline text-red-400 hover:text-white"
                  >
                    <span>Switch to Public CORS Gateway & Retry</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
              <div>
                <h3 className="text-xs font-mono font-semibold text-white uppercase">Connecting to Portal</h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 max-w-xs">{progressMsg}</p>
              </div>
            </div>
          ) : !showTokenInput ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rollno@iiitkottayam.ac.in"
                    className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <span>Sign In & Fetch Attendance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-900 mt-4 text-[11px] font-mono text-zinc-500">
                <button
                  type="button"
                  onClick={() => setShowProxySettings(!showProxySettings)}
                  className="hover:text-zinc-300 flex items-center gap-1 transition"
                >
                  <Server className="w-3 h-3" />
                  <span>Proxy: {proxyMode === 'relative' ? 'Platform /api' : proxyMode === 'corsproxy' ? 'CORS Gateway' : 'Custom'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTokenInput(true)}
                  className="hover:text-zinc-300 transition"
                >
                  Paste JWT Token →
                </button>
              </div>

              {/* Proxy Settings Drawer */}
              {showProxySettings && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2.5 animate-in fade-in text-xs font-mono">
                  <div className="text-[11px] font-bold uppercase text-zinc-400">
                    Production CORS Proxy Setup:
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        name="proxy"
                        checked={proxyMode === 'relative'}
                        onChange={() => handleSaveProxyMode('relative')}
                      />
                      <span><strong>Host Proxy /api</strong> (Vercel, Netlify, Cloudflare, Vite)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        name="proxy"
                        checked={proxyMode === 'corsproxy'}
                        onChange={() => handleSaveProxyMode('corsproxy')}
                      />
                      <span><strong>CORS Gateway</strong> (corsproxy.io for static hosts)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        name="proxy"
                        checked={proxyMode === 'custom'}
                        onChange={() => handleSaveProxyMode('custom')}
                      />
                      <span><strong>Custom Proxy URL</strong></span>
                    </label>
                  </div>

                  {proxyMode === 'custom' && (
                    <input
                      type="text"
                      placeholder="https://my-proxy.workers.dev"
                      value={customProxyUrl}
                      onChange={(e) => handleSaveProxyMode('custom', e.target.value)}
                      className="w-full p-2 bg-black border border-zinc-800 rounded text-[11px] text-white focus:outline-none focus:border-white"
                    />
                  )}
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleManualTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Paste Bearer JWT Token
                </label>
                <textarea
                  rows={4}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="flex-1 py-2 px-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-mono rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold rounded-lg transition"
                >
                  Sync Token
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-5 text-center text-[11px] font-mono text-zinc-600">
          attendance.iiitkottayam.ac.in API
        </div>
      </div>
    </div>
  );
};
