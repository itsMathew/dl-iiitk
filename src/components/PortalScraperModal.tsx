import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Upload, 
  Download, 
  Code2, 
  FileJson, 
  AlertCircle
} from 'lucide-react';
import { CourseAttendance, StudentProfile } from '../types/attendance';

interface PortalScraperModalProps {
  currentProfile: StudentProfile;
  currentCourses: CourseAttendance[];
  onImportData: (profile: StudentProfile, courses: CourseAttendance[]) => void;
  onClose: () => void;
}

export const PortalScraperModal: React.FC<PortalScraperModalProps> = ({
  currentProfile,
  currentCourses,
  onImportData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'snippet' | 'paste' | 'export'>('snippet');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const scraperSnippet = `(async function scrapeIIITKAttendance() {
  console.log("[DutyLeaf Scraper] Starting attendance data extraction...");
  
  let token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  if (!token) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      if (val && val.includes('eyJhbGciOiJIUzI1Ni')) {
        try {
          const parsed = JSON.parse(val);
          token = parsed.access || parsed.token || val;
        } catch {
          token = val;
        }
        break;
      }
    }
  }

  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': 'Bearer ' + token.replace(/["']/g, '') } : {})
  };

  try {
    const overviewRes = await fetch('/api/students/me/attendance', { credentials: 'include', headers });
    if (!overviewRes.ok) throw new Error('Failed to fetch /api/students/me/attendance: ' + overviewRes.statusText);
    const overviewData = await overviewRes.json();

    const courses = [];
    const courseList = overviewData.byCourse || [];

    for (let i = 0; i < courseList.length; i++) {
      const c = courseList[i];
      const sessRes = await fetch(\`/api/students/me/courses/\${c.courseId}/sessions\`, { credentials: 'include', headers });
      let sessData = { sessions: [] };
      if (sessRes.ok) {
        sessData = await sessRes.json();
      }

      const facultyStr = sessData.faculty && sessData.faculty.length > 0
        ? sessData.faculty.map(f => f.name).join(', ')
        : '';

      courses.push({
        courseId: c.courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        faculty: facultyStr,
        totalHeld: sessData.total || c.total,
        countedSessions: (sessData.total || c.total) - (c.dlCredited || 0),
        present: sessData.present || c.present,
        absent: ((sessData.total || c.total) - (sessData.present || c.present) - (c.dlCredited || 0)),
        creditedDL: c.dlCredited || 0,
        sessions: (sessData.sessions || []).map(s => ({
          id: s.sessionId,
          date: s.date,
          timing: s.startTime + ' - ' + s.endTime,
          status: s.status === 'PRESENT' ? 'Present' : (s.status === 'ABSENT' ? 'Absent' : 'Duty_leave'),
          topic: s.topic,
          section: s.section
        }))
      });
    }

    const payload = {
      student: overviewData.student,
      courses: courses,
      scrapedAt: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(jsonStr);
      console.log("[DutyLeaf Scraper] Copied to clipboard successfully!");
    }
    return payload;
  } catch (err) {
    console.error("[DutyLeaf Scraper Error]:", err);
  }
})();`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(scraperSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportJson = () => {
    setParseError(null);
    if (!jsonInput.trim()) {
      setParseError('Please paste valid JSON payload.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput.trim());
      const student = parsed.student || parsed.profile || currentProfile;
      const courses = parsed.courses || parsed.byCourse || [];

      if (!Array.isArray(courses) || courses.length === 0) {
        throw new Error('JSON does not contain a valid "courses" array.');
      }

      onImportData(student, courses);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON format.');
    }
  };

  const exportCurrentPayload = () => {
    const payload = {
      student: currentProfile,
      courses: currentCourses,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${currentProfile.rollNo || 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded border border-zinc-700 bg-zinc-900 text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono">Portal Console Scraper</h2>
              <p className="text-[11px] text-zinc-400 font-mono">Console snippet and JSON backup tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950 font-mono text-xs">
          <button
            onClick={() => setActiveTab('snippet')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'snippet'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Snippet</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 font-mono text-xs">
          {activeTab === 'snippet' && (
            <div className="space-y-3">
              <div className="p-3 rounded border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs">
                Run in your browser console (<kbd className="bg-zinc-800 px-1 py-0.5 rounded text-white">F12</kbd>) while logged in at <code className="text-white">attendance.iiitkottayam.ac.in</code> to export full JSON directly.
              </div>

              <textarea
                readOnly
                rows={10}
                value={scraperSnippet}
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-300 leading-relaxed focus:outline-none"
              />

              <button
                type="button"
                onClick={handleCopySnippet}
                className="w-full py-2 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Snippet!' : 'Copy Console Script'}</span>
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              {parseError && (
                <div className="p-2.5 rounded border border-white bg-zinc-950 text-white flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <textarea
                rows={11}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "student": { ... }, "courses": [ ... ] }'
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-white"
              />

              <button
                type="button"
                onClick={handleImportJson}
                className="w-full py-2 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Import JSON</span>
              </button>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 py-6 text-center">
              <FileJson className="w-10 h-10 text-white mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Download Local Snapshot</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Export session records for all {currentCourses.length} courses as a JSON backup.
                </p>
              </div>
              <button
                type="button"
                onClick={exportCurrentPayload}
                className="py-2 px-5 bg-white hover:bg-zinc-200 text-black font-bold rounded inline-flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .json file</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
