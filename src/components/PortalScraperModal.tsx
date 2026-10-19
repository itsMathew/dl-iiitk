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
  AlertCircle,
  Sparkles 
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

  // Exact automated console scraper snippet tailored for attendance.iiitkottayam.ac.in
  const scraperSnippet = `(async function scrapeIIITKAttendance() {
  console.log("%c[DutyLeaf Scraper]%c Starting attendance data extraction...", "color: #10b981; font-weight: bold", "color: inherit");
  
  // 1. Retrieve current JWT access token from localStorage or session
  let token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  if (!token) {
    // Attempt parsing from auth stores
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
    // 2. Fetch base attendance overview
    const overviewRes = await fetch('/api/students/me/attendance', { credentials: 'include', headers });
    if (!overviewRes.ok) throw new Error('Failed to fetch /api/students/me/attendance: ' + overviewRes.statusText);
    const overviewData = await overviewRes.json();
    
    console.log("%c[DutyLeaf Scraper]%c Loaded overview for: " + (overviewData.student?.name || 'Student'), "color: #3b82f6; font-weight: bold", "color: inherit");

    const courses = [];
    const courseList = overviewData.byCourse || [];

    // 3. Sequentially fetch per-course session records
    for (let i = 0; i < courseList.length; i++) {
      const c = courseList[i];
      console.log(\`Fetching sessions for \${c.courseCode} (\${i + 1}/\${courseList.length})...\`);
      
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
    
    // Copy directly to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(jsonStr);
      console.log("%c[DutyLeaf Scraper] SUCCESS! Data copied to your clipboard! Paste directly into DutyLeaf app.", "color: #10b981; font-size: 14px; font-weight: bold");
    }
    
    // Also log in console
    console.log(payload);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Console Scraper & Portal Tools</h2>
              <p className="text-xs text-slate-400">Browser scraper snippet and JSON payload importer/exporter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('snippet')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'snippet'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Scraper Snippet</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Raw JSON Paste</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'snippet' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">How to run in your browser:</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-slate-300">
                    <li>Open <code className="text-emerald-300">https://attendance.iiitkottayam.ac.in</code> and log in.</li>
                    <li>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] font-mono">F12</kbd> to open Developer Tools and select the <strong>Console</strong> tab.</li>
                    <li>Copy and paste the snippet below, then hit <strong>Enter</strong>.</li>
                    <li>The full JSON payload will automatically be copied to your clipboard!</li>
                  </ol>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={11}
                  value={scraperSnippet}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-300 leading-relaxed focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleCopySnippet}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Scraper Script!' : 'Copy Browser Console Snippet'}</span>
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Paste the JSON output obtained from the console scraper or export file:
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <textarea
                rows={11}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "student": { ... }, "courses": [ ... ] }'
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={handleImportJson}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Import and Render Attendance</span>
              </button>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <FileJson className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export Local Attendance Snapshot</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Download a JSON copy of all {currentCourses.length} courses and session histories for offline access or record keeping.
                </p>
              </div>
              <button
                type="button"
                onClick={exportCurrentPayload}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download attendance-{currentProfile.rollNo || 'student'}.json</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
