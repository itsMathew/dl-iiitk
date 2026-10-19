export type PolicyMode = 'raw' | 'scenario1' | 'scenario2';

export interface Session {
  id: string;
  date: string; // ISO or parseable date string
  timing: string; // e.g., "16:30 - 17:30"
  startTime?: string;
  endTime?: string;
  room?: string;
  type?: 'Theory' | 'Lab';
  status: 'Present' | 'Absent' | 'Duty_leave';
  topic?: string | null;
  section?: string;
  isPreAug?: boolean;
}

export interface CourseAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  faculty?: string;
  category?: 'Core' | 'Theory' | 'Lab' | 'Elective' | 'Humanities';
  totalHeld: number;
  countedSessions: number;
  present: number;
  absent: number;
  creditedDL: number;
  sessions: Session[];
}

export interface StudentProfile {
  id: string;
  rollNo: string;
  name: string;
  branch: string;
  semester: number;
  email?: string;
}

export interface CourseAnalysis {
  courseId: string;
  courseCode: string;
  courseName: string;
  faculty?: string;
  category: 'Core' | 'Theory' | 'Lab' | 'Elective' | 'Humanities';
  held: number;
  dutyLeaves: number;
  counted: number;
  attended: number;
  absent: number;
  percentage: number;
  rawPercentage: number;
  adjustedPercentage: number;
  internshipSessions: number;
  internshipAbsent: number;
  status: 'critical' | 'warning' | 'healthy';
  dlNeeded: number;
  classesToAttend: number;
  safeBunks: number;
  sessions: Session[];
}

export interface OverallSummary {
  criticalCoursesCount: number;
  warningCoursesCount: number;
  healthyCoursesCount: number;
  totalDLNeeded: number;
  totalSafeBunks: number;
  totalInternshipLeavesGranted: number;
}

export interface SimulationParams {
  extraDL: number;
  extraAttend: number;
  extraBunk: number;
}

export interface SimulationResult {
  simulatedAttended: number;
  simulatedCounted: number;
  simulatedHeld: number;
  simulatedDL: number;
  simulatedPercentage: number;
  deltaPercentage: number;
  meetsTarget: boolean;
  newSafeBunks: number;
  newDLNeeded: number;
}
