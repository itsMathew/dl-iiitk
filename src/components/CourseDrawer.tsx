import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Info, 
  Filter, 
  Layers, 
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { CourseAnalysis, PolicyMode, Session, SimulationParams } from '../types/attendance';
import { isBeforeAugust, simulateCourseAttendance } from '../utils/calculations';

interface CourseDrawerProps {
  course: CourseAnalysis | null;
  policy: PolicyMode;
  targetAttendance: number;
  onClose: () => void;
}

export const CourseDrawer: React.FC<CourseDrawerProps> = ({
  course,
  policy,
  targetAttendance,
  onClose,
}) => {
  if (!course) return null;

  const [activeTab, setActiveTab] = useState<'timeline' | 'scenarios' | 'simulator'>('timeline');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'present' | 'absent' | 'pre-aug'>('all');

  const [simParams, setSimParams] = useState<SimulationParams>({
    extraDL: 0,
    extraAttend: 0,
    extraBunk: 0,
  });

  const simResult = simulateCourseAttendance(course, simParams, targetAttendance);
  const hasSimulation = simParams.extraDL > 0 || simParams.extraAttend > 0 || simParams.extraBunk > 0;

  // Filter sessions
  const filteredSessions = (course.sessions || []).filter((s) => {
    const isPre = isBeforeAugust(s.date);
    const status = (s.status || '').toLowerCase();

    if (sessionFilter === 'present') return status === 'present';
    if (sessionFilter === 'absent') return status === 'absent';
    if (sessionFilter === 'pre-aug') return isPre;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.courseCode}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {course.category}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {course.sessions.length} recorded sessions
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {course.courseName}
            </h2>
            {course.faculty && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Faculty: {course.faculty}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Session Timeline ({course.sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'scenarios'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scenario Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Session Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Quick stats pills */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Total Held</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">{course.held}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[11px] text-emerald-400">Attended</div>
                  <div className="text-lg font-mono font-bold text-emerald-300 mt-0.5">{course.attended}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="text-[11px] text-rose-400">Absents</div>
                  <div className="text-lg font-mono font-bold text-rose-300 mt-0.5">{course.absent}</div>
                </div>
              </div>

              {/* Pre-Aug alert notice */}
              {course.preAugHeld > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-white">Pre-August 2026 Cutoff:</strong>{' '}
                    This course has <span className="font-bold text-indigo-300">{course.preAugHeld}</span> sessions held prior to 1 Aug 2026 (including {course.preAugAbsent} absents).
                  </div>
                </div>
              )}

              {/* Filter pills */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <div className="flex items-center gap-1">
                  {(['all', 'present', 'absent', 'pre-aug'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSessionFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition capitalize ${
                        sessionFilter === f
                          ? 'bg-slate-700 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-2">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No sessions match the selected filter.
                  </div>
                ) : (
                  filteredSessions.map((session, idx) => {
                    const isPre = isBeforeAugust(session.date);
                    const isPres = session.status === 'Present';
                    const isDL = session.status === 'Duty_leave';

                    // Format date nicely
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
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isPres
                            ? 'bg-slate-950/40 border-slate-800/80 hover:border-emerald-500/40'
                            : isDL
                            ? 'bg-purple-950/20 border-purple-500/30'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">
                              {formattedDate}
                            </span>
                            {isPre && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Pre-Aug
                              </span>
                            )}
                            {session.section && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Sec: {session.section}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {session.timing}
                            </span>
                            {session.topic && (
                              <span className="text-slate-400 italic text-[11px] truncate max-w-xs">
                                • {session.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 ml-3">
                          {isPres ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Present
                            </span>
                          ) : isDL ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                              Duty Leave
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3.5 h-3.5" />
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

          {/* TAB 2: Scenario Comparison */}
          {activeTab === 'scenarios' && (
            <div className="space-y-5">
              <div className="text-xs text-slate-400">
                Compare this course under different administrative cutoff policies side-by-side:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Baseline */}
                <div className={`p-4 rounded-2xl border ${policy === 'raw' ? 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Raw Portal Baseline
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {course.rawPercentage}%
                  </div>
                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <div>Attended: {course.attended}</div>
                    <div>Counted: {course.counted}</div>
                    <div>Held: {course.held}</div>
                  </div>
                </div>

                {/* Scenario 1 */}
                <div className={`p-4 rounded-2xl border ${policy === 'scenario1' ? 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    Scenario 1
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-indigo-300">
                    {course.scenario1Percentage}%
                  </div>
                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <div>Rule: Pre-Aug = Present</div>
                    <div className="text-indigo-400">Gain: +{(course.scenario1Percentage - course.rawPercentage).toFixed(2)}%</div>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className={`p-4 rounded-2xl border ${policy === 'scenario2' ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30' : 'bg-slate-950/40 border-slate-800'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                    Scenario 2
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-emerald-300">
                    {course.scenario2Percentage}%
                  </div>
                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <div>Rule: Pre-Aug = Duty Leave</div>
                    <div className="text-emerald-400">Gain: +{(course.scenario2Percentage - course.rawPercentage).toFixed(2)}%</div>
                  </div>
                </div>
              </div>

              {/* Mathematical Proof Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Mathematical Proof:</div>
                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <div>• Raw: ({course.attended} / {course.counted}) × 100 = {course.rawPercentage}%</div>
                  <div>• Scen 1: ({course.attended + course.preAugAbsent} / {course.counted}) × 100 = {course.scenario1Percentage}%</div>
                  <div>• Scen 2: ({course.attended} / {Math.max(1, course.counted - course.preAugHeld)}) × 100 = {course.scenario2Percentage}%</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: What-If Simulator */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Projected Attendance Simulator</h3>
                  {hasSimulation && (
                    <button
                      onClick={() => setSimParams({ extraDL: 0, extraAttend: 0, extraBunk: 0 })}
                      className="text-xs text-slate-400 hover:text-rose-400 underline"
                    >
                      Reset Values
                    </button>
                  )}
                </div>

                {/* Simulated Percentage result */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Projected Result</div>
                    <div className="text-3xl font-extrabold font-mono text-white mt-0.5">
                      {simResult.simulatedPercentage}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        simResult.meetsTarget
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {simResult.meetsTarget ? `Safe Buffer: ${simResult.newSafeBunks} classes` : `Deficit: ${simResult.newDLNeeded} DLs needed`}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Target: {targetAttendance}%
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Convert Absents to Duty Leaves:</span>
                      <span className="font-mono font-bold text-indigo-400">+{simParams.extraDL} DLs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={course.absent}
                      value={simParams.extraDL}
                      onChange={(e) => setSimParams((p) => ({ ...p, extraDL: Number(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Attend Next Upcoming Classes:</span>
                      <span className="font-mono font-bold text-emerald-400">+{simParams.extraAttend} classes</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={simParams.extraAttend}
                      onChange={(e) => setSimParams((p) => ({ ...p, extraAttend: Number(e.target.value) }))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Miss Next Upcoming Classes:</span>
                      <span className="font-mono font-bold text-rose-400">+{simParams.extraBunk} bunks</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={simParams.extraBunk}
                      onChange={(e) => setSimParams((p) => ({ ...p, extraBunk: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
