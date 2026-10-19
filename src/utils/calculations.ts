import { CourseAttendance, CourseAnalysis, OverallSummary, PolicyMode, Session, SimulationParams, SimulationResult } from '../types/attendance';

export const PRE_AUG_CUTOFF = '2026-08-01T00:00:00.000Z';

/**
 * Checks if a session occurred before August 1, 2026
 */
export function isBeforeAugust(dateStr: string): boolean {
  if (!dateStr) return false;
  // Handles ISO strings "2026-07-30T00:00:00.000Z" or "2026-07-30"
  return new Date(dateStr) < new Date('2026-08-01T00:00:00.000Z');
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
 * Calculates raw or policy-adjusted course metrics
 */
export function analyzeCourse(
  course: CourseAttendance,
  policy: PolicyMode,
  targetPercentage: number = 80
): CourseAnalysis {
  const targetFraction = targetPercentage / 100;
  const sessions = course.sessions || [];

  // Categorize sessions
  let preAugHeld = 0;
  let preAugAbsent = 0;
  let preAugPresent = 0;
  let preAugDL = 0;

  let postAugHeld = 0;
  let postAugAbsent = 0;
  let postAugPresent = 0;
  let postAugDL = 0;

  sessions.forEach((s) => {
    const isPre = isBeforeAugust(s.date);
    const status = s.status ? s.status.toLowerCase() : 'present';

    if (isPre) {
      preAugHeld++;
      if (status === 'absent') preAugAbsent++;
      else if (status === 'duty_leave' || status === 'dl') preAugDL++;
      else preAugPresent++;
    } else {
      postAugHeld++;
      if (status === 'absent') postAugAbsent++;
      else if (status === 'duty_leave' || status === 'dl') postAugDL++;
      else postAugPresent++;
    }
  });

  // Total session statistics
  const totalSessionsCount = sessions.length;
  const totalHeld = course.totalHeld || totalSessionsCount;
  const rawPresent = course.present ?? (preAugPresent + postAugPresent);
  const rawDL = course.creditedDL ?? (preAugDL + postAugDL);
  const rawAbsent = course.absent ?? (preAugAbsent + postAugAbsent);
  const rawCounted = Math.max(1, totalHeld - rawDL);
  const rawPercentage = (rawPresent / rawCounted) * 100;

  // Scenario 1: Pre-August as Present
  // All sessions held prior to Aug 1 granted full attendance (added to numerator, denominator unchanged)
  const scen1Present = rawPresent + preAugAbsent;
  const scen1Counted = rawCounted;
  const scenario1Percentage = Math.min(100, (scen1Present / scen1Counted) * 100);

  // Scenario 2: Pre-August as Duty Leave
  // All sessions held prior to Aug 1 converted to Duty Leaves (subtracted entirely from denominator)
  // Pre-August sessions are removed from counted sessions.
  // Counted = totalHeld - (rawDL + preAugAbsent + preAugPresent)
  // Attended = postAugPresent
  const scen2DL = rawDL + preAugHeld;
  const scen2Counted = Math.max(1, totalHeld - scen2DL);
  const scen2Present = postAugPresent;
  const scenario2Percentage = Math.min(100, (scen2Present / scen2Counted) * 100);

  // Select active values based on policy
  let held = totalHeld;
  let dutyLeaves = rawDL;
  let counted = rawCounted;
  let attended = rawPresent;
  let absent = rawAbsent;
  let percentage = rawPercentage;

  if (policy === 'scenario1') {
    attended = scen1Present;
    counted = scen1Counted;
    percentage = scenario1Percentage;
    absent = Math.max(0, counted - attended);
  } else if (policy === 'scenario2') {
    dutyLeaves = scen2DL;
    attended = scen2Present;
    counted = scen2Counted;
    percentage = scenario2Percentage;
    absent = Math.max(0, counted - attended);
  }

  // Deficit and Buffer calculations
  let dlNeeded = 0;
  let safeBunks = 0;
  let classesToAttend = 0;

  if (percentage < targetPercentage) {
    // Formula: DL Needed = ceil(Counted - (Attended / Target))
    const rawDlNeeded = Math.ceil(counted - (attended / targetFraction));
    dlNeeded = Math.max(0, Math.min(absent, rawDlNeeded));

    // Consecutive classes to attend to reach target:
    // (Attended + C) / (Counted + C) >= T => C = ceil((T*Counted - Attended) / (1 - T))
    if (targetFraction < 1) {
      const neededClasses = Math.ceil((targetFraction * counted - attended) / (1 - targetFraction));
      classesToAttend = Math.max(0, neededClasses);
    } else {
      classesToAttend = absent;
    }
  } else {
    // Formula: Safe Bunks = floor((Attended / Target) - Counted)
    const rawSafeBunks = Math.floor((attended / targetFraction) - counted);
    safeBunks = Math.max(0, rawSafeBunks);
  }

  // Status badge logic
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
    scenario1Percentage: Number(scenario1Percentage.toFixed(2)),
    scenario2Percentage: Number(scenario2Percentage.toFixed(2)),
    preAugHeld,
    preAugAbsent,
    status,
    dlNeeded,
    classesToAttend,
    safeBunks,
    sessions,
  };
}

/**
 * Computes global overall statistics across all courses
 */
export function calculateOverallSummary(
  courses: CourseAttendance[],
  policy: PolicyMode,
  targetPercentage: number = 80
): OverallSummary {
  const analyzedCourses = courses.map((c) => analyzeCourse(c, policy, targetPercentage));
  const rawCourses = courses.map((c) => analyzeCourse(c, 'raw', targetPercentage));

  let totalAttended = 0;
  let totalCounted = 0;
  let totalHeld = 0;
  let totalDL = 0;
  let criticalCoursesCount = 0;
  let warningCoursesCount = 0;
  let healthyCoursesCount = 0;
  let totalDLNeeded = 0;
  let totalSafeBunks = 0;

  analyzedCourses.forEach((c) => {
    totalAttended += c.attended;
    totalCounted += c.counted;
    totalHeld += c.held;
    totalDL += c.dutyLeaves;

    if (c.status === 'critical') criticalCoursesCount++;
    else if (c.status === 'warning') warningCoursesCount++;
    else healthyCoursesCount++;

    totalDLNeeded += c.dlNeeded;
    totalSafeBunks += c.safeBunks;
  });

  const overallPercentage = totalCounted > 0 ? (totalAttended / totalCounted) * 100 : 0;

  let rawTotalAttended = 0;
  let rawTotalCounted = 0;
  rawCourses.forEach((c) => {
    rawTotalAttended += c.attended;
    rawTotalCounted += c.counted;
  });
  const baselinePercentage = rawTotalCounted > 0 ? (rawTotalAttended / rawTotalCounted) * 100 : 0;
  const scenarioGain = overallPercentage - baselinePercentage;

  return {
    totalAttended,
    totalCounted,
    totalHeld,
    totalDL,
    overallPercentage: Number(overallPercentage.toFixed(2)),
    criticalCoursesCount,
    warningCoursesCount,
    healthyCoursesCount,
    totalDLNeeded,
    totalSafeBunks,
    baselinePercentage: Number(baselinePercentage.toFixed(2)),
    scenarioGain: Number(scenarioGain.toFixed(2)),
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
  // DL reduces counted; new classes (attended or bunked) increase counted
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
