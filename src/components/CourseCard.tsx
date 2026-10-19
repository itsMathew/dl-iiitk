import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert, 
  Coffee, 
  Sparkles, 
  Calendar, 
  User, 
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';
import { CourseAnalysis, PolicyMode, SimulationParams } from '../types/attendance';
import { simulateCourseAttendance } from '../utils/calculations';

interface CourseCardProps {
  course: CourseAnalysis;
  policy: PolicyMode;
  targetAttendance: number;
  onOpenDrawer: (course: CourseAnalysis) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  policy,
  targetAttendance,
  onOpenDrawer,
}) => {
  const [showSim, setShowSim] = useState(false);
  const [simParams, setSimParams] = useState<SimulationParams>({
    extraDL: 0,
    extraAttend: 0,
    extraBunk: 0,
  });

  const hasSimulation = simParams.extraDL > 0 || simParams.extraAttend > 0 || simParams.extraBunk > 0;
  const simResult = simulateCourseAttendance(course, simParams, targetAttendance);

  const activePercentage = hasSimulation ? simResult.simulatedPercentage : course.percentage;

  // Determine color scheme based on percentage
  const getColorClasses = (pct: number) => {
    if (pct < 75) {
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        bar: 'bg-rose-500',
        glow: 'glow-rose',
      };
    }
    if (pct < targetAttendance) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        bar: 'bg-amber-500',
        glow: 'glow-amber',
      };
    }
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      bar: 'bg-emerald-500',
      glow: 'glow-emerald',
    };
  };

  const colors = getColorClasses(activePercentage);

  const resetSim = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSimParams({ extraDL: 0, extraAttend: 0, extraBunk: 0 });
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between relative group ${hasSimulation ? 'ring-1 ring-indigo-500/40' : ''}`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-indigo-300">
                {course.courseCode}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800/70 text-slate-400">
                {course.category}
              </span>
              {course.preAugHeld > 0 && policy !== 'raw' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {policy === 'scenario1' ? `+${course.preAugAbsent} Present` : `-${course.preAugHeld} Denom`}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-white text-base tracking-tight leading-snug line-clamp-1 group-hover:text-indigo-200 transition">
              {course.courseName}
            </h3>
          </div>

          {/* Quick Details Drawer button */}
          <button
            onClick={() => onOpenDrawer(course)}
            title="Inspect Sessions & Scenarios"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {course.faculty && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{course.faculty}</span>
          </div>
        )}

        {/* Progress Display */}
        <div className="my-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold font-mono tracking-tight ${colors.text}`}>
                {activePercentage.toFixed(2)}%
              </span>
              {hasSimulation && (
                <span className="text-xs font-mono font-medium text-slate-400">
                  ({simResult.deltaPercentage >= 0 ? `+${simResult.deltaPercentage}%` : `${simResult.deltaPercentage}%`})
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-slate-400 font-mono">
              {hasSimulation ? simResult.simulatedAttended : course.attended} / {hasSimulation ? simResult.simulatedCounted : course.counted} counted
            </span>
          </div>

          {/* Progress Bar with 80% Target Marker */}
          <div className="relative w-full bg-slate-850 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
              style={{ width: `${Math.min(100, activePercentage)}%` }}
            />
            {/* Visual target benchmark line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/70 z-10"
              style={{ left: `${targetAttendance}%` }}
              title={`Target ${targetAttendance}%`}
            />
          </div>
        </div>

        {/* Actionable Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activePercentage < targetAttendance ? (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Needs {hasSimulation ? simResult.newDLNeeded : course.dlNeeded} DL{ (hasSimulation ? simResult.newDLNeeded : course.dlNeeded) !== 1 ? 's' : '' }</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                <span>Attend next {course.classesToAttend} class{course.classesToAttend !== 1 ? 'es' : ''}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
              <Coffee className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe to skip {hasSimulation ? simResult.newSafeBunks : course.safeBunks} class{ (hasSimulation ? simResult.newSafeBunks : course.safeBunks) !== 1 ? 'es' : '' }</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: What-If Simulator & Timeline Trigger */}
      <div className="border-t border-slate-800/80 pt-3">
        {/* Toggle What-If Simulation Accordion */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSim(!showSim)}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showSim ? 'Hide Simulator' : 'What-If Simulation'}</span>
          </button>

          {hasSimulation && (
            <button
              type="button"
              onClick={resetSim}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDrawer(course)}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            <span>Sessions ({course.sessions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Embedded Interactive What-If Steppers */}
        {showSim && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 animate-in fade-in">
            {/* Stepper 1: Extra DLs approved */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Duty Leaves Approved:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraDL: Math.max(0, p.extraDL - 1) }))}
                  disabled={simParams.extraDL === 0}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-indigo-300">
                  {simParams.extraDL}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraDL: Math.min(course.absent, p.extraDL + 1) }))}
                  disabled={simParams.extraDL >= course.absent}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stepper 2: Extra Classes Attended */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Next Classes Attended:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraAttend: Math.max(0, p.extraAttend - 1) }))}
                  disabled={simParams.extraAttend === 0}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-emerald-400">
                  +{simParams.extraAttend}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraAttend: p.extraAttend + 1 }))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stepper 3: Extra Classes Missed */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Next Classes Missed:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraBunk: Math.max(0, p.extraBunk - 1) }))}
                  disabled={simParams.extraBunk === 0}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-rose-400">
                  +{simParams.extraBunk}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraBunk: p.extraBunk + 1 }))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {hasSimulation && (
              <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Result: {simResult.simulatedPercentage}%</span>
                <span className={simResult.meetsTarget ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {simResult.meetsTarget ? 'Meets Target!' : 'Still in deficit'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
