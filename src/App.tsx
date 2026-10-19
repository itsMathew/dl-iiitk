import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Filter, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  AlertTriangle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CourseAttendance, CourseAnalysis, PolicyMode, StudentProfile } from './types/attendance';
import { analyzeCourse, calculateOverallSummary } from './utils/calculations';
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

  // When successfully logged in
  const handleLoginSuccess = (data: { profile: StudentProfile; courses: CourseAttendance[]; token: string }) => {
    setProfile(data.profile);
    setCourses(data.courses);
    setToken(data.token);
    setIsAuthenticated(true);

    // Trigger welcoming celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Re-sync attendance with active token
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

  // Compute analyzed courses based on active policy & target
  const analyzedCourses = useMemo(() => {
    return courses.map((c) => analyzeCourse(c, policy, targetAttendance));
  }, [courses, policy, targetAttendance]);

  // Overall Global Summary
  const overallSummary = useMemo(() => {
    return calculateOverallSummary(courses, policy, targetAttendance);
  }, [courses, policy, targetAttendance]);

  // Filtered courses for display
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

  // Keep drawer updated if active course changes
  useEffect(() => {
    if (selectedCourseForDrawer) {
      const updated = analyzedCourses.find((c) => c.courseId === selectedCourseForDrawer.courseId);
      if (updated) setSelectedCourseForDrawer(updated);
    }
  }, [analyzedCourses]);

  // If not authenticated, render Login Page
  if (!isAuthenticated || !profile) {
    return <LoginPage onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Sticky Navigation Bar */}
      <Navbar
        profile={profile}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Attendance Summary Cards */}
        <GlobalSummary
          summary={overallSummary}
          policy={policy}
          targetAttendance={targetAttendance}
        />

        {/* Course Controls Bar: View Toggle, Search, Filter */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code, name, or faculty (e.g. IMA311, Soft Computing)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category Filter & Critical Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="core">Core Subjects</option>
              <option value="elective">Electives</option>
              <option value="humanities">Humanities</option>
              <option value="lab">Labs</option>
            </select>

            <button
              type="button"
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                filterCriticalOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>&lt; {targetAttendance}% Only</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Dense Data Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Display (Grid or Table) */}
        {filteredCourses.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No courses match your query</div>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or reset the category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterCriticalOnly(false);
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                policy={policy}
                targetAttendance={targetAttendance}
                onOpenDrawer={(c) => setSelectedCourseForDrawer(c)}
              />
            ))}
          </div>
        ) : (
          <CourseTable
            courses={filteredCourses}
            policy={policy}
            targetAttendance={targetAttendance}
            onOpenDrawer={(c) => setSelectedCourseForDrawer(c)}
          />
        )}
      </main>

      {/* Course Detail Drawer Modal */}
      <CourseDrawer
        course={selectedCourseForDrawer}
        policy={policy}
        targetAttendance={targetAttendance}
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
