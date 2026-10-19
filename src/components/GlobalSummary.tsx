import React from 'react';
import { 
  Percent, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Coffee, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Info,
  Sparkles
} from 'lucide-react';
import { OverallSummary, PolicyMode } from '../types/attendance';

interface GlobalSummaryProps {
  summary: OverallSummary;
  policy: PolicyMode;
  targetAttendance: number;
}

export const GlobalSummary: React.FC<GlobalSummaryProps> = ({
  summary,
  policy,
  targetAttendance,
}) => {
  const isOverallHealthy = summary.overallPercentage >= targetAttendance;
  const isOverallCritical = summary.overallPercentage < 75;

  const getPolicyLabel = () => {
    switch (policy) {
      case 'scenario1':
        return 'Scenario 1: Pre-August Granted as Present';
      case 'scenario2':
        return 'Scenario 2: Pre-August Converted to Duty Leaves';
      default:
        return 'Raw Portal Baseline (Unadjusted)';
    }
  };

  return (
    <div className="space-y-4">
      {/* Policy Impact Notification Banner */}
      {policy !== 'raw' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/60 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">{getPolicyLabel()}</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {policy === 'scenario1'
                  ? 'Adding attendance credit for all pre-semester sessions prior to 1 Aug 2026.'
                  : 'Removing pre-semester sessions from denominator by converting them to Duty Leaves.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Impact vs Baseline:</span>
            <span
              className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                summary.scenarioGain >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {summary.scenarioGain >= 0 ? `+${summary.scenarioGain}%` : `${summary.scenarioGain}%`}
            </span>
          </div>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Average Attendance */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overall Attendance
            </span>
            <div
              className={`p-2 rounded-xl ${
                isOverallHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isOverallCritical
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <Percent className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {summary.overallPercentage}%
            </span>
            <span className="text-xs font-medium text-slate-400">
              ({summary.totalAttended}/{summary.totalCounted})
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Target: {targetAttendance}%</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                summary.overallPercentage >= targetAttendance
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {summary.overallPercentage >= targetAttendance ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{(summary.overallPercentage - targetAttendance).toFixed(1)}% above
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  {(summary.overallPercentage - targetAttendance).toFixed(1)}% deficit
                </>
              )}
            </span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverallHealthy
                  ? 'bg-emerald-500'
                  : isOverallCritical
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Critical Courses */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Courses Under Target
            </span>
            <div
              className={`p-2 rounded-xl ${
                summary.criticalCoursesCount + summary.warningCoursesCount === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {summary.criticalCoursesCount + summary.warningCoursesCount}
            </span>
            <span className="text-xs font-medium text-slate-400">courses</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>
              <strong className="text-rose-400 font-semibold">{summary.criticalCoursesCount}</strong> critical (&lt;75%)
            </span>
            <span>
              <strong className="text-amber-400 font-semibold">{summary.warningCoursesCount}</strong> warning
            </span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-500"
              style={{
                width: `${
                  (summary.criticalCoursesCount /
                    Math.max(1, summary.criticalCoursesCount + summary.warningCoursesCount + summary.healthyCoursesCount)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Total Duty Leaves Needed */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total DLs Needed
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-indigo-300">
              {summary.totalDLNeeded}
            </span>
            <span className="text-xs font-medium text-slate-400">leaves across subjects</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>To elevate all courses to ≥{targetAttendance}%</span>
            <span className="text-indigo-400 font-medium">Denominator offset</span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 4: Total Safe Bunks Available */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Safe Bunks
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coffee className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              {summary.totalSafeBunks}
            </span>
            <span className="text-xs font-medium text-slate-400">sessions buffer</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>In healthy courses without falling below {targetAttendance}%</span>
            <span className="text-emerald-400 font-medium">{summary.healthyCoursesCount} safe courses</span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
