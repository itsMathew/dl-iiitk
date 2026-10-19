import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  BookOpen, 
  AlertTriangle
} from 'lucide-react';
import { CourseAttendance, CourseAnalysis, PolicyMode, StudentProfile } from './types/attendance';
import { analyzeCourse, calculateOverallSummary, DEFAULT_CUTOFF } from './utils/calculations';
import { syncFullStudentData } from './services/api';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { GlobalSummary } from './components/GlobalSummary';
import { CourseCard } from './components/CourseCard';
import { CourseTable } from './components/CourseTable';
import { CourseDrawer } from './components/CourseDrawer';
import { DutyLeaveLetterModal } from './components/DutyLeaveLetterModal';
import { PortalScraperModal } from './components/PortalScraperModal';

export const App: React.FC = () => {
  // Authentication & Data State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<CourseAttendance[]>([]);

  // Internship Leaves Exemption Settings
  const [internshipEnabled, setInternshipEnabled] = useState<boolean>(true);
  const [internshipCutoffDate, setInternshipCutoffDate] = useState<string>(DEFAULT_CUTOFF);

  // Policy & Target Settings
  const [policy, setPolicy] = useState<PolicyMode>('scenario2');
  const [targetAttendance, setTargetAttendance] = useState<number>(80);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedCourseForDrawer, setSelectedCourseForDrawer] = useState<CourseAnalysis | null>(null);
  const [showLetterModal, setShowLetterModal] = useState<boolean>(false);
  const [showScraperModal, setShowScraperModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleLoginSuccess = (data: { profile: StudentProfile; courses: CourseAttendance[]; token: string }) => {
    setProfile(data.profile);
    setCourses(data.courses);
    setToken(data.token);
    setIsAuthenticated(true);
  };

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const refreshed = await syncFullStudentData(token);
      setProfile(refreshed.profile);
      setCourses(refreshed.courses);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setProfile(null);
    setCourses([]);
    setSelectedCourseForDrawer(null);
  };

  // Compute analyzed courses based on internship toggle & cutoff date
  const analyzedCourses = useMemo(() => {
    return courses.map((c) =>
      analyzeCourse(c, internshipEnabled, internshipCutoffDate, policy, targetAttendance)
    );
  }, [courses, internshipEnabled, internshipCutoffDate, policy, targetAttendance]);

  // Overall Global Summary (no overall attendance)
  const summary = useMemo(() => {
    return calculateOverallSummary(
      courses,
      internshipEnabled,
      internshipCutoffDate,
      policy,
      targetAttendance
    );
  }, [courses, internshipEnabled, internshipCutoffDate, policy, targetAttendance]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return analyzedCourses.filter((course) => {
      const matchesSearch =
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.faculty && course.faculty.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesCritical = !filterCriticalOnly || course.percentage < targetAttendance;

      return matchesSearch && matchesCategory && matchesCritical;
    });
  }, [analyzedCourses, searchQuery, selectedCategory, filterCriticalOnly, targetAttendance]);

  useEffect(() => {
    if (selectedCourseForDrawer) {
      const updated = analyzedCourses.find((c) => c.courseId === selectedCourseForDrawer.courseId);
      if (updated) setSelectedCourseForDrawer(updated);
    }
  }, [analyzedCourses]);

  if (!isAuthenticated || !profile) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col antialiased">
      {/* Black & White Header with Internship Leaves Toggle & Cutoff Date */}
      <Navbar
        profile={profile}
        internshipEnabled={internshipEnabled}
        onToggleInternship={setInternshipEnabled}
        internshipCutoffDate={internshipCutoffDate}
        onCutoffDateChange={setInternshipCutoffDate}
        policy={policy}
        onPolicyChange={setPolicy}
        targetAttendance={targetAttendance}
        onTargetChange={setTargetAttendance}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        onOpenLetterModal={() => setShowLetterModal(true)}
        onOpenScraperModal={() => setShowScraperModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Course Summary Metrics (No overall attendance) */}
        <GlobalSummary
          summary={summary}
          targetAttendance={targetAttendance}
          internshipEnabled={internshipEnabled}
          internshipCutoffDate={internshipCutoffDate}
        />

        {/* Filter & View Controls */}
        <div className="mono-panel rounded-xl p-3 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter course code, name, or faculty (e.g. IMA311, Soft Computing)..."
              className="w-full pl-9 pr-3 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-white"
            >
              <option value="all">All Categories</option>
              <option value="core">Core</option>
              <option value="elective">Elective</option>
              <option value="humanities">Humanities</option>
              <option value="lab">Lab</option>
            </select>

            <button
              type="button"
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
                filterCriticalOnly
                  ? 'bg-red-950/40 text-red-400 font-bold border-red-500/70'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterCriticalOnly ? 'text-red-400' : 'text-zinc-400'}`} />
              <span>&lt; {targetAttendance}% Only</span>
            </button>

            <div className="flex items-center p-0.5 rounded-lg bg-black border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Dense Data Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Display */}
        {filteredCourses.length === 0 ? (
          <div className="py-16 text-center mono-panel rounded-xl border border-zinc-800 space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold text-zinc-300 font-mono">No courses match query</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterCriticalOnly(false);
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white underline"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                targetAttendance={targetAttendance}
                internshipEnabled={internshipEnabled}
                onOpenDrawer={(c) => setSelectedCourseForDrawer(c)}
              />
            ))}
          </div>
        ) : (
          <CourseTable
            courses={filteredCourses}
            targetAttendance={targetAttendance}
            internshipEnabled={internshipEnabled}
            onOpenDrawer={(c) => setSelectedCourseForDrawer(c)}
          />
        )}
      </main>

      {/* Course Detail Drawer */}
      <CourseDrawer
        course={selectedCourseForDrawer}
        targetAttendance={targetAttendance}
        internshipEnabled={internshipEnabled}
        internshipCutoffDate={internshipCutoffDate}
        onClose={() => setSelectedCourseForDrawer(null)}
      />

      {/* Duty Leave Application Letter Modal */}
      {showLetterModal && (
        <DutyLeaveLetterModal
          profile={profile}
          courses={analyzedCourses}
          onClose={() => setShowLetterModal(false)}
        />
      )}

      {/* Portal Console Scraper & JSON Tools Modal */}
      {showScraperModal && (
        <PortalScraperModal
          currentProfile={profile}
          currentCourses={courses}
          onImportData={(newProfile, newCourses) => {
            setProfile(newProfile);
            setCourses(newCourses);
          }}
          onClose={() => setShowScraperModal(false)}
        />
      )}
    </div>
  );
};

export default App;
