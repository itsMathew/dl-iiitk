import React from 'react';
import { 
  GraduationCap, 
  LogOut, 
  RefreshCw, 
  Sliders, 
  FileText, 
  Code2, 
  HelpCircle,
  UserCheck,
  Percent
} from 'lucide-react';
import { PolicyMode, StudentProfile } from '../types/attendance';

interface NavbarProps {
  profile: StudentProfile;
  policy: PolicyMode;
  onPolicyChange: (policy: PolicyMode) => void;
  targetAttendance: number;
  onTargetChange: (target: number) => void;
  onRefresh: () => void;
  onLogout: () => void;
  onOpenLetterModal: () => void;
  onOpenScraperModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  policy,
  onPolicyChange,
  targetAttendance,
  onTargetChange,
  onRefresh,
  onLogout,
  onOpenLetterModal,
  onOpenScraperModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3.5">
          {/* Left: Branding & Student Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    Duty<span className="text-emerald-400">Leaf</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    IIIT Kottayam
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-200">{profile.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-indigo-300">{profile.rollNo}</span>
                  <span className="text-slate-600">•</span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                    Sem {profile.semester} ({profile.branch})
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onRefresh}
                title="Refresh Records"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center / Right: Policy Selector & Target Slider */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Target Percentage Configurator */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-indigo-400" />
                Target:
              </span>
              <div className="flex items-center gap-1.5">
                {[75, 80, 85].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onTargetChange(preset)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                      targetAttendance === preset
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="relative flex items-center ml-1">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={targetAttendance}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= 100) onTargetChange(val);
                    }}
                    className="w-12 py-0.5 px-1 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 ml-0.5">%</span>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onOpenLetterModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>DL Letter Draft</span>
              </button>
              <button
                onClick={onOpenScraperModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
                title="Console Scraper & Raw Data"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Tools</span>
              </button>
              <button
                onClick={onRefresh}
                title="Refresh Live Data"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Global Policy Selector Segmented Switcher */}
        <div className="py-2.5 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Cutoff Policy:</span>
            <span className="hidden sm:inline text-slate-500">
              Classes held before 1 Aug 2026 modeled under college administrative decisions
            </span>
          </div>

          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900 border border-slate-800/80 w-full sm:w-auto">
            <button
              onClick={() => onPolicyChange('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                policy === 'raw'
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>Raw Baseline</span>
            </button>

            <button
              onClick={() => onPolicyChange('scenario1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                policy === 'scenario1'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>Scenario 1</span>
              <span className="hidden md:inline text-[10px] opacity-80">(Pre-Aug Present)</span>
            </button>

            <button
              onClick={() => onPolicyChange('scenario2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                policy === 'scenario2'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>Scenario 2</span>
              <span className="hidden md:inline text-[10px] opacity-80">(Pre-Aug as DL)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
