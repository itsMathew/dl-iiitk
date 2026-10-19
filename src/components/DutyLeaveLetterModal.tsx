import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { CourseAnalysis, StudentProfile } from '../types/attendance';

interface DutyLeaveLetterModalProps {
  profile: StudentProfile;
  courses: CourseAnalysis[];
  onClose: () => void;
}

export const DutyLeaveLetterModal: React.FC<DutyLeaveLetterModalProps> = ({
  profile,
  courses,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [reason, setReason] = useState('College Approved Hackathon / Technical Activity / Medical');
  const [eventDate, setEventDate] = useState('July 22, 2026 to July 30, 2026');

  // Filter courses that need DLs
  const needyCourses = courses.filter((c) => c.dlNeeded > 0);

  const letterContent = `To,
The Faculty Advisor / Head of Department,
Department of Computer Science & Engineering,
Indian Institute of Information Technology Kottayam (IIITK),
Valavoor, Kerala - 686635.

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Subject: Application for Granting Duty Leaves (DL) for Academic / Activity Absences

Respected Sir/Madam,

I am ${profile.name}, a student of ${profile.branch} (Semester ${profile.semester}), bearing Roll Number ${profile.rollNo}.

I am writing this application to kindly request approval and crediting of Duty Leaves (DL) in the college attendance portal. Due to official participation in "${reason}" during the period ${eventDate}, I was unable to attend certain scheduled lecture and practical sessions.

As per college attendance policy, approved Duty Leaves are subtracted from the denominator (Counted Sessions = Held Sessions - Duty Leaves) to normalize attendance percentages.

Details of courses requiring Duty Leave regularization to meet the mandatory 80% threshold:

${needyCourses.length > 0 ? needyCourses.map((c, i) => `${i + 1}. ${c.courseCode} - ${c.courseName}:
   • Current Attendance: ${c.percentage}% (${c.attended}/${c.counted} sessions)
   • Duty Leaves Requested: ${c.dlNeeded} session(s)
   • Pre-August Sessions Affected: ${c.preAugHeld} held (${c.preAugAbsent} absent)`).join('\n\n') : 'All courses currently meet the attendance target. This is a general regularization request.'}

I request you to kindly sanction the duty leave approval in the portal so that my attendance record is updated accordingly.

Thanking you,

Yours sincerely,
${profile.name}
Roll Number: ${profile.rollNo}
Department: ${profile.branch}, Semester ${profile.semester}
IIIT Kottayam`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: sans-serif; white-space: pre-wrap; font-size: 13px; line-height: 1.6; padding: 24px;">${letterContent}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Duty Leave Formal Application Letter</h2>
              <p className="text-xs text-slate-400">Auto-filled formal draft for Faculty Advisor / HoD approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Reason / Event Name:
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Period / Date Range:
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={14}
              value={letterContent}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 leading-relaxed focus:outline-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Includes {needyCourses.length} deficit course breakdown
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Draft</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
