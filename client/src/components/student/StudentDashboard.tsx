import React, { useState } from 'react';
import { 
  GraduationCap, 
  Video, 
  BookOpen, 
  FileText, 
  Award, 
  Bot, 
  Briefcase, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Send, 
  Printer, 
  Sparkles, 
  Play, 
  MessageSquare,
  FileCheck,
  TrendingUp,
  UserCheck,
  Zap,
  Code,
  Search,
  Grid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Laptop,
  ExternalLink,
  RotateCcw,
  Check,
  Star,
  Eye,
  AlertCircle,
  Loader2,
  Calendar,
  FolderCheck,
  ArrowUpRight,
  Lock,
  Trophy,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  Layers,
  CheckCircle,
  Share2,
  LogOut,
  Flame,
  Target,
  Radio,
  Tv,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_DOMAINS, INITIAL_LIVE_CLASSES, INITIAL_LECTURES, INITIAL_ASSIGNMENTS, SAMPLE_QUIZ, INITIAL_JOBS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SyllabusLesson, LiveClass, RecordedLecture } from '../../types';
import { calculateStudentAttendanceStats } from '../../utils/attendanceCalculator';
import { getLectureRealTimeStatus, getLectureCountdown, formatLectureSchedule } from '../../utils/lectureTimeUtils';
import { LectureVideoModal } from '../common/LectureVideoModal';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    students,
    assignments, 
    submissions,
    submitAssignment, 
    attendanceReports, 
    liveClasses, 
    recordedLectures, 
    quizzes, 
    updateQuizResult 
  } = useData();
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'lectures' | 'assignments' | 'quiz' | 'certificate' | 'resume' | 'jobs' | 'ai-mentor'>('overview');

  // Dynamic Domain State & Domain Switcher Override
  const [selectedDomainOverride, setSelectedDomainOverride] = useState<string | null>(null);

  // Match Authenticated Student from Real Data
  const matchedStudent = students.find(s => 
    (user?.email && s.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
    (user?.id && s.userId === user.id) ||
    (user?.name && s.name.toLowerCase() === user.name.toLowerCase())
  ) || students[0];

  const studentDomain = selectedDomainOverride || matchedStudent?.domain || user?.domain || 'MERN Stack Development';
  const studentBatch = matchedStudent?.batch || user?.batch || 'Batch W-2026-A';
  const studentName = matchedStudent?.name || user?.name || 'Aarav Sharma';
  const studentEmail = matchedStudent?.email || user?.email || 'student@websums.com';
  const mentorName = matchedStudent?.mentorName || 'Vikram Lale';

  // Get current domain syllabus object (fallback to first domain if not matched)
  const currentDomainObj = INITIAL_DOMAINS.find(d => 
    d.name.toLowerCase() === studentDomain.toLowerCase() || 
    d.name.toLowerCase().includes(studentDomain.toLowerCase())
  ) || INITIAL_DOMAINS[0];

  // Daily checklist state
  const [dailyChecklist, setDailyChecklist] = useState([
    { id: 'chk-1', title: 'Watch Week 5 REST API Architecture Video', completed: true },
    { id: 'chk-2', title: 'Complete Express Router Middleware Exercise', completed: true },
    { id: 'chk-3', title: 'Attempt MERN Core Concepts MCQ Quiz', completed: false },
    { id: 'chk-4', title: 'Submit Week 5 Assignment Repository', completed: false }
  ]);

  const toggleChecklist = (id: string) => {
    setDailyChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  // Syllabus Accordion state (expand first week by default)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(5);

  // Lesson Detail Modal State
  const [selectedLessonModal, setSelectedLessonModal] = useState<{
    lesson: SyllabusLesson;
    weekNum: number;
    weekTitle: string;
  } | null>(null);

  // Completed Lessons State tracker
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['m-w1-l1', 'm-w1-l2', 'm-w1-l3', 'm-w1-l4', 'm-w2-l1', 'm-w2-l2', 'm-w3-l1', 'm-w3-l2', 'm-w4-l1', 'm-w5-l1']);

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const isDone = prev.includes(lessonId);
      const updated = isDone ? prev.filter(id => id !== lessonId) : [...prev, lessonId];
      if (!isDone) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        showToast('success', 'Lesson marked as completed! Progress updated.');
      }
      return updated;
    });
  };

  // Real Calculated Dynamic Attendance Rate from actual daily reports
  const studentAttendanceStats = calculateStudentAttendanceStats(matchedStudent?.id || 'std-101', attendanceReports);
  const attendanceRate = studentAttendanceStats.totalSessions > 0
    ? studentAttendanceStats.attendancePercentage
    : (matchedStudent?.attendancePercentage || 96);

  // Real Submissions by this student
  const mySubmissions = submissions.filter(sub => 
    (sub.studentId === matchedStudent?.id || sub.studentId === 'std-current') ||
    (sub.studentName && sub.studentName.toLowerCase() === studentName.toLowerCase())
  );

  // Domain & Batch Aware Content Filtering
  const isDomainMatch = (itemDomain?: string) => {
    if (!itemDomain) return true;
    const itemNorm = (itemDomain || '').toLowerCase();
    const stdNorm = (studentDomain || '').toLowerCase();
    return itemNorm === stdNorm || itemNorm.includes(stdNorm) || stdNorm.includes(itemNorm);
  };

  const isBatchMatch = (itemBatch?: string) => {
    if (!itemBatch || itemBatch === 'All' || itemBatch === 'All Batches') return true;
    return itemBatch.toLowerCase() === studentBatch.toLowerCase();
  };

  const domainAssignments = assignments.filter(a => isDomainMatch(a.domain) && isBatchMatch(a.batch));
  const domainQuizzes = quizzes.filter(q => isDomainMatch(q.domain));

  // Live classes for this batch & domain
  const studentLiveClasses = liveClasses.filter(c => isDomainMatch(c.domain) && isBatchMatch(c.batch));

  // Recorded lectures for this batch & domain
  const studentRecordedLectures = recordedLectures.filter(l => isDomainMatch(l.domain) && isBatchMatch(l.batch));

  // Real-time classification for student live classes
  const liveNowClasses = studentLiveClasses.filter(c => getLectureRealTimeStatus(c) === 'Live');
  const upcomingClasses = studentLiveClasses.filter(c => getLectureRealTimeStatus(c) === 'Upcoming');
  const completedLiveClasses = studentLiveClasses.filter(c => getLectureRealTimeStatus(c) === 'Completed' || (c.recordingUrl && c.recordingUrl.trim().length > 0));

  // Combined recorded library: dedicated recorded lectures + ended live classes with recording
  const allRecordedForStudent: RecordedLecture[] = [
    ...studentRecordedLectures,
    ...completedLiveClasses
      .filter(lc => lc.recordingUrl && !studentRecordedLectures.some(r => r.liveClassId === lc.id))
      .map(lc => ({
        id: `rec-lc-${lc.id}`,
        liveClassId: lc.id,
        title: lc.title,
        description: lc.description,
        domain: lc.domain,
        batch: lc.batch,
        mentorName: lc.mentorName,
        date: lc.date,
        duration: `${lc.durationMinutes}m`,
        videoUrl: lc.recordingUrl!,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        viewsCount: 0,
        pdfNotesUrl: lc.notesUrl || '#',
        pdfNotesName: lc.notesFileName || ''
      }))
  ];

  // Interactive Lectures Sub-Tab & Video Modal State
  const [lectureSubTab, setLectureSubTab] = useState<'all' | 'live' | 'upcoming' | 'recorded'>('all');
  const [activeLectureModal, setActiveLectureModal] = useState<{
    videoUrl: string;
    title: string;
    domain?: string;
    batch?: string;
    mentorName?: string;
    duration?: string;
    date?: string;
    notesUrl?: string;
    notesFileName?: string;
  } | null>(null);

  // Notification Bell Dropdown state
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Live Class Scheduled', message: 'Enterprise MERN Architecture starting at 18:00 IST', time: '10m ago', unread: true },
    { id: 'n2', title: 'Assignment Evaluated', message: 'Build RESTful API evaluated: 85/100 (Grade A)', time: '2h ago', unread: true },
    { id: 'n3', title: 'New Quiz Unlocked', message: 'Week 5 Node.js REST API quiz is ready', time: '1d ago', unread: true },
    { id: 'n4', title: 'Streak Milestone', message: '🔥 You achieved a 7-day learning streak!', time: '2d ago', unread: false }
  ]);

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Domain-Aware Quiz Runner State
  const domainCategories = ['All', ...Array.from(new Set(domainQuizzes.map(q => q.category)))];
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizCategoryFilter, setQuizCategoryFilter] = useState('All');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; percent: number; xp: number } | null>(null);

  const activeQuiz = quizzes.find(q => q.id === activeQuizId);
  const filteredDomainQuizzes = domainQuizzes.filter(q => 
    quizCategoryFilter === 'All' ? true : q.category === quizCategoryFilter
  );

  const completedQuizzes = domainQuizzes.filter(q => q.status === 'Completed' || (q.bestScore && q.bestScore > 0));
  const overallScoreAvg = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.bestScore || 80), 0) / completedQuizzes.length)
    : 82;

  // Video Modal, Search & View Mode + Pagination
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoViewMode, setVideoViewMode] = useState<'grid' | 'list'>('grid');
  const [videoPage, setVideoPage] = useState(1);
  const [videoSearch, setVideoSearch] = useState('');

  // Pagination for Assignments
  const [assignmentPage, setAssignmentPage] = useState(1);

  const getVideoSourceBadge = (url: string) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">💻 Laptop File</span>;
    }
    if (url.includes('drive.google.com')) {
      return <span className="inline-flex items-center text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">📁 Google Drive</span>;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <span className="inline-flex items-center text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 shadow-2xs">▶ YouTube</span>;
    }
    return <span className="inline-flex items-center text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs">🎬 MP4 Video</span>;
  };

  // Assignment Submission & Detail State
  interface SubmissionDetail {
    assignmentId: string;
    link: string;
    submittedAt: string;
    status: 'Not Submitted' | 'Submitted' | 'Under Review' | 'Evaluated';
    marksObtained?: number;
    maxMarks?: number;
    feedback?: string;
  }

  const [submittedAssignments, setSubmittedAssignments] = useState<string[]>(['asg-demo-eval']);
  const [submissionLinks, setSubmissionLinks] = useState<Record<string, string>>({});
  const [submissionDetails, setSubmissionDetails] = useState<Record<string, SubmissionDetail>>({
    'asg-demo-eval': {
      assignmentId: 'asg-demo-eval',
      link: 'https://github.com/aarav-sharma/ecommerce-backend-api',
      submittedAt: 'Aug 10, 2026',
      status: 'Evaluated',
      marksObtained: 85,
      maxMarks: 100,
      feedback: 'Excellent clean MVC architecture and Mongoose schema design! Express validators are well implemented. Try adding rate limiting middleware for production security.'
    }
  });

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ title: string; score: number; maxMarks: number; feedback: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAssignmentSubmit = (asgId: string) => {
    const link = submissionLinks[asgId] || '';
    if (!link.trim()) {
      showToast('error', 'Please enter a valid GitHub repository or Google Drive URL.');
      return;
    }
    setSubmittingId(asgId);
    setTimeout(() => {
      setSubmittedAssignments(prev => prev.includes(asgId) ? prev : [...prev, asgId]);
      setSubmissionDetails(prev => ({
        ...prev,
        [asgId]: {
          assignmentId: asgId,
          link,
          submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Submitted'
        }
      }));
      submitAssignment(asgId, studentName, link);
      setSubmittingId(null);
      setResubmittingId(null);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showToast('success', 'Assignment submitted successfully! Your mentor will review it shortly.');
    }, 1000);
  };

  // Resume Builder Data
  const resumeData = {
    name: studentName,
    email: studentEmail,
    phone: '+91 98765 43210',
    college: 'IIT Delhi / Websums Software',
    domain: studentDomain,
    summary: `Passionate ${studentDomain} engineer trained at Websums Software Pvt. Ltd. Proficient in enterprise production code, REST APIs, and industry standard tooling.`,
    skills: currentDomainObj.syllabus.flatMap(s => s.topics).slice(0, 10).join(', ')
  };

  // AI Suggested Questions tailored to active domain
  const aiSuggestedQuestions = [
    `Explain core concepts in ${studentDomain}`,
    `How do I structure a production project in ${studentDomain}?`,
    `Review my Week 5 code logic for ${studentDomain}`,
    `Prepare me for ${studentDomain} technical interview questions`
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center space-x-2.5 transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' : 'bg-rose-900 text-white border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP LMS NAVBAR HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xs px-5 py-3.5 rounded-2xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        
        {/* Brand & Page Context */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
            W
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                Websums LMS Student Portal
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
                Enterprise Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              Domain-Aware Learning Management System
            </p>
          </div>
        </div>

        {/* Center Search Bar */}
        <form
          onSubmit={(event) => event.preventDefault()}
          className="relative hidden w-full max-w-sm shrink md:block"
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${studentDomain} syllabus, lectures...`}
            value={videoSearch}
            onChange={(event) => {
              setVideoSearch(event.target.value);
              setVideoPage(1);
            }}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </form>

        {/* Right Controls: Domain Switcher + Notifications + Profile Avatar */}
        <div className="flex items-center space-x-3 shrink-0 ml-auto lg:ml-0">
          
          {/* Quick Domain Switcher Dropdown */}
          <div className="relative flex items-center">
            <span className="text-[10px] font-bold text-slate-400 mr-2 hidden sm:inline uppercase tracking-wider">
              Domain:
            </span>
            <div className="relative">
              <select
                value={studentDomain}
                onChange={(e) => {
                  setSelectedDomainOverride(e.target.value);
                  showToast('success', `Filtered dashboard for: ${e.target.value}`);
                }}
                className="appearance-none pl-3.5 pr-8 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-900 font-extrabold text-xs rounded-xl border border-orange-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-2xs transition-all whitespace-nowrap"
              >
                {INITIAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.name}>
                    🎯 {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-orange-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                markNotificationsAsRead();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition-colors shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900">Student Notifications</h4>
                  <span className="text-[10px] text-slate-400 font-extrabold">{notifications.length} Total</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-2.5 rounded-xl border text-xs space-y-0.5 transition-all ${
                      n.unread ? 'bg-orange-50/60 border-orange-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-slate-900">{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
              {studentName.charAt(0)}
            </div>
            <div className="hidden xl:block text-left whitespace-nowrap">
              <p className="text-xs font-black text-slate-900 leading-tight">{studentName}</p>
              <p className="text-[10px] text-orange-600 font-extrabold truncate max-w-[130px]">{studentDomain}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <nav className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: GraduationCap },
          { id: 'syllabus', label: '12-Week Syllabus', icon: BookOpen },
          { id: 'lectures', label: 'Lectures & Notes', icon: Video },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'quiz', label: 'MCQ Quiz Playground', icon: Zap },
          { id: 'certificate', label: 'Certificate Hub', icon: Award },
          { id: 'resume', label: 'Resume Builder', icon: Briefcase },
          { id: 'jobs', label: 'Job Portal & PPOs', icon: TrendingUp },
          { id: 'ai-mentor', label: 'Websum AI Mentor', icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shrink-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB CONTENT AREAS */}

      {/* 1. DASHBOARD OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* WELCOME HERO BANNER WITH LUXURY COLOR PALETTE & LIVE RADAR */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                    Authenticated Intern Domain
                  </span>
                  <span className="text-[10px] font-black text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {studentBatch}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enrolled & Verified</span>
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome back, {studentName}! 👋
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                  Your personalized internship dashboard for <strong className="text-indigo-400 font-extrabold">{studentDomain}</strong>. Review your curriculum progress, participate in live classes, and submit batch assignments.
                </p>
              </div>

              {/* REAL-TIME LIVE CLASS OR UPCOMING SESSION ALERT CARD */}
              {liveNowClasses.length > 0 ? (
                <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0"></span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                        🔴 Live Class In Progress Now
                      </span>
                      <h4 className="text-sm font-extrabold text-white truncate">{liveNowClasses[0].title}</h4>
                      <p className="text-[11px] text-slate-300 truncate">
                        Mentor: <strong>{liveNowClasses[0].mentorName}</strong> • {liveNowClasses[0].meetingPlatform} • {formatLectureSchedule(liveNowClasses[0])}
                      </p>
                    </div>
                  </div>
                  <a
                    href={liveNowClasses[0].meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Join Live Meeting Now</span>
                  </a>
                </div>
              ) : upcomingClasses.length > 0 ? (
                <div className="p-4 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                        📅 Next Scheduled Session • {getLectureCountdown(upcomingClasses[0]).badgeText}
                      </span>
                      <h4 className="text-sm font-extrabold text-white truncate">{upcomingClasses[0].title}</h4>
                      <p className="text-[11px] text-slate-300 truncate">
                        {formatLectureSchedule(upcomingClasses[0])} • Platform: {upcomingClasses[0].meetingPlatform}
                      </p>
                    </div>
                  </div>
                  {upcomingClasses[0].meetingUrl && (
                    <a
                      href={upcomingClasses[0].meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shrink-0 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Join Link</span>
                    </a>
                  )}
                </div>
              ) : null}

              {/* 4 STAT CARDS IN HERO (ALL REAL-TIME) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                  <p className="text-xl font-black text-emerald-400">{attendanceRate}%</p>
                  <p className="text-[10px] text-slate-400">
                    {studentAttendanceStats.totalSessions > 0 ? `${studentAttendanceStats.presentCount} of ${studentAttendanceStats.totalSessions} sessions` : 'Active intern status'}
                  </p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned Mentor</span>
                  <p className="text-base font-black text-indigo-300 truncate">{mentorName}</p>
                  <p className="text-[10px] text-slate-400">Senior Industry Mentor</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assignments</span>
                  <p className="text-xl font-black text-blue-400">
                    {mySubmissions.length} / {domainAssignments.length || 8}
                  </p>
                  <p className="text-[10px] text-slate-400">Domain submissions completed</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quiz Performance</span>
                  <p className="text-xl font-black text-amber-400">{overallScoreAvg}%</p>
                  <p className="text-[10px] text-slate-400">XP Points: +240</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('lectures')}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 fill-white" />
                  <span>View Live & Recorded Classes →</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  View Full Syllabus
                </button>
              </div>
            </div>
          </div>

          {/* YOUR INTERNSHIP DOMAIN INFORMATION CARD */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Your Internship Details</h3>
              </div>
              <span className="text-[11px] font-black text-indigo-800 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                {studentDomain}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Batch</span>
                <p className="font-extrabold text-slate-900">{studentBatch}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Mentor</span>
                <p className="font-extrabold text-slate-900">{mentorName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Affiliated College</span>
                <p className="font-extrabold text-slate-900">{matchedStudent?.college || 'IIT Delhi'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Internship Status</span>
                <p className="font-extrabold text-emerald-600">Active & Verified</p>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN MAIN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. CONTINUE LEARNING CARD */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">Current Focus</span>
                    <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                      Week 5: {currentDomainObj.syllabus[4]?.title || 'Node.js & Express Architecture'}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                    70% Week Completed
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {currentDomainObj.syllabus[4]?.practicalProject || 'Build a REST API using Node.js, Express & Custom Middleware'}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-700">Week 5 Progress</span>
                    <span className="text-orange-600">70%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full w-[70%]"></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const lesson = currentDomainObj.syllabus[4]?.lessons?.[1] || currentDomainObj.syllabus[4]?.lessons?.[0];
                      if (lesson) {
                        setSelectedLessonModal({
                          lesson,
                          weekNum: 5,
                          weekTitle: currentDomainObj.syllabus[4].title
                        });
                      }
                    }}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Continue Lesson 2 →</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('syllabus')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    View All Lessons
                  </button>
                </div>
              </div>

              {/* 2. TODAY'S LEARNING PLAN */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Today's Learning Plan ({dailyChecklist.filter(c => c.completed).length}/{dailyChecklist.length})</span>
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {dailyChecklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        item.completed ? 'bg-slate-50 border-slate-200 text-slate-500 line-through' : 'bg-white border-slate-200 hover:border-blue-300 text-slate-900 font-bold'
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-xs font-semibold">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                        <span>{item.title}</span>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                        item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. NEXT LIVE CLASS CARD */}
              {(() => {
                const nextClass = liveNowClasses[0] || upcomingClasses[0] || studentLiveClasses[0];
                const isLive = nextClass && getLectureRealTimeStatus(nextClass) === 'Live';
                const isCompleted = nextClass && getLectureRealTimeStatus(nextClass) === 'Completed';

                return (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-rose-500 animate-ping' : 'bg-orange-500'}`}></span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {isLive ? 'LIVE SESSION IN PROGRESS' : 'NEXT LIVE CLASS SCHEDULED'}
                        </h3>
                      </div>
                      {nextClass ? (
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border flex items-center space-x-1.5 ${
                          isLive 
                            ? 'text-rose-700 bg-rose-50 border-rose-200' 
                            : 'text-sky-700 bg-sky-50 border-sky-200'
                        }`}>
                          <span>{nextClass.meetingPlatform === 'Zoom' ? '🔷 Zoom' : nextClass.meetingPlatform === 'Google Meet' ? '🟢 Google Meet' : nextClass.meetingPlatform === 'Microsoft Teams' ? '🟣 Teams' : '🔴 Live'}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Batch {studentBatch}</span>
                      )}
                    </div>

                    {nextClass ? (
                      <div className={`p-5 rounded-2xl border space-y-4 ${
                        isLive 
                          ? 'bg-gradient-to-br from-rose-50/60 via-white to-orange-50/40 border-rose-200/80' 
                          : 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-slate-200'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                              {nextClass.batch}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">{nextClass.domain}</span>
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 pt-1">
                            {nextClass.title}
                          </h4>
                          {nextClass.description && (
                            <p className="text-xs text-slate-600 font-medium line-clamp-2">{nextClass.description}</p>
                          )}
                          <p className="text-xs text-slate-600 font-medium pt-1">
                            Mentor: <strong className="text-slate-800">{nextClass.mentorName}</strong> • Duration: {nextClass.durationMinutes} Mins
                          </p>
                          <p className={`text-xs font-bold flex items-center space-x-1.5 pt-1 ${isLive ? 'text-rose-600' : 'text-blue-600'}`}>
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>{formatLectureSchedule(nextClass)} ({getLectureCountdown(nextClass).badgeText})</span>
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          {nextClass.meetingUrl && !isCompleted ? (
                            <a
                              href={nextClass.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex-1 py-3 text-xs font-extrabold text-white rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                                isLive ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              <Video className="w-4 h-4" />
                              <span>{isLive ? '🔴 Join Ongoing Live Lecture Room' : 'Join Live Lecture Room'}</span>
                            </a>
                          ) : nextClass.recordingUrl ? (
                            <button
                              type="button"
                              onClick={() => setActiveLectureModal({
                                videoUrl: nextClass.recordingUrl!,
                                title: nextClass.title,
                                domain: nextClass.domain,
                                batch: nextClass.batch,
                                mentorName: nextClass.mentorName,
                                duration: `${nextClass.durationMinutes}m`,
                                date: nextClass.date,
                                notesUrl: nextClass.notesUrl,
                                notesFileName: nextClass.notesFileName
                              })}
                              className="flex-1 py-3 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                            >
                              <Play className="w-4 h-4 fill-white" />
                              <span>Watch Session Recording</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 py-3 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
                            >
                              Session Completed (Recording Processing)
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('lectures');
                            }}
                            className="px-4 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                          >
                            <BookOpen className="w-4 h-4 text-slate-500" />
                            <span>View All Lectures</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No live sessions currently scheduled for {studentBatch}.</p>
                        <p className="text-[11px] text-slate-500">Your mentor will schedule upcoming lectures here with real-time countdowns.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 4. UPCOMING DEADLINES */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>Upcoming Deadlines</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">High Priority</span>
                      <span className="text-[10px] font-extrabold text-rose-600">Due Tomorrow</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-xs">{studentDomain} REST API Assignment</h5>
                    <p className="text-[11px] text-slate-600">Submit GitHub repo with routers & middleware</p>
                    <button
                      onClick={() => setActiveTab('assignments')}
                      className="mt-2 text-xs font-extrabold text-amber-700 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Submit Assignment →</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded">Medium Priority</span>
                      <span className="text-[10px] font-extrabold text-slate-600">Due Friday</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-xs">{studentDomain} MCQ Core Quiz</h5>
                    <p className="text-[11px] text-slate-600">15 MCQ questions • 20 Mins duration</p>
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="mt-2 text-xs font-extrabold text-blue-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Attempt Quiz →</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (1 Col) */}
            <div className="space-y-6">
              
              {/* 1. LEARNING STREAK CARD */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                    <h3 className="text-sm font-black text-slate-900">Learning Streak</h3>
                  </div>
                  <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    🔥 7 Days Streak
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <div key={day} className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400">{day}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mx-auto ${
                        idx < 5 ? 'bg-orange-500 text-white shadow-xs' : idx === 5 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {idx < 5 ? '✓' : idx === 5 ? '🔥' : '○'}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 font-semibold text-center">
                  Log in daily to complete 1 lesson and maintain your streak!
                </p>
              </div>

              {/* 2. COURSE MILESTONES & TIMELINE */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Course Milestones</h3>

                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Syllabus Completed</span>
                      <span className="text-blue-600">65%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[65%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Attendance Rate</span>
                      <span className="text-emerald-600">{attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Assignments Submitted</span>
                      <span className="text-purple-600">{submittedAssignments.length} / 8</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(submittedAssignments.length / 8) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Vertical Path Timeline */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Learning Journey Path</span>
                  <div className="space-y-3 pl-2 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {[
                      { title: 'Registration & Verification', status: 'Completed' },
                      { title: 'Student Orientation', status: 'Completed' },
                      { title: 'Foundation & Core Concepts', status: 'Completed' },
                      { title: `${studentDomain} Intermediate`, status: 'In Progress' },
                      { title: 'Advanced Microservices Architecture', status: 'Upcoming' },
                      { title: 'Final Enterprise Capstone', status: 'Upcoming' },
                      { title: 'Certificate Generation', status: 'Upcoming' }
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center space-x-3 relative z-10 text-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          m.status === 'Completed' ? 'bg-emerald-500 text-white' : m.status === 'In Progress' ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {m.status === 'Completed' ? '✓' : idx + 1}
                        </div>
                        <span className={`font-semibold ${m.status === 'Completed' ? 'text-slate-800' : m.status === 'In Progress' ? 'text-orange-600 font-extrabold' : 'text-slate-400'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. ACHIEVEMENTS & BADGES */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Unlocked Badges</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                    <span className="text-xl">🏆</span>
                    <p className="text-xs font-extrabold text-slate-900">First Submit</p>
                    <p className="text-[10px] text-slate-500">Submitted 1st Task</p>
                  </div>

                  <div className="p-3 bg-orange-50/70 rounded-2xl border border-orange-200/80 space-y-1">
                    <span className="text-xl">🔥</span>
                    <p className="text-xs font-extrabold text-slate-900">7 Day Streak</p>
                    <p className="text-[10px] text-slate-500">Learned 7 days straight</p>
                  </div>

                  <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-1">
                    <span className="text-xl">🎯</span>
                    <p className="text-xs font-extrabold text-slate-900">Quiz Whiz</p>
                    <p className="text-[10px] text-slate-500">Scored 90%+ on Quiz</p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
                    <span className="text-xl">💯</span>
                    <p className="text-xs font-extrabold text-slate-900">Perfect Attend</p>
                    <p className="text-[10px] text-slate-500">96%+ Attendance</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 2. EXPANDABLE 12-WEEK SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase border border-orange-200">
                  Curriculum Overview
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {studentDomain} – Complete Internship Curriculum
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentDomainObj.durationWeeks}-Week industry training roadmap with hands-on projects and quizzes.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Progress</span>
                <p className="text-lg font-black text-slate-900">65% Completed</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                65%
              </div>
            </div>
          </div>

          {/* Expandable Weekly Modules List */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1.5 scrollbar-thin">
            {currentDomainObj.syllabus.map((w) => {
              const isExpanded = expandedWeek === w.week;
              const statusColor = 
                w.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                w.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                w.status === 'Locked' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                'bg-blue-50 text-blue-700 border-blue-200';

              return (
                <div 
                  key={w.week} 
                  className={`bg-white rounded-3xl border transition-all duration-200 shadow-xs overflow-hidden ${
                    isExpanded ? 'border-orange-400 ring-2 ring-orange-500/10' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Module Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedWeek(isExpanded ? null : w.week)}
                    className="w-full p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                        w.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        w.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        W{w.week}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-500">Week {w.week}</span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                            {w.status === 'Completed' ? '✓ Completed' : w.status === 'In Progress' ? '◉ In Progress' : w.status === 'Locked' ? '🔒 Locked' : '○ Not Started'}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{w.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="hidden sm:block text-right">
                        <span className="text-xs font-bold text-slate-700">{w.lessonsCompleted || 0} / {w.totalLessons || 8} Lessons</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${w.progressPercent || 0}%` }}></div>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Module Content */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-50/60 border-t border-slate-100 space-y-6 animate-in fade-in">
                      
                      {/* Topics Pill Tags */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topics Covered</p>
                        <div className="flex flex-wrap gap-2">
                          {w.topics.map((t, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practical Hands-on Project Exercise */}
                      {w.practicalProject && (
                        <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/80 space-y-1">
                          <span className="text-[10px] font-black text-orange-800 uppercase tracking-wider flex items-center space-x-1">
                            <Code className="w-3.5 h-3.5 text-orange-600" />
                            <span>Practical Hands-on Project</span>
                          </span>
                          <p className="text-xs font-extrabold text-slate-900">{w.practicalProject}</p>
                        </div>
                      )}

                      {/* Detailed Lesson Breakdown */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lesson Breakdown & Learning Objectives</p>
                        
                        {(w.lessons || [
                          { id: `l-${w.week}-1`, title: `${w.title} - Core Architecture`, duration: '45m', objectives: ['Understand core concepts', 'Implement code examples'], completed: w.status === 'Completed' },
                          { id: `l-${w.week}-2`, title: `${w.title} - Practical Implementation`, duration: '50m', objectives: ['Build hands-on modules', 'Pass unit test suites'], completed: w.status === 'Completed' }
                        ]).map((lesson) => {
                          const isLessonDone = completedLessonIds.includes(lesson.id) || lesson.completed;
                          return (
                            <div key={lesson.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => toggleLessonCompletion(lesson.id)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                                      isLessonDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-emerald-200'
                                    }`}
                                    title="Toggle Completion"
                                  >
                                    {isLessonDone ? '✓' : '•'}
                                  </button>
                                  <h4 className="text-xs font-extrabold text-slate-900">{lesson.title}</h4>
                                  <span className="text-[10px] font-bold text-slate-400">({lesson.duration})</span>
                                </div>
                                <ul className="pl-7 text-[11px] text-slate-600 list-disc font-medium space-y-0.5">
                                  {lesson.objectives.map((obj, i) => (
                                    <li key={i}>{obj}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                <button
                                  onClick={() => setSelectedLessonModal({ lesson: { ...lesson, completed: isLessonDone }, weekNum: w.week, weekTitle: w.title })}
                                  className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl text-xs font-extrabold border border-orange-200 transition-all flex items-center space-x-1"
                                >
                                  <Play className="w-3 h-3 fill-orange-600" />
                                  <span>Watch & Learn</span>
                                </button>
                                <button
                                  onClick={() => setActiveTab('quiz')}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-extrabold border border-blue-200 transition-all flex items-center space-x-1"
                                >
                                  <Zap className="w-3 h-3 text-blue-600" />
                                  <span>Quiz</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 3. INTERACTIVE LIVE CLASSES & RECORDED VIDEO LIBRARY TAB */}
      {activeTab === 'lectures' && (() => {
        const q = (videoSearch || '').trim().toLowerCase();

        const filteredRecorded = allRecordedForStudent.filter(l => 
          !q ||
          (l.title || '').toLowerCase().includes(q) || 
          (l.domain || '').toLowerCase().includes(q) ||
          (l.batch || '').toLowerCase().includes(q) ||
          (l.mentorName || '').toLowerCase().includes(q)
        );

        const videosPerPage = videoViewMode === 'grid' ? 6 : 4;
        const totalVideoPages = Math.ceil(filteredRecorded.length / videosPerPage) || 1;
        const currentVPage = Math.min(videoPage, totalVideoPages);
        const paginatedRecorded = filteredRecorded.slice((currentVPage - 1) * videosPerPage, currentVPage * videosPerPage);

        return (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                    Batch Session Portal
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
                  <Video className="w-6 h-6 text-indigo-400" />
                  <span>{studentDomain} – Live Classes & Video Library</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
                  Attend real-time Google Meet / Zoom interactive mentor sessions for <strong>{studentBatch}</strong>, and review all previous lecture recordings and study notes.
                </p>
              </div>

              {/* Sub-Tab Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-start md:self-auto">
                <button
                  onClick={() => setLectureSubTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    lectureSubTab === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  All ({studentLiveClasses.length + allRecordedForStudent.length})
                </button>
                <button
                  onClick={() => setLectureSubTab('live')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                    lectureSubTab === 'live' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                  <span>Live ({liveNowClasses.length})</span>
                </button>
                <button
                  onClick={() => setLectureSubTab('upcoming')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    lectureSubTab === 'upcoming' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Upcoming ({upcomingClasses.length})
                </button>
                <button
                  onClick={() => setLectureSubTab('recorded')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    lectureSubTab === 'recorded' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Recorded ({allRecordedForStudent.length})
                </button>
              </div>
            </div>

            {/* LIVE NOW SECTION */}
            {(lectureSubTab === 'all' || lectureSubTab === 'live') && liveNowClasses.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-rose-400/80 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                    <h3 className="text-base font-black text-rose-950 uppercase tracking-wide">
                      Live Class Happening Right Now
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    🔴 Broadcasting Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveNowClasses.map(lc => (
                    <div key={lc.id} className="p-5 bg-rose-50/50 rounded-2xl border border-rose-200 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-full">
                            {lc.meetingPlatform}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {lc.batch}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">{lc.title}</h4>
                        {lc.description && (
                          <p className="text-xs text-slate-600 font-medium">{lc.description}</p>
                        )}
                        <p className="text-xs text-slate-500 font-semibold pt-1">
                          🕒 {formatLectureSchedule(lc)} • Mentor: <strong className="text-slate-800">{lc.mentorName}</strong>
                        </p>
                      </div>

                      <a
                        href={lc.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Join Live Class in {lc.meetingPlatform} Now</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING SCHEDULE SECTION */}
            {(lectureSubTab === 'all' || lectureSubTab === 'upcoming') && upcomingClasses.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Upcoming Scheduled Timetable ({upcomingClasses.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Auto-synced with mentor timetable</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingClasses.map(lc => {
                    const countdown = getLectureCountdown(lc);
                    const scheduleStr = formatLectureSchedule(lc);
                    return (
                      <div key={lc.id} className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-200/80 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-indigo-600" />
                              <span>{countdown.badgeText}</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {lc.batch}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mt-1">{lc.title}</h4>
                          {lc.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{lc.description}</p>
                          )}
                          <p className="text-xs text-slate-500 font-semibold pt-1">
                            {scheduleStr} • {lc.meetingPlatform} • Mentor: <strong className="text-slate-800">{lc.mentorName}</strong>
                          </p>
                        </div>

                        {lc.meetingUrl && (
                          <a
                            href={lc.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Save / Open Join Link</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECORDED LECTURES & STUDY MATERIALS SECTION */}
            {(lectureSubTab === 'all' || lectureSubTab === 'recorded') && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                      <Play className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                      <span>Archived Video Lectures & Study Notes</span>
                      <span className="text-xs bg-indigo-50 text-indigo-800 font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {allRecordedForStudent.length} Available
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Revisit past live classes and recorded domain walkthroughs anytime</p>
                  </div>

                  {/* Search and Layout Toggle */}
                  <div className="flex items-center space-x-3">
                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search recordings..."
                        value={videoSearch}
                        onChange={(e) => {
                          setVideoSearch(e.target.value);
                          setVideoPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setVideoViewMode('grid')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          videoViewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setVideoViewMode('list')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          videoViewMode === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        List
                      </button>
                    </div>
                  </div>
                </div>

                {filteredRecorded.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-2">
                    <Video className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-extrabold text-slate-700">No recorded lectures found</h4>
                    <p className="text-xs text-slate-400">
                      Recordings will be displayed here as soon as a live class completes or is uploaded by your mentor.
                    </p>
                  </div>
                ) : (
                  <div className={videoViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
                    {paginatedRecorded.map((lec) => (
                      <div 
                        key={lec.id} 
                        className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
                      >
                        <div className="relative aspect-video bg-slate-950 overflow-hidden">
                          <img 
                            src={lec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} 
                            alt={lec.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                          />
                          <div className="absolute top-3 left-3">{getVideoSourceBadge(lec.videoUrl)}</div>
                          <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-0.5 rounded text-[10px] font-black text-white">
                            🕒 {lec.duration}
                          </div>
                        </div>

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                                Week {lec.week || 1}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                {lec.batch || studentBatch}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm mt-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {lec.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Mentor: {lec.mentorName || mentorName} {lec.date ? `• ${lec.date}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => setActiveLectureModal({
                                videoUrl: lec.videoUrl,
                                title: lec.title,
                                domain: lec.domain,
                                batch: lec.batch || studentBatch,
                                mentorName: lec.mentorName || mentorName,
                                duration: lec.duration,
                                date: lec.date,
                                notesUrl: lec.pdfNotesUrl,
                                notesFileName: lec.pdfNotesName
                              })}
                              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Watch Video</span>
                            </button>

                            {lec.pdfNotesUrl && lec.pdfNotesUrl !== '#' && (
                              <a
                                href={lec.pdfNotesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                title="Download Study Notes"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalVideoPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs font-bold text-slate-600">
                    <div className="text-slate-500 text-xs">
                      Showing <span className="font-black text-slate-800">{(currentVPage - 1) * videosPerPage + 1}</span> to <span className="font-black text-slate-800">{Math.min(currentVPage * videosPerPage, filteredRecorded.length)}</span> of <span className="font-black text-slate-800">{filteredRecorded.length}</span> lectures
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={currentVPage === 1}
                        onClick={() => setVideoPage(p => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold px-2 text-slate-700">{currentVPage} / {totalVideoPages}</span>
                      <button
                        disabled={currentVPage === totalVideoPages}
                        onClick={() => setVideoPage(p => Math.min(p + 1, totalVideoPages))}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (() => {
        const assignmentsPerPage = 4;
        const totalAssignmentPages = Math.ceil(domainAssignments.length / assignmentsPerPage) || 1;
        const currentAPage = Math.min(assignmentPage, totalAssignmentPages);
        const paginatedAssignments = domainAssignments.slice((currentAPage - 1) * assignmentsPerPage, currentAPage * assignmentsPerPage);

        return (
          <div className="space-y-6 max-w-[1300px] mx-auto">
            
            {/* Header */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{studentDomain} Assignments</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-11">
                  Complete domain assignments and submit your GitHub repository or Google Drive links.
                </p>
              </div>

              <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900">{submittedAssignments.length} / {domainAssignments.length || 8} Completed</span>
                  <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(submittedAssignments.length / (domainAssignments.length || 8)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Cards in Bounded Container */}
            <div className="max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin">
              <div className="space-y-4">
                {paginatedAssignments.map((asg) => {
                  const isSubmitted = submittedAssignments.includes(asg.id);
                  const subDetail = submissionDetails[asg.id];
                  const isEditing = resubmittingId === asg.id;
                  const isSubmitting = submittingId === asg.id;
                  const currentLinkInput = submissionLinks[asg.id] ?? (subDetail?.link || '');

                  return (
                    <div key={asg.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                              Due: {asg.dueDate || '2026-08-30'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">Max Marks: {asg.maxMarks || 100}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-1">{asg.title}</h3>
                          <p className="text-xs text-slate-600 font-medium">{asg.description}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isSubmitted ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Submitted
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Submission
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submission Input Box */}
                      {(!isSubmitted || isEditing) ? (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-700">Submit GitHub Repository / Google Drive Link</label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={currentLinkInput}
                              onChange={(e) => setSubmissionLinks({ ...submissionLinks, [asg.id]: e.target.value })}
                              placeholder="https://github.com/your-username/assignment-repo"
                              className="flex-1 px-4 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                            />
                            <button
                              onClick={() => handleAssignmentSubmit(asg.id)}
                              disabled={isSubmitting}
                              className="px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center justify-center space-x-2"
                            >
                              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              <span>{isEditing ? 'Update Submission' : 'Submit Assignment'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-700">Submitted Link:</p>
                            <a href={subDetail?.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                              {subDetail?.link || 'https://github.com/student/repo'}
                            </a>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setResubmittingId(asg.id)}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-xl"
                            >
                              Resubmit
                            </button>
                            {subDetail?.feedback && (
                              <button
                                onClick={() => setFeedbackModal({ title: asg.title, score: subDetail.marksObtained || 85, maxMarks: 100, feedback: subDetail.feedback || '' })}
                                className="px-3 py-1.5 bg-purple-100 text-purple-800 font-extrabold rounded-xl"
                              >
                                View Feedback
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls for Assignments */}
            {totalAssignmentPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs font-bold text-slate-600">
                <div className="text-slate-500 text-xs">
                  Showing <span className="font-black text-slate-800">{(currentAPage - 1) * assignmentsPerPage + 1}</span> to <span className="font-black text-slate-800">{Math.min(currentAPage * assignmentsPerPage, domainAssignments.length)}</span> of <span className="font-black text-slate-800">{domainAssignments.length}</span> assignments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentAPage === 1}
                    onClick={() => setAssignmentPage(p => Math.max(p - 1, 1))}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalAssignmentPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setAssignmentPage(pg)}
                        className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentAPage === pg
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentAPage === totalAssignmentPages}
                    onClick={() => setAssignmentPage(p => Math.min(p + 1, totalAssignmentPages))}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* 5. MCQ QUIZ PLAYGROUND TAB */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>{studentDomain} MCQ Quiz Playground</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Test your skills, earn XP points, and unlock advanced topic badges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {domainCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQuizCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    quizCategoryFilter === cat ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDomainQuizzes.map((q) => (
              <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {q.category}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      +{q.xpReward || 15} XP
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{q.title}</h3>
                  <p className="text-xs text-slate-600">{q.questions.length} Questions • {q.timeLimitMins || 15} Mins • 100 Marks</p>
                </div>

                <button
                  onClick={() => {
                    setActiveQuizId(q.id);
                    setCurrentQuestionIndex(0);
                    setQuizAnswers({});
                    setQuizCompleted(false);
                  }}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Quiz Attempt</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 6. CERTIFICATE HUB */}
      {activeTab === 'certificate' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Internship Completion Certificate Status</h2>
              <p className="text-xs text-slate-500 font-medium">Domain: {studentDomain} • Batch {studentBatch}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 max-w-md mx-auto">
              <div className="flex justify-between text-xs font-black">
                <span>Eligibility Score</span>
                <span className="text-amber-600">72% / 100%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Reach 75% total progress to generate your verified certificate.</p>
            </div>

            <div className="space-y-2 text-left max-w-md mx-auto text-xs font-semibold">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span>✓ Attendance &gt; 75%</span>
                <span className="font-extrabold">Passed ({attendanceRate}%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span>✓ All Domain Assignments Submitted</span>
                <span className="font-extrabold">Passed</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <span>○ Final Industry Project Evaluation</span>
                <span className="font-extrabold">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. RESUME BUILDER TAB */}
      {activeTab === 'resume' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Internship Resume Builder</h2>
                <p className="text-xs text-slate-500 font-medium">Auto-populated with your authenticated internship credentials.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Resume</span>
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{resumeData.name}</h3>
                <p className="text-xs font-bold text-orange-600">{resumeData.domain} Intern</p>
                <p className="text-xs text-slate-500 mt-1">{resumeData.email} • {resumeData.phone} • Websums Software Pvt. Ltd.</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 uppercase">Professional Summary</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{resumeData.summary}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 uppercase">Technical Skills</h4>
                <p className="text-xs text-slate-700 font-medium">{resumeData.skills}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. JOB PORTAL & PPOs TAB */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-extrabold text-slate-900">Recommended Job Openings & PPO Opportunities</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Curated placements for {studentDomain} interns.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INITIAL_JOBS.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {job.type}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">{job.salary}</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{job.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">{job.company} • {job.location}</p>
                </div>
                <button
                  onClick={() => showToast('success', `Application submitted for ${job.title}!`)}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. WEBSUM AI MENTOR TAB */}
      {activeTab === 'ai-mentor' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-purple-200/80 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                🤖
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Websum AI Mentor Assistant</h2>
                <p className="text-xs text-purple-700 font-bold">Contextual AI tuned for {studentDomain} • Week 5 Module</p>
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 min-h-[300px]">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 max-w-xl text-xs space-y-2">
                <p className="font-extrabold text-purple-700 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Websum AI Assistant:</span>
                </p>
                <p className="text-slate-700 font-medium leading-relaxed">
                  Hello {studentName}! I am your AI Mentor for <strong>{studentDomain}</strong>. I notice you are currently working on Week 5 of your internship. How can I assist you with your curriculum or code today?
                </p>
              </div>
            </div>

            {/* Suggested Prompt Chips */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Suggested Questions for {studentDomain}</p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => showToast('success', `AI Mentor query sent: "${q}"`)}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold border border-purple-200 transition-all text-left"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE LESSON DETAIL MODAL */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLessonModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
                Week {selectedLessonModal.weekNum} • {selectedLessonModal.weekTitle}
              </span>
              <h3 className="text-xl font-black text-slate-900">{selectedLessonModal.lesson.title}</h3>
              <p className="text-xs text-slate-500 font-medium">Duration: {selectedLessonModal.lesson.duration} • Domain: {studentDomain}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase">Learning Objectives</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                {selectedLessonModal.lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Player Preview */}
            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
                alt="Lesson Preview"
                className="w-full h-full object-cover opacity-60"
              />
              <button
                onClick={() => {
                  setPlayingVideo('https://www.w3schools.com/html/mov_bbb.mp4');
                  setSelectedLessonModal(null);
                }}
                className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs shadow-xl flex items-center space-x-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Video Player</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => toggleLessonCompletion(selectedLessonModal.lesson.id)}
                className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                  completedLessonIds.includes(selectedLessonModal.lesson.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedLessonIds.includes(selectedLessonModal.lesson.id) ? 'Lesson Completed ✓' : 'Mark as Completed'}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedLessonModal(null);
                  setActiveTab('quiz');
                }}
                className="px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Take Module Quiz
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE QUIZ RUNNER MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
            <button
              onClick={() => setActiveQuizId(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!quizCompleted ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200 uppercase">
                      {activeQuiz.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{activeQuiz.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Q {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                  </span>
                </div>

                {/* Question Text */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-extrabold text-slate-900 leading-relaxed">
                    {activeQuiz.questions[currentQuestionIndex]?.question}
                  </p>
                </div>

                {/* Question Options */}
                <div className="space-y-2">
                  {activeQuiz.questions[currentQuestionIndex]?.options.map((opt, idx) => {
                    const isSelected = quizAnswers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [currentQuestionIndex]: idx })}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                          isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isSelected ? 'bg-white text-orange-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-5 py-2.5 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        let correctCount = 0;
                        activeQuiz.questions.forEach((q, i) => {
                          if (quizAnswers[i] === q.correctAnswer) correctCount++;
                        });
                        const percent = Math.round((correctCount / activeQuiz.questions.length) * 100);
                        const xp = percent >= 60 ? (activeQuiz.xpReward || 15) : 5;
                        setQuizScore({ correct: correctCount, total: activeQuiz.questions.length, percent, xp });
                        setQuizCompleted(true);
                        updateQuizResult(activeQuiz.id, percent, activeQuiz.questions.length);
                        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                      }}
                      className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                    >
                      Submit Quiz Attempt ✓
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Result Screen */
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
                  🎉
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Quiz Completed!</h3>
                  <p className="text-xs text-slate-500 font-medium">{activeQuiz.title}</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 max-w-sm mx-auto">
                  <div className="text-3xl font-black text-slate-900">{quizScore?.percent}%</div>
                  <p className="text-xs font-bold text-slate-600">
                    Correct Answers: {quizScore?.correct} / {quizScore?.total}
                  </p>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200">
                    +{quizScore?.xp} XP Points Awarded!
                  </span>
                </div>

                <button
                  onClick={() => setActiveQuizId(null)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNIVERSAL LECTURE VIDEO PLAYER MODAL */}
      {activeLectureModal && (
        <LectureVideoModal
          isOpen={!!activeLectureModal}
          onClose={() => setActiveLectureModal(null)}
          videoUrl={activeLectureModal.videoUrl}
          title={activeLectureModal.title}
          domain={activeLectureModal.domain}
          batch={activeLectureModal.batch}
          mentorName={activeLectureModal.mentorName}
          duration={activeLectureModal.duration}
          date={activeLectureModal.date}
          notesUrl={activeLectureModal.notesUrl}
          notesFileName={activeLectureModal.notesFileName}
        />
      )}

      {/* ASSIGNMENT FEEDBACK MODAL */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setFeedbackModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Evaluated Submission
              </span>
              <h3 className="text-base font-extrabold text-slate-900">{feedbackModal.title}</h3>
              <p className="text-xs font-bold text-slate-600">
                Score: <span className="text-emerald-600 font-extrabold">{feedbackModal.score} / {feedbackModal.maxMarks}</span>
              </p>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2 text-xs">
              <p className="font-extrabold text-purple-900">Mentor Feedback:</p>
              <p className="text-slate-700 leading-relaxed font-medium">{feedbackModal.feedback}</p>
            </div>

            <button
              onClick={() => setFeedbackModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all"
            >
              Close Feedback
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">Websums Software Pvt. Ltd. Enterprise Internship Platform</p>
        <p className="mt-1">© 2026 Websums Software Pvt. Ltd. All rights reserved. Domain-Secured LMS Interface.</p>
      </footer>

    </div>
  );
};
