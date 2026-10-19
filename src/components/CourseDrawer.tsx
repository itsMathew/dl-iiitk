import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  SlidersHorizontal,
  Plus,
  Minus,
  Briefcase
} from 'lucide-react';
import { CourseAnalysis, SimulationParams } from '../types/attendance';
import { isBeforeCutoff, simulateCourseAttendance } from '../utils/calculations';

interface CourseDrawerProps {
  course: CourseAnalysis | null;
  targetAttendance: number;
  internshipEnabled: boolean;
  internshipCutoffDate: string;
  onClose: () => void;
}

export const CourseDrawer: React.FC<CourseDrawerProps> = ({
  course,
  targetAttendance,
  internshipEnabled,
  internshipCutoffDate,
  onClose,
}) => {
  if (!course) return null;

  const [activeTab, setActiveTab] = useState<'timeline' | 'simulator'>('timeline');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'present' | 'absent' | 'internship'>('all');

  const [simParams, setSimParams] = useState<SimulationParams>({
    extraDL: 0,
    extraAttend: 0,
    extraBunk: 0,
  });

  const simResult = simulateCourseAttendance(course, simParams, targetAttendance);
  const hasSimulation = simParams.extraDL > 0 || simParams.extraAttend > 0 || simParams.extraBunk > 0;
  const isBelowTarget = course.percentage < targetAttendance;

  const filteredSessions = (course.sessions || []).filter((s) => {
    const isInternship = isBeforeCutoff(s.date, internshipCutoffDate);
    const status = (s.status || '').toLowerCase();

    if (sessionFilter === 'present') return status === 'present';
    if (sessionFilter === 'absent') return status === 'absent';
    if (sessionFilter === 'internship') return isInternship;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-black border-l border-zinc-800 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                isBelowTarget ? 'bg-zinc-900 border border-red-800/60 text-red-400' : 'bg-white text-black'
              }`}>
                {course.courseCode}
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                {course.category}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {course.sessions.length} sessions
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {course.courseName}
            </h2>
            {course.faculty && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <User className="w-3 h-3 text-zinc-500" />
                <span>Faculty: {course.faculty}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-mono border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sessions ({course.sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2.5 px-3 text-xs font-mono border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Stat boxes */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded border border-zinc-800 bg-zinc-950">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Held</div>
                  <div className="text-base font-mono font-bold text-white">{course.held}</div>
                </div>
                <div className="p-2.5 rounded border border-zinc-800 bg-zinc-950">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Attended</div>
                  <div className="text-base font-mono font-bold text-white">{course.attended}</div>
                </div>
                {/* Absents box in red if absents exist */}
                <div className={`p-2.5 rounded border ${
                  course.absent > 0 ? 'border-red-900/60 bg-red-950/20' : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className={`text-[10px] font-mono uppercase ${course.absent > 0 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                    Absent
                  </div>
                  <div className={`text-base font-mono font-bold ${course.absent > 0 ? 'text-red-400' : 'text-white'}`}>
                    {course.absent}
                  </div>
                </div>
                {/* Current % in red if below target */}
                <div className={`p-2.5 rounded border ${
                  isBelowTarget ? 'border-red-900/60 bg-red-950/20' : 'border-zinc-800 bg-zinc-950'
                }`}>
                  <div className={`text-[10px] font-mono uppercase ${isBelowTarget ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                    Current %
                  </div>
                  <div className={`text-base font-mono font-bold ${isBelowTarget ? 'text-red-500' : 'text-white'}`}>
                    {course.percentage}%
                  </div>
                </div>
              </div>

              {internshipEnabled && course.internshipSessions > 0 && (
                <div className="p-3 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-white shrink-0" />
                    <span>Internship Leaves (before {internshipCutoffDate}):</span>
                  </div>
                  <span className="font-mono font-bold text-white">{course.internshipSessions} sessions excused</span>
                </div>
              )}

              {/* Filter pills */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <div className="flex items-center gap-1">
                  {(['all', 'present', 'absent', 'internship'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSessionFilter(f)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition capitalize ${
                        sessionFilter === f
                          ? f === 'absent' ? 'bg-red-500 text-white font-bold' : 'bg-white text-black font-bold'
                          : 'text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-1.5">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs font-mono text-zinc-600">
                    No sessions match the filter.
                  </div>
                ) : (
                  filteredSessions.map((session, idx) => {
                    const isInternship = isBeforeCutoff(session.date, internshipCutoffDate);
                    const isPres = session.status === 'Present';
                    const isDL = session.status === 'Duty_leave';

                    const dateObj = new Date(session.date);
                    const formattedDate = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : session.date;

                    return (
                      <div
                        key={session.id || idx}
                        className={`p-2.5 rounded border flex items-center justify-between text-xs transition ${
                          !isPres && !isDL 
                            ? 'border-red-950/60 bg-red-950/10' 
                            : 'border-zinc-850 bg-zinc-950'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {formattedDate}
                            </span>
                            {isInternship && (
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded border border-zinc-700 text-zinc-400">
                                Pre-{internshipCutoffDate}
                              </span>
                            )}
                            {session.section && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                Sec {session.section}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {session.timing}
                            </span>
                            {session.topic && (
                              <span className="text-zinc-500 truncate max-w-xs">• {session.topic}</span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge (Red for Absent) */}
                        <div className="shrink-0 ml-2">
                          {isPres ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              Present
                            </span>
                          ) : isDL ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 font-mono text-[11px]">
                              Duty Leave
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-500/80 text-red-400 bg-red-950/40 font-mono text-[11px] font-bold">
                              <XCircle className="w-3 h-3 text-red-400" />
                              Absent
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="p-4 rounded border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400">Simulator</span>
                {hasSimulation && (
                  <button
                    onClick={() => setSimParams({ extraDL: 0, extraAttend: 0, extraBunk: 0 })}
                    className="text-xs text-zinc-400 underline hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-black flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">Projected Attendance</div>
                  <div className={`text-2xl font-mono font-bold ${simResult.meetsTarget ? 'text-white' : 'text-red-500'}`}>
                    {simResult.simulatedPercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    simResult.meetsTarget ? 'border-zinc-700 text-white' : 'border-red-500/70 text-red-400 bg-red-950/30 font-bold'
                  }`}>
                    {simResult.meetsTarget ? `Safe Buffer: ${simResult.newSafeBunks}` : `Deficit: ${simResult.newDLNeeded} DLs`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-400">Approved Duty Leaves:</span>
                    <span className="font-bold text-white">+{simParams.extraDL}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={course.absent}
                    value={simParams.extraDL}
                    onChange={(e) => setSimParams((p) => ({ ...p, extraDL: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-400">Upcoming Attended Classes:</span>
                    <span className="font-bold text-white">+{simParams.extraAttend}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={simParams.extraAttend}
                    onChange={(e) => setSimParams((p) => ({ ...p, extraAttend: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-400">Upcoming Bunked Classes:</span>
                    <span className="font-bold text-red-400">+{simParams.extraBunk}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simParams.extraBunk}
                    onChange={(e) => setSimParams((p) => ({ ...p, extraBunk: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
