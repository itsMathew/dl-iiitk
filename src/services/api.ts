import { CourseAttendance, Session, StudentProfile } from '../types/attendance';
import { mockCourses, mockStudentProfile } from '../data/mockData';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

export interface AttendanceRawResponse {
  student: {
    id: string;
    rollNo: string;
    name: string;
    branch: string;
    semester: number;
  };
  overall: Array<{ status: string; count: number }>;
  byCourse: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    total: number;
    present: number;
    dlCredited: number;
    dlOverflow?: number;
    percentage: number;
  }>;
  recent?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    course: { code: string; name: string };
    section?: string;
  }>;
}

export interface CourseSessionsResponse {
  course: {
    id: string;
    code: string;
    name: string;
  };
  faculty?: Array<{ name: string; employeeId: string }>;
  total: number;
  present: number;
  dlCredited: number;
  percentage: number;
  sessions: Array<{
    sessionId: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string | null;
    section?: string;
    status: 'PRESENT' | 'ABSENT' | 'DUTY_LEAVE' | string;
    heldNoEntryScan?: boolean;
    heldReason?: string | null;
  }>;
}

// Automatically detect whether we should use relative /api (vite proxy) or direct URL
const BASE_URL = '/api';

/**
 * Authenticate against the IIIT Kottayam portal
 */
export async function loginToPortal(email: string, password: string): Promise<LoginResponse> {
  // If user enters the Mathew demo account or clicks demo, return instantaneous mock credentials
  if (email.trim().toLowerCase() === 'demo' || email.trim().toLowerCase() === 'demo@iiitkottayam.ac.in') {
    return {
      access: 'mock-jwt-token-demo',
      refresh: 'mock-refresh-token',
      user: {
        id: mockStudentProfile.id,
        email: mockStudentProfile.email || 'mathewmanachery24bcs80@iiitkottayam.ac.in',
        role: 'STUDENT',
      },
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let message = 'Login failed. Please check your email and password.';
      try {
        const jsonErr = JSON.parse(errText);
        message = jsonErr.message || jsonErr.detail || message;
      } catch {
        if (res.status === 401) message = 'Invalid email or password.';
        else if (res.status === 404) message = 'Authentication endpoint unreachable.';
      }
      throw new Error(message);
    }

    const data: LoginResponse = await res.json();
    if (!data.access) {
      throw new Error('Access token not received from server.');
    }
    return data;
  } catch (error: any) {
    // If CORS error occurred or network failed
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Network/CORS connection issue reaching the portal. Ensure Vite proxy is active on port 5173, or use Demo Mode.'
      );
    }
    throw error;
  }
}

/**
 * Fetch student overview attendance
 */
export async function fetchAttendanceOverview(token: string): Promise<AttendanceRawResponse> {
  if (token === 'mock-jwt-token-demo') {
    return {
      student: mockStudentProfile,
      overall: [
        { status: 'PRESENT', count: 193 },
        { status: 'ABSENT', count: 58 },
      ],
      byCourse: mockCourses.map((c) => ({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        total: c.totalHeld,
        present: c.present,
        dlCredited: c.creditedDL,
        percentage: Number(((c.present / Math.max(1, c.totalHeld - c.creditedDL)) * 100).toFixed(2)),
      })),
    };
  }

  const res = await fetch(`${BASE_URL}/students/me/attendance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch student attendance (${res.status} ${res.statusText})`);
  }

  return await res.json();
}

/**
 * Fetch sessions list for a specific course
 */
export async function fetchCourseSessions(token: string, courseId: string): Promise<CourseSessionsResponse> {
  if (token === 'mock-jwt-token-demo') {
    const course = mockCourses.find((c) => c.courseId === courseId) || mockCourses[0];
    return {
      course: { id: course.courseId, code: course.courseCode, name: course.courseName },
      faculty: course.faculty ? [{ name: course.faculty, employeeId: 'faculty' }] : [],
      total: course.totalHeld,
      present: course.present,
      dlCredited: course.creditedDL,
      percentage: Number(((course.present / Math.max(1, course.totalHeld - course.creditedDL)) * 100).toFixed(2)),
      sessions: course.sessions.map((s) => ({
        sessionId: s.id,
        date: s.date,
        startTime: s.timing.split(' - ')[0] || '09:30',
        endTime: s.timing.split(' - ')[1] || '10:30',
        topic: s.topic || null,
        section: s.section || 'B1',
        status: s.status.toUpperCase(),
      })),
    };
  }

  const res = await fetch(`${BASE_URL}/students/me/courses/${courseId}/sessions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch sessions for course ${courseId}`);
  }

  return await res.json();
}

/**
 * Orchestrates full student sync:
 * 1. Log in / check token
 * 2. Fetch student info and all courses
 * 3. Fetch session timelines for all courses
 * 4. Transform into clean structured CourseAttendance objects
 */
export async function syncFullStudentData(
  token: string,
  onProgress?: (status: string, current: number, total: number) => void
): Promise<{ profile: StudentProfile; courses: CourseAttendance[] }> {
  onProgress?.('Fetching student profile & course list...', 0, 1);
  const overview = await fetchAttendanceOverview(token);

  const profile: StudentProfile = {
    id: overview.student.id,
    rollNo: overview.student.rollNo,
    name: overview.student.name || 'Student',
    branch: overview.student.branch || 'CSE',
    semester: overview.student.semester || 5,
  };

  const courseList = overview.byCourse || [];
  const totalCourses = courseList.length;
  const courses: CourseAttendance[] = [];

  for (let i = 0; i < totalCourses; i++) {
    const c = courseList[i];
    onProgress?.(`Loading sessions for ${c.courseCode} (${i + 1}/${totalCourses})...`, i + 1, totalCourses);

    try {
      const sessionData = await fetchCourseSessions(token, c.courseId);
      const facultyName = sessionData.faculty && sessionData.faculty.length > 0
        ? sessionData.faculty.map((f) => f.name).join(', ')
        : undefined;

      const sessions: Session[] = (sessionData.sessions || []).map((s) => {
        let status: 'Present' | 'Absent' | 'Duty_leave' = 'Present';
        const stUpper = (s.status || '').toUpperCase();
        if (stUpper === 'ABSENT') status = 'Absent';
        else if (stUpper === 'DUTY_LEAVE' || stUpper === 'DL') status = 'Duty_leave';

        return {
          id: s.sessionId || Math.random().toString(36).substring(7),
          date: s.date,
          timing: s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : (s.startTime || '09:30 - 10:30'),
          startTime: s.startTime,
          endTime: s.endTime,
          type: (s.startTime && s.endTime && (parseInt(s.endTime) - parseInt(s.startTime) > 1)) ? 'Lab' : 'Theory',
          status,
          topic: s.topic,
          section: s.section,
        };
      });

      const totalHeld = sessionData.total ?? c.total;
      const present = sessionData.present ?? c.present;
      const creditedDL = sessionData.dlCredited ?? c.dlCredited ?? 0;
      const countedSessions = Math.max(1, totalHeld - creditedDL);
      const absent = Math.max(0, countedSessions - present);

      courses.push({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        faculty: facultyName,
        totalHeld,
        countedSessions,
        present,
        absent,
        creditedDL,
        sessions,
      });
    } catch (err) {
      console.warn(`Could not load sessions for ${c.courseCode}:`, err);
      // Fallback with aggregate counts
      const countedSessions = Math.max(1, c.total - (c.dlCredited || 0));
      courses.push({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        totalHeld: c.total,
        countedSessions,
        present: c.present,
        absent: Math.max(0, countedSessions - c.present),
        creditedDL: c.dlCredited || 0,
        sessions: [],
      });
    }
  }

  return { profile, courses };
}
