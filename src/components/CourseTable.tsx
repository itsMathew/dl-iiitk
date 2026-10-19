import React from 'react';
import { 
  ChevronRight, 
  ShieldAlert, 
  Coffee, 
  ArrowUpDown,
  User
} from 'lucide-react';
import { CourseAnalysis, PolicyMode } from '../types/attendance';

interface CourseTableProps {
  courses: CourseAnalysis[];
  policy: PolicyMode;
  targetAttendance: number;
  onOpenDrawer: (course: CourseAnalysis) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  policy,
  targetAttendance,
  onOpenDrawer,
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/90 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Held / DL</th>
              <th className="py-3 px-4">Attended / Counted</th>
              <th className="py-3 px-4">Attendance %</th>
              <th className="py-3 px-4">Status & Recommendation</th>
              <th className="py-3 px-4 text-center">Scenarios</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {courses.map((course) => {
              const isHealthy = course.percentage >= targetAttendance;
              const isCritical = course.percentage < 75;

              return (
                <tr 
                  key={course.courseId} 
                  className="hover:bg-slate-900/50 transition cursor-pointer"
                  onClick={() => onOpenDrawer(course)}
                >
                  {/* Course Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          {course.courseCode}
                        </span>
                      </div>
                      <span className="text-slate-200 text-xs font-semibold line-clamp-1">
                        {course.courseName}
                      </span>
                      {course.faculty && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-500" />
                          {course.faculty}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {course.category}
                    </span>
                  </td>

                  {/* Held / DL */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                    <div>
                      {course.held} held
                      {course.dutyLeaves > 0 && (
                        <span className="ml-1 text-indigo-400">({course.dutyLeaves} DL)</span>
                      )}
                    </div>
                  </td>

                  {/* Attended / Counted */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-200">
                    <span className="font-bold text-white">{course.attended}</span> / {course.counted}
                  </td>

                  {/* Attendance Percentage & Mini Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isCritical
                            ? 'text-rose-400'
                            : !isHealthy
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {course.percentage}%
                      </span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            isCritical
                              ? 'bg-rose-500'
                              : !isHealthy
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, course.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status & Recommendation */}
                  <td className="py-3.5 px-4">
                    {!isHealthy ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 w-fit">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          Needs {course.dlNeeded} DL{course.dlNeeded !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          or attend next {course.classesToAttend}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 w-fit">
                        <Coffee className="w-3 h-3 text-emerald-400" />
                        Safe to bunk {course.safeBunks}
                      </span>
                    )}
                  </td>

                  {/* Scenario comparison column */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <span title="Raw Portal">{course.rawPercentage}%</span>
                      <span className="text-slate-600">|</span>
                      <span title="Scenario 1 (Pre-Aug Present)" className="text-indigo-400 font-semibold">{course.scenario1Percentage}%</span>
                      <span className="text-slate-600">|</span>
                      <span title="Scenario 2 (Pre-Aug DL)" className="text-emerald-400 font-semibold">{course.scenario2Percentage}%</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer(course);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
