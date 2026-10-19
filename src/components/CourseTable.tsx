import React from 'react';
import { 
  ChevronRight, 
  ShieldAlert, 
  Coffee, 
  User, 
  Briefcase
} from 'lucide-react';
import { CourseAnalysis } from '../types/attendance';

interface CourseTableProps {
  courses: CourseAnalysis[];
  targetAttendance: number;
  internshipEnabled: boolean;
  onOpenDrawer: (course: CourseAnalysis) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  targetAttendance,
  internshipEnabled,
  onOpenDrawer,
}) => {
  return (
    <div className="mono-panel rounded-xl border border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Held / DL</th>
              <th className="py-3 px-4">Attended / Counted</th>
              <th className="py-3 px-4">Attendance %</th>
              <th className="py-3 px-4">Status & Requirement</th>
              {internshipEnabled && <th className="py-3 px-4 text-center">Internship DL</th>}
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850 font-medium">
            {courses.map((course) => {
              const isBelowTarget = course.percentage < targetAttendance;

              return (
                <tr 
                  key={course.courseId} 
                  className={`hover:bg-zinc-900/60 transition cursor-pointer ${isBelowTarget ? 'bg-red-950/10' : ''}`}
                  onClick={() => onOpenDrawer(course)}
                >
                  {/* Course Details */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${isBelowTarget ? 'text-red-400' : 'text-white'}`}>
                          {course.courseCode}
                        </span>
                      </div>
                      <span className="text-zinc-200 text-xs font-semibold line-clamp-1">
                        {course.courseName}
                      </span>
                      {course.faculty && (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-zinc-600" />
                          {course.faculty}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-zinc-800 text-zinc-400">
                      {course.category}
                    </span>
                  </td>

                  {/* Held / DL */}
                  <td className="py-3 px-4 text-xs font-mono text-zinc-300">
                    <div>
                      {course.held} held
                      {course.dutyLeaves > 0 && (
                        <span className="ml-1 text-zinc-400 font-semibold">({course.dutyLeaves} DL)</span>
                      )}
                    </div>
                  </td>

                  {/* Attended / Counted */}
                  <td className="py-3 px-4 text-xs font-mono text-zinc-200">
                    <span className="font-bold text-white">{course.attended}</span> / {course.counted}
                  </td>

                  {/* Attendance Percentage & Mini Progress Bar (Red if below target) */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-sm ${isBelowTarget ? 'text-red-500' : 'text-zinc-200'}`}>
                        {course.percentage}%
                      </span>
                      <div className="w-16 bg-zinc-900 border border-zinc-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isBelowTarget ? 'bg-red-500' : 'bg-white'}`}
                          style={{ width: `${Math.min(100, course.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status & Recommendation */}
                  <td className="py-3 px-4">
                    {isBelowTarget ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-red-500/70 text-red-400 bg-red-950/40 w-fit">
                          <ShieldAlert className="w-3 h-3 text-red-400" />
                          Needs {course.dlNeeded} DL{course.dlNeeded !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] font-mono text-red-400/80">
                          or attend next {course.classesToAttend}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-700 text-zinc-300 bg-zinc-950 w-fit">
                        <Coffee className="w-3 h-3 text-zinc-400" />
                        Safe to bunk {course.safeBunks}
                      </span>
                    )}
                  </td>

                  {/* Internship DL column */}
                  {internshipEnabled && (
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs text-zinc-300">
                        {course.internshipSessions > 0 ? `-${course.internshipSessions} DL` : '—'}
                      </span>
                    </td>
                  )}

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer(course);
                      }}
                      className="p-1 rounded border border-zinc-800 text-zinc-400 hover:text-white transition"
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
