import React from 'react';
import { 
  LogOut, 
  RefreshCw, 
  FileText, 
  Code2, 
  Calendar,
  Percent,
  Briefcase
} from 'lucide-react';
import { PolicyMode, StudentProfile } from '../types/attendance';

interface NavbarProps {
  profile: StudentProfile;
  internshipEnabled: boolean;
  onToggleInternship: (enabled: boolean) => void;
  internshipCutoffDate: string;
  onCutoffDateChange: (date: string) => void;
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
  internshipEnabled,
  onToggleInternship,
  internshipCutoffDate,
  onCutoffDateChange,
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
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3.5">
          {/* Left: Branding & Student Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm tracking-tighter">
                DL
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white uppercase">
                    DutyLeaf
                  </h1>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono border border-zinc-700 text-zinc-400">
                    IIITK
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-200">{profile.name}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="font-mono text-zinc-400">{profile.rollNo}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-mono text-[11px]">
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
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Controls & Target */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Target Percentage Configurator */}
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-zinc-300" />
                Target:
              </span>
              <div className="flex items-center gap-1">
                {[75, 80, 85].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onTargetChange(preset)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition ${
                      targetAttendance === preset
                        ? 'bg-white text-black font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
                    className="w-10 py-0.5 px-1 bg-black border border-zinc-700 rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-white"
                  />
                  <span className="text-[10px] text-zinc-400 ml-0.5">%</span>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onOpenLetterModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>DL Letter</span>
              </button>
              <button
                onClick={onOpenScraperModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                title="Console Scraper & Raw JSON"
              >
                <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Portal Tools</span>
              </button>
              <button
                onClick={onRefresh}
                title="Refresh Live Data"
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Internship Leaves Toggle & Date Picker */}
        <div className="py-2.5 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {/* Internship Leaves Checkbox & Cutoff Date Picker */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={internshipEnabled}
                onChange={(e) => onToggleInternship(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-white focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-300" />
                Internship Leaves
              </span>
            </label>

            {internshipEnabled && (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 animate-in fade-in">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  Cutoff Date:
                </span>
                <input
                  type="date"
                  value={internshipCutoffDate}
                  onChange={(e) => onCutoffDateChange(e.target.value)}
                  className="bg-black border border-zinc-700 text-white font-mono text-xs rounded px-2 py-1 focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => onCutoffDateChange('2026-08-01')}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition ${
                    internshipCutoffDate === '2026-08-01'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Default (1 Aug 2026)
                </button>
              </div>
            )}
          </div>

          {/* Policy Treatment Toggle (when internship is enabled) */}
          {internshipEnabled && (
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 animate-in fade-in">
              <button
                type="button"
                onClick={() => onPolicyChange('scenario2')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  policy === 'scenario2'
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                As Duty Leave (Denominator -)
              </button>
              <button
                type="button"
                onClick={() => onPolicyChange('scenario1')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  policy === 'scenario1'
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                As Present (Numerator +)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
