import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Coffee, 
  Briefcase
} from 'lucide-react';
import { OverallSummary } from '../types/attendance';

interface GlobalSummaryProps {
  summary: OverallSummary;
  targetAttendance: number;
  internshipEnabled: boolean;
  internshipCutoffDate: string;
}

export const GlobalSummary: React.FC<GlobalSummaryProps> = ({
  summary,
  targetAttendance,
  internshipEnabled,
  internshipCutoffDate,
}) => {
  return (
    <div className="space-y-3">
      {/* Internship Active Notice */}
      {internshipEnabled && (
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="font-semibold text-white">Internship Leaves Applied:</span>{' '}
              Sessions prior to <span className="font-mono text-white underline">{internshipCutoffDate}</span> are excused as Duty Leaves.
            </div>
          </div>
          <div className="font-mono font-bold text-white bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-[11px]">
            {summary.totalInternshipLeavesGranted} sessions excused
          </div>
        </div>
      )}

      {/* Summary Cards Grid (No overall attendance card) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Critical Courses */}
        <div className="mono-card rounded-xl p-4 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Courses Under Target (&lt;{targetAttendance}%)
            </span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {summary.criticalCoursesCount + summary.warningCoursesCount}
            </span>
            <span className="text-xs font-mono text-zinc-400">subject(s)</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Critical (&lt;75%): <strong className="text-white">{summary.criticalCoursesCount}</strong></span>
            <span>Warning: <strong className="text-white">{summary.warningCoursesCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Duty Leaves Needed */}
        <div className="mono-card rounded-xl p-4 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Total DLs Needed
            </span>
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {summary.totalDLNeeded}
            </span>
            <span className="text-xs font-mono text-zinc-400">leaves needed</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
            To bring all subjects to ≥{targetAttendance}%
          </div>
        </div>

        {/* Card 3: Total Safe Bunks Available */}
        <div className="mono-card rounded-xl p-4 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Total Safe Bunks
            </span>
            <Coffee className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {summary.totalSafeBunks}
            </span>
            <span className="text-xs font-mono text-zinc-400">sessions buffer</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
            Across {summary.healthyCoursesCount} healthy courses
          </div>
        </div>
      </div>
    </div>
  );
};
