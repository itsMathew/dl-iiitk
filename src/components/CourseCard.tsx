import React, { useState } from 'react';
import { 
  ChevronRight, 
  ShieldAlert, 
  Coffee, 
  User, 
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Minus,
  Briefcase
} from 'lucide-react';
import { CourseAnalysis, SimulationParams } from '../types/attendance';
import { simulateCourseAttendance } from '../utils/calculations';

interface CourseCardProps {
  course: CourseAnalysis;
  targetAttendance: number;
  internshipEnabled: boolean;
  onOpenDrawer: (course: CourseAnalysis) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  targetAttendance,
  internshipEnabled,
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
  const isBelowTarget = activePercentage < targetAttendance;
  const isCritical = activePercentage < 75;

  const resetSim = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSimParams({ extraDL: 0, extraAttend: 0, extraBunk: 0 });
  };

  return (
    <div className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
      isBelowTarget 
        ? 'bg-zinc-950/80 border-red-900/50 hover:border-red-700/60 shadow-sm shadow-red-950/20' 
        : 'mono-card border-zinc-850 bg-black'
    }`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                isBelowTarget ? 'bg-zinc-900 border border-red-800/60 text-red-300' : 'bg-zinc-900 border border-zinc-700 text-white'
              }`}>
                {course.courseCode}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                {course.category}
              </span>
              {internshipEnabled && course.internshipSessions > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  -{course.internshipSessions} DL
                </span>
              )}
            </div>
            <h3 className="font-semibold text-white text-sm tracking-tight leading-snug line-clamp-1">
              {course.courseName}
            </h3>
          </div>

          <button
            onClick={() => onOpenDrawer(course)}
            title="Inspect Sessions"
            className="p-1 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {course.faculty && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
            <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{course.faculty}</span>
          </div>
        )}

        {/* Progress Display */}
        <div className="my-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold font-mono tracking-tight ${
                isBelowTarget ? 'text-red-500' : 'text-white'
              }`}>
                {activePercentage.toFixed(2)}%
              </span>
              {hasSimulation && (
                <span className="text-xs font-mono text-zinc-400">
                  ({simResult.deltaPercentage >= 0 ? `+${simResult.deltaPercentage}%` : `${simResult.deltaPercentage}%`})
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {hasSimulation ? simResult.simulatedAttended : course.attended} / {hasSimulation ? simResult.simulatedCounted : course.counted}
            </span>
          </div>

          {/* Progress Bar (Red when below target, White when safe) */}
          <div className="relative w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isBelowTarget ? 'bg-red-500' : 'bg-white'
              }`}
              style={{ width: `${Math.min(100, activePercentage)}%` }}
            />
            {/* Target benchmark line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10"
              style={{ left: `${targetAttendance}%` }}
              title={`Target ${targetAttendance}%`}
            />
          </div>
        </div>

        {/* Actionable Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activePercentage < targetAttendance ? (
            <>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-500/70 bg-red-950/40 text-red-400 text-xs font-mono font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Needs {hasSimulation ? simResult.newDLNeeded : course.dlNeeded} DL{ (hasSimulation ? simResult.newDLNeeded : course.dlNeeded) !== 1 ? 's' : '' }</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-900/40 bg-zinc-950 text-red-400/90 text-xs font-mono">
                <span>Attend next {course.classesToAttend}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-mono font-semibold">
              <Coffee className="w-3.5 h-3.5 text-zinc-400" />
              <span>Safe to skip {hasSimulation ? simResult.newSafeBunks : course.safeBunks} class{ (hasSimulation ? simResult.newSafeBunks : course.safeBunks) !== 1 ? 'es' : '' }</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: What-If Simulator & Timeline Trigger */}
      <div className="border-t border-zinc-800/80 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSim(!showSim)}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSim ? 'Close Sim' : 'What-If Sim'}</span>
          </button>

          {hasSimulation && (
            <button
              type="button"
              onClick={resetSim}
              className="text-[11px] text-zinc-500 hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDrawer(course)}
            className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 transition"
          >
            <span>Sessions ({course.sessions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Embedded What-If Steppers */}
        {showSim && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            {/* Stepper 1: Extra DLs approved */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Duty Leaves Approved:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraDL: Math.max(0, p.extraDL - 1) }))}
                  disabled={simParams.extraDL === 0}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-white">
                  {simParams.extraDL}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraDL: Math.min(course.absent, p.extraDL + 1) }))}
                  disabled={simParams.extraDL >= course.absent}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stepper 2: Extra Classes Attended */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Next Classes Attended:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraAttend: Math.max(0, p.extraAttend - 1) }))}
                  disabled={simParams.extraAttend === 0}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-white">
                  +{simParams.extraAttend}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraAttend: p.extraAttend + 1 }))}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stepper 3: Extra Classes Missed */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Next Classes Missed:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraBunk: Math.max(0, p.extraBunk - 1) }))}
                  disabled={simParams.extraBunk === 0}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 disabled:opacity-30 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-red-400">
                  +{simParams.extraBunk}
                </span>
                <button
                  type="button"
                  onClick={() => setSimParams((p) => ({ ...p, extraBunk: p.extraBunk + 1 }))}
                  className="w-5 h-5 rounded border border-zinc-700 bg-zinc-900 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {hasSimulation && (
              <div className="pt-2 border-t border-zinc-800 text-[11px] font-mono flex justify-between">
                <span className={simResult.meetsTarget ? 'text-zinc-300' : 'text-red-400 font-bold'}>
                  Result: {simResult.simulatedPercentage}%
                </span>
                <span className={simResult.meetsTarget ? 'font-bold text-white' : 'text-red-400 font-bold'}>
                  {simResult.meetsTarget ? 'Meets Target!' : 'Under Target'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
