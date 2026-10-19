import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  FileText 
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
  const [reason, setReason] = useState('Approved Internship / College Hackathon');
  const [eventDate, setEventDate] = useState('July 2026 to August 2026');

  const needyCourses = courses.filter((c) => c.dlNeeded > 0);

  const letterContent = `To,
The Faculty Advisor / Head of Department,
Department of Computer Science & Engineering,
Indian Institute of Information Technology Kottayam (IIITK),
Valavoor, Kerala - 686635.

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Subject: Application for Granting Duty Leaves (DL) for Academic / Internship Absences

Respected Sir/Madam,

I am ${profile.name}, a student of ${profile.branch} (Semester ${profile.semester}), bearing Roll Number ${profile.rollNo}.

I am writing this application to kindly request approval and crediting of Duty Leaves (DL) in the college attendance portal. Due to official participation in "${reason}" during the period ${eventDate}, I was unable to attend certain scheduled sessions.

As per college attendance policy, approved Duty Leaves are subtracted from the denominator (Counted Sessions = Held Sessions - Duty Leaves) to normalize attendance percentages.

Details of courses requiring Duty Leave regularization to meet the mandatory 80% threshold:

${needyCourses.length > 0 ? needyCourses.map((c, i) => `${i + 1}. ${c.courseCode} - ${c.courseName}:
   • Current Attendance: ${c.percentage}% (${c.attended}/${c.counted} sessions)
   • Duty Leaves Requested: ${c.dlNeeded} session(s)`).join('\n\n') : 'All courses currently meet the attendance target. This is a general regularization request.'}

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded border border-zinc-700 bg-zinc-900 text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono">Duty Leave Application Letter</h2>
              <p className="text-[11px] text-zinc-400 font-mono">Formal draft for Faculty Advisor / HoD approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">
                Reason / Activity:
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">
                Date Range / Period:
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <textarea
            readOnly
            rows={13}
            value={letterContent}
            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 leading-relaxed focus:outline-none"
          />
        </div>

        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">
            {needyCourses.length} deficit courses
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-white flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded bg-white hover:bg-zinc-200 text-black font-bold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Letter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
