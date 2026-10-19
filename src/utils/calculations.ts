import { CourseAttendance, CourseAnalysis, OverallSummary, PolicyMode, Session, SimulationParams, SimulationResult } from '../types/attendance';

export const DEFAULT_CUTOFF = '2026-08-01';

/**
 * Checks if a session occurred before a given cutoff date
 */
export function isBeforeCutoff(dateStr: string, cutoffDate: string = DEFAULT_CUTOFF): boolean {
  if (!dateStr || !cutoffDate) return false;
  // Compare date portion YYYY-MM-DD
  const sDate = dateStr.slice(0, 10);
  const cDate = cutoffDate.slice(0, 10);
  return sDate < cDate;
}

/**
 * Infers category based on course code and title
 */
export function inferCourseCategory(code: string, name: string): 'Core' | 'Theory' | 'Lab' | 'Elective' | 'Humanities' {
  const codeUpper = (code || '').toUpperCase();
  const nameUpper = (name || '').toUpperCase();

  if (nameUpper.includes('LAB') || nameUpper.includes('PRACTICAL') || codeUpper.includes('LAB')) {
    return 'Lab';
  }
  if (codeUpper.startsWith('IHS') || nameUpper.includes('MANAGEMENT') || nameUpper.includes('ACCOUNTING') || nameUpper.includes('HUMAN RESOURCE')) {
    return 'Humanities';
  }
  if (codeUpper.startsWith('IMA') || codeUpper.startsWith('CSS') || codeUpper.startsWith('IEG') || codeUpper.startsWith('CSE')) {
    if (nameUpper.includes('SOFT COMPUTING') || nameUpper.includes('DIGITAL SIGNAL')) {
      return 'Elective';
    }
    return 'Core';
  }
  return 'Theory';
}

/**
 * Calculates course metrics factoring in internship leave exemption & cutoff date
 */
export function analyzeCourse(
  course: CourseAttendance,
  internshipEnabled: boolean,
  cutoffDate: string = DEFAULT_CUTOFF,
  policy: PolicyMode = 'scenario2',
  targetPercentage: number = 80
): CourseAnalysis {
  const targetFraction = targetPercentage / 100;
  const sessions = course.sessions || [];

  let preCutoffHeld = 0;
  let preCutoffAbsent = 0;
  let preCutoffPresent = 0;
  let preCutoffDL = 0;

  let postCutoffHeld = 0;
  let postCutoffAbsent = 0;
  let postCutoffPresent = 0;
  let postCutoffDL = 0;

  sessions.forEach((s) => {
    const isPre = isBeforeCutoff(s.date, cutoffDate);
    const status = (s.status || '').toLowerCase();

    if (isPre) {
      preCutoffHeld++;
      if (status === 'absent') preCutoffAbsent++;
      else if (status === 'duty_leave' || status === 'dl') preCutoffDL++;
      else preCutoffPresent++;
    } else {
      postCutoffHeld++;
      if (status === 'absent') postCutoffAbsent++;
      else if (status === 'duty_leave' || status === 'dl') postCutoffDL++;
      else postCutoffPresent++;
    }
  });

  const totalHeld = course.totalHeld || sessions.length;
  const rawPresent = course.present ?? (preCutoffPresent + postCutoffPresent);
  const rawDL = course.creditedDL ?? (preCutoffDL + postCutoffDL);
  const rawAbsent = course.absent ?? (preCutoffAbsent + postCutoffAbsent);
  const rawCounted = Math.max(1, totalHeld - rawDL);
  const rawPercentage = (rawPresent / rawCounted) * 100;

  let held = totalHeld;
  let dutyLeaves = rawDL;
  let counted = rawCounted;
  let attended = rawPresent;
  let absent = rawAbsent;
  let percentage = rawPercentage;

  if (internshipEnabled) {
    if (policy === 'scenario1') {
      // Pre-cutoff granted as present
      attended = rawPresent + preCutoffAbsent;
      counted = rawCounted;
      percentage = Math.min(100, (attended / counted) * 100);
      absent = Math.max(0, counted - attended);
    } else {
      // Scenario 2 (default): Pre-cutoff excused as Duty Leaves (subtracted from denominator)
      dutyLeaves = rawDL + preCutoffHeld;
      counted = Math.max(1, totalHeld - dutyLeaves);
      attended = postCutoffPresent;
      percentage = Math.min(100, (attended / counted) * 100);
      absent = Math.max(0, counted - attended);
    }
  }

  // Deficit (DL needed) & Buffer (Safe bunks)
  let dlNeeded = 0;
  let safeBunks = 0;
  let classesToAttend = 0;

  if (percentage < targetPercentage) {
    // DL Needed = ceil(Counted - (Attended / Target))
    const rawDlNeeded = Math.ceil(counted - (attended / targetFraction));
    dlNeeded = Math.max(0, Math.min(absent, rawDlNeeded));

    if (targetFraction < 1) {
      const neededClasses = Math.ceil((targetFraction * counted - attended) / (1 - targetFraction));
      classesToAttend = Math.max(0, neededClasses);
    } else {
      classesToAttend = absent;
    }
  } else {
    // Safe Bunks = floor((Attended / Target) - Counted)
    const rawSafeBunks = Math.floor((attended / targetFraction) - counted);
    safeBunks = Math.max(0, rawSafeBunks);
  }

  let status: 'critical' | 'warning' | 'healthy' = 'healthy';
  if (percentage < 75) {
    status = 'critical';
  } else if (percentage < targetPercentage) {
    status = 'warning';
  } else {
    status = 'healthy';
  }

  return {
    courseId: course.courseId || course.courseCode,
    courseCode: course.courseCode,
    courseName: course.courseName,
    faculty: course.faculty,
    category: course.category || inferCourseCategory(course.courseCode, course.courseName),
    held,
    dutyLeaves,
    counted,
    attended,
    absent,
    percentage: Number(percentage.toFixed(2)),
    rawPercentage: Number(rawPercentage.toFixed(2)),
    adjustedPercentage: Number(percentage.toFixed(2)),
    internshipSessions: preCutoffHeld,
    internshipAbsent: preCutoffAbsent,
    status,
    dlNeeded,
    classesToAttend,
    safeBunks,
    sessions,
  };
}

/**
 * Global Summary without overall attendance
 */
export function calculateOverallSummary(
  courses: CourseAttendance[],
  internshipEnabled: boolean,
  cutoffDate: string = DEFAULT_CUTOFF,
  policy: PolicyMode = 'scenario2',
  targetPercentage: number = 80
): OverallSummary {
  const analyzedCourses = courses.map((c) =>
    analyzeCourse(c, internshipEnabled, cutoffDate, policy, targetPercentage)
  );

  let criticalCoursesCount = 0;
  let warningCoursesCount = 0;
  let healthyCoursesCount = 0;
  let totalDLNeeded = 0;
  let totalSafeBunks = 0;
  let totalInternshipLeavesGranted = 0;

  analyzedCourses.forEach((c) => {
    if (c.status === 'critical') criticalCoursesCount++;
    else if (c.status === 'warning') warningCoursesCount++;
    else healthyCoursesCount++;

    totalDLNeeded += c.dlNeeded;
    totalSafeBunks += c.safeBunks;
    if (internshipEnabled) {
      totalInternshipLeavesGranted += c.internshipSessions;
    }
  });

  return {
    criticalCoursesCount,
    warningCoursesCount,
    healthyCoursesCount,
    totalDLNeeded,
    totalSafeBunks,
    totalInternshipLeavesGranted,
  };
}

/**
 * Live simulation what-if calculation for a course
 */
export function simulateCourseAttendance(
  courseAnalysis: CourseAnalysis,
  params: SimulationParams,
  targetPercentage: number = 80
): SimulationResult {
  const targetFraction = targetPercentage / 100;
  const extraDL = Math.max(0, Math.min(courseAnalysis.absent, params.extraDL));
  const extraAttend = Math.max(0, params.extraAttend);
  const extraBunk = Math.max(0, params.extraBunk);

  const simulatedAttended = courseAnalysis.attended + extraAttend;
  const simulatedCounted = Math.max(1, courseAnalysis.counted - extraDL + extraAttend + extraBunk);
  const simulatedHeld = courseAnalysis.held + extraAttend + extraBunk;
  const simulatedDL = courseAnalysis.dutyLeaves + extraDL;

  const simulatedPercentage = Math.min(100, (simulatedAttended / simulatedCounted) * 100);
  const deltaPercentage = simulatedPercentage - courseAnalysis.percentage;
  const meetsTarget = simulatedPercentage >= targetPercentage;

  let newSafeBunks = 0;
  let newDLNeeded = 0;

  if (meetsTarget) {
    newSafeBunks = Math.max(0, Math.floor((simulatedAttended / targetFraction) - simulatedCounted));
  } else {
    const rawNeeded = Math.ceil(simulatedCounted - (simulatedAttended / targetFraction));
    const currentAbsents = simulatedCounted - simulatedAttended;
    newDLNeeded = Math.max(0, Math.min(currentAbsents, rawNeeded));
  }

  return {
    simulatedAttended,
    simulatedCounted,
    simulatedHeld,
    simulatedDL,
    simulatedPercentage: Number(simulatedPercentage.toFixed(2)),
    deltaPercentage: Number(deltaPercentage.toFixed(2)),
    meetsTarget,
    newSafeBunks,
    newDLNeeded,
  };
}
