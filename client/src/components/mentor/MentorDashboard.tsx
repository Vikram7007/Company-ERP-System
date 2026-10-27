import React, { useState } from 'react';
import { 
  UserCheck, 
  Video, 
  FileCheck, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  CheckCircle2,
  XCircle, 
  Clock, 
  MessageSquare, 
  Upload, 
  Award,
  Sparkles,
  Users,
  Inbox,
  FileText,
  Eye,
  Search,
  Filter,
  ChevronRight,
  GraduationCap,
  DollarSign,
  X,
  IndianRupee,
  Mail,
  Phone,
  Link,
  ChevronDown,
  Download,
  Calendar,
  FileText as FileTextIcon,
  Play,
  LayoutGrid,
  List,
  RefreshCw,
  Database,
  Circle,
  BarChart2,
  Edit3,
  Trash2,
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';
import { INITIAL_LIVE_CLASSES, INITIAL_ASSIGNMENTS, INITIAL_LECTURES, INITIAL_DOMAINS } from '../../data/mockData';
import { Student, Assignment, StudentApplication, LiveClass, RecordedLecture } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PdfResumeModal } from '../common/PdfResumeModal';
import { RecordPaymentModal } from '../common/RecordPaymentModal';
import { AttendanceReportPreviewModal } from '../common/AttendanceReportPreviewModal';
import { generateAttendancePDF } from '../../utils/pdfGenerator';
import { StudentAttendanceProofModal } from '../common/StudentAttendanceProofModal';
import { ScheduleLectureModal } from '../common/ScheduleLectureModal';
import { EndClassRecordingModal } from '../common/EndClassRecordingModal';
import { LectureVideoModal } from '../common/LectureVideoModal';
import { getLectureRealTimeStatus, getLectureCountdown, formatLectureSchedule, parseVideoEmbed } from '../../utils/lectureTimeUtils';

export const MentorDashboard: React.FC = () => {
  const { 
    students, applications, updateApplicationStatus, assignments, addAssignment, 
    submissions, attendanceReports, saveAttendanceReport, 
    liveClasses, recordedLectures, addLiveClass, updateLiveClass, deleteLiveClass, 
    addRecordedLecture, deleteRecordedLecture, endLiveClass, resetData 
  } = useData();
  const { user } = useAuth();
  const mentorName = user?.name || 'Mentor';

  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'applications' | 'assignments' | 'materials'>('attendance');
  const [attendanceTab, setAttendanceTab] = useState<'take' | 'view'>('take');
  const [reportTimeFilter, setReportTimeFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly'>('All');
  const [exactDateFilter, setExactDateFilter] = useState('');
  const [expandedAsg, setExpandedAsg] = useState<string | null>(null);
  
  // Modals
  const [previewReport, setPreviewReport] = useState<any>(null);
  const [proofStudent, setProofStudent] = useState<Student | null>(null);
  
  // Search & Filters for Students Directory
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 8;

  // Batch Wise Attendance state
  const [selectedAttendanceBatch, setSelectedAttendanceBatch] = useState<string>('Batch W-2026-A');
  const [attendanceSearch, setAttendanceSearch] = useState<string>('');
  const [reportBatchFilter, setReportBatchFilter] = useState<string>('All');

  // Pagination & Layout for Attendance tab & Reports
  const [attendancePage, setAttendancePage] = useState(1);
  const attendanceStudentsPerPage = 5;

  const [reportPage, setReportPage] = useState(1);
  const [reportViewMode, setReportViewMode] = useState<'grid' | 'table'>('grid');
  const reportsPerPage = reportViewMode === 'grid' ? 4 : 6;

  // Modal for Fee Payment
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Attendance records state map: studentId -> 'Present' | 'Absent' | 'Late' | 'Leave'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({
    'std-101': 'Present',
    'std-102': 'Present',
    'std-103': 'Late',
    'std-104': 'Present',
    'std-105': 'Present'
  });

  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // List of available batches dynamically from students + defaults
  const availableAttendanceBatches = Array.from(new Set([
    'Batch RK-Gurukul-DS',
    'Batch W-2026-A',
    'Batch W-2026-B',
    'Batch W-2026-C',
    'Batch W-2026-D',
    ...students.map(s => s.batch).filter(Boolean)
  ]));

  const attendanceFilteredStudents = students.filter(std => {
    const matchesBatch = selectedAttendanceBatch === 'All' || std.batch === selectedAttendanceBatch;
    const q = (attendanceSearch || '').trim().toLowerCase();
    const matchesSearch = !q || 
      (std.name || '').toLowerCase().includes(q) ||
      (std.email || '').toLowerCase().includes(q) ||
      (std.domain || '').toLowerCase().includes(q);
    return matchesBatch && matchesSearch;
  });

  const filteredFeeStudents = students.filter(std => {
    const q = (studentSearch || '').trim().toLowerCase();
    const matchesSearch = !q ||
      (std.name || '').toLowerCase().includes(q) ||
      (std.email || '').toLowerCase().includes(q) ||
      (std.domain || '').toLowerCase().includes(q);
    const matchesBatch = selectedBatch === 'All' || std.batch === selectedBatch;
    const feeStatus = std.feeDetails?.status || 'Unpaid';
    const matchesFee = feeStatusFilter === 'All' || feeStatus === feeStatusFilter;
    return matchesSearch && matchesBatch && matchesFee;
  });

  const totalStudentPages = Math.max(1, Math.ceil(filteredFeeStudents.length / studentsPerPage));
  const currentStudentPage = Math.min(studentPage, totalStudentPages);
  const paginatedStudents = filteredFeeStudents.slice((currentStudentPage - 1) * studentsPerPage, currentStudentPage * studentsPerPage);

  const handleMarkAllInBatch = (status: 'Present' | 'Absent' | 'Late') => {
    const updated = { ...attendanceMap };
    attendanceFilteredStudents.forEach(std => {
      updated[std.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleMarkAttendance = (id: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const targetStudents = students.filter(std => selectedAttendanceBatch === 'All' || std.batch === selectedAttendanceBatch);

    if (targetStudents.length === 0) {
      alert("No students found in the selected batch to mark attendance.");
      return;
    }

    const records: any[] = targetStudents.map(std => ({
      id: `rec-${std.id}-${Date.now()}`,
      studentId: std.id,
      studentName: std.name,
      batch: std.batch,
      domain: std.domain,
      date: dateStr,
      status: attendanceMap[std.id] || 'Present'
    }));

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const lateCount = records.filter(r => r.status === 'Late').length;

    saveAttendanceReport({
      date: dateStr,
      batch: selectedAttendanceBatch === 'All' ? 'All Batches Combined' : selectedAttendanceBatch,
      mentorName,
      totalStudents: targetStudents.length,
      presentCount,
      absentCount,
      lateCount,
      records
    });

    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  // Resume Modal
  const [selectedAppForResume, setSelectedAppForResume] = useState<StudentApplication | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [appSearch, setAppSearch] = useState('');

  // New Note / Video Uploader State
  const [noteSourceType, setNoteSourceType] = useState<'file' | 'url'>('file');
  const [newNote, setNewNote] = useState({ 
    title: '', 
    domain: 'MERN Stack Development', 
    week: 5, 
    link: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    duration: '45m',
    pdfNotesName: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [playingMentorVideo, setPlayingMentorVideo] = useState<string | null>(null);
  const [mentorVideoSearch, setMentorVideoSearch] = useState('');
  const [mentorVideoWeekFilter, setMentorVideoWeekFilter] = useState('All');
  const [mentorVideoPage, setMentorVideoPage] = useState(1);
  const mentorVideosPerPage = 6;

  // Auto-detect video duration and set local preview URL from laptop video file
  const handleVideoFileSelect = (file: File) => {
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const fileSizeStr = `${sizeMb} MB`;
    const previewUrl = URL.createObjectURL(file);

    setVideoFile(file);
    setVideoPreviewUrl(previewUrl);

    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = previewUrl;
    tempVideo.onloadedmetadata = () => {
      const durationSeconds = Math.round(tempVideo.duration);
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const formattedDuration = mins > 0 ? `${mins}m ${secs > 0 ? secs + 's' : ''}` : `${secs}s`;
      setNewNote(prev => ({
        ...prev,
        fileUrl: previewUrl,
        fileName: file.name,
        fileSize: fileSizeStr,
        duration: formattedDuration || '45m'
      }));
    };
    tempVideo.onerror = () => {
      setNewNote(prev => ({
        ...prev,
        fileUrl: previewUrl,
        fileName: file.name,
        fileSize: fileSizeStr
      }));
    };
  };

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState<LiveClass | null>(null);
  const [endingLecture, setEndingLecture] = useState<LiveClass | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{
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
  const [materialsBatchFilter, setMaterialsBatchFilter] = useState<string>('All');
  const [materialsStatusFilter, setMaterialsStatusFilter] = useState<'All' | 'Live' | 'Upcoming' | 'Completed'>('All');
  const [materialsSearch, setMaterialsSearch] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    domain: 'MERN Stack Development',
    dueDate: '',
    maxMarks: 100,
    description: '',
    pdfFileName: ''
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    addAssignment({
      title: newAssignment.title,
      domain: newAssignment.domain,
      batch: 'Batch W-2026-A',
      dueDate: newAssignment.dueDate,
      maxMarks: newAssignment.maxMarks,
      description: newAssignment.description,
      pdfFileName: newAssignment.pdfFileName
    });
    setShowAssignmentModal(false);
    setNewAssignment({
      title: '',
      domain: 'MERN Stack Development',
      dueDate: '',
      maxMarks: 100,
      description: '',
      pdfFileName: ''
    });
  };

  const handleUploadNote = (e: React.FormEvent) => {
    e.preventDefault();

    const finalVideoUrl = noteSourceType === 'file' 
      ? (videoPreviewUrl || newNote.fileUrl || 'https://www.w3schools.com/html/mov_bbb.mp4')
      : (newNote.link || 'https://www.w3schools.com/html/mov_bbb.mp4');

    addRecordedLecture({
      title: newNote.title,
      domain: newNote.domain,
      week: newNote.week,
      videoUrl: finalVideoUrl,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      duration: newNote.duration || '45m',
      pdfNotesUrl: newNote.pdfNotesName ? `#notes-${newNote.pdfNotesName}` : '#'
    });

    setNewNote({ 
      title: '', 
      domain: 'MERN Stack Development', 
      week: 5, 
      link: '', 
      fileUrl: '', 
      fileName: '', 
      fileSize: '', 
      duration: '45m',
      pdfNotesName: '' 
    });
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setShowUploadModal(false);
  };

  const filteredApps = applications.filter(a => {
    const q = (appSearch || '').trim().toLowerCase();
    return !q ||
      (a.applicantName || '').toLowerCase().includes(q) || 
      (a.email || '').toLowerCase().includes(q) ||
      (a.domain || '').toLowerCase().includes(q) ||
      (a.college || '').toLowerCase().includes(q);
  });

  const filteredStudents = students.filter(s => {
    const q = (studentSearch || '').trim().toLowerCase();
    const matchesSearch = !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.domain || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q);
    const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
    const feeStatus = s.feeDetails?.status || 'Unpaid';
    const matchesFee = feeStatusFilter === 'All' || feeStatus === feeStatusFilter;
    return matchesSearch && matchesBatch && matchesFee;
  });

  return (
    <div className="space-y-6">
      
      {/* Mentor Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-400/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-orange-950/80 text-xs font-extrabold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-emerald-900" />
            <span>Senior Instructor Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{mentorName} • Mentor Panel</h2>
          <p className="text-xs text-orange-950/90 mt-1 font-medium">Assigned Domains: MERN Stack Development & Full Stack Java</p>
        </div>

        <div className="flex items-center space-x-3 bg-white/25 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/40 text-xs font-semibold shadow-sm">
          <div>
            <div className="text-white font-black text-sm">
              {selectedAttendanceBatch === 'All' ? 'All Active Batches' : selectedAttendanceBatch}
            </div>
            <div className="text-orange-950/90 text-[10px] font-bold">
              {students.filter(s => selectedAttendanceBatch === 'All' || s.batch === selectedAttendanceBatch).length} Active Students
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'attendance' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-orange-300/40' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ✅ Take Attendance
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'students' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-orange-300/40' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🎓 Students & Fees ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'applications' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-orange-300/40' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>📥 Applicants & PDF Resumes ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'assignments' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-orange-300/40' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          📝 Assignments & Grading ({INITIAL_ASSIGNMENTS.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            activeTab === 'materials' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-orange-300/40' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          📹 Upload Lectures & Notes
        </button>
      </div>

      {/* TAB 1: ATTENDANCE MARKER */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-5">
          
          {/* Header & Subtabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  {selectedAttendanceBatch === 'All' ? 'All Batches Combined' : selectedAttendanceBatch} Live Attendance
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200/60">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>{attendanceFilteredStudents.length} Students</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Select a specific batch below to mark attendance, apply bulk status, or review archived reports.
              </p>

              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={() => setAttendanceTab('take')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    attendanceTab === 'take'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Take Attendance</span>
                </button>
                <button
                  onClick={() => setAttendanceTab('view')}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    attendanceTab === 'view'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>View Reports ({attendanceReports.length})</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            {attendanceTab === 'take' && (
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer active:scale-95 self-start lg:self-center"
              >
                <FileText className="w-4 h-4 stroke-[2]" />
                <span>Save Attendance Report</span>
              </button>
            )}
          </div>

          {attendanceSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-xs animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attendance report for <strong>{selectedAttendanceBatch}</strong> saved successfully! Updated reports and real-time student logs.</span>
            </div>
          )}

          {/* TAKE ATTENDANCE SUB-TAB */}
          {attendanceTab === 'take' && (() => {
            const totalAttendancePages = Math.ceil(attendanceFilteredStudents.length / attendanceStudentsPerPage) || 1;
            const currentPage = Math.min(attendancePage, totalAttendancePages);
            const paginatedAttendanceStudents = attendanceFilteredStudents.slice(
              (currentPage - 1) * attendanceStudentsPerPage,
              currentPage * attendanceStudentsPerPage
            );

            return (
              <div className="space-y-4">
                
                {/* Batch Selector & Quick Actions Control Toolbar */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
                  
                  {/* Batch Dropdown */}
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 shrink-0">Select Batch:</span>
                    <div className="relative">
                      <select
                        value={selectedAttendanceBatch}
                        onChange={(e) => {
                          setSelectedAttendanceBatch(e.target.value);
                          setAttendancePage(1);
                        }}
                        className="py-1.5 pl-3 pr-8 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs appearance-none"
                      >
                        <option value="All">All Batches</option>
                        {availableAttendanceBatches.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Search Bar within Batch */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student in batch..."
                      value={attendanceSearch}
                      onChange={(e) => {
                        setAttendanceSearch(e.target.value);
                        setAttendancePage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Quick Bulk Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleMarkAllInBatch('Present')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all border border-emerald-200/80 cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark All Present</span>
                    </button>
                    <button
                      onClick={() => handleMarkAllInBatch('Absent')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all border border-rose-200/80 cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Mark All Absent</span>
                    </button>
                  </div>
                </div>

                {/* Batch Attendance Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium px-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs">
                      Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>Present: {attendanceFilteredStudents.filter(s => (attendanceMap[s.id] || 'Present') === 'Present').length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-rose-50 text-rose-700 border border-rose-100">
                      <Users className="w-3 h-3 text-rose-600" />
                      <span>Absent: {attendanceFilteredStudents.filter(s => attendanceMap[s.id] === 'Absent').length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-amber-50 text-amber-700 border border-amber-100">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Late: {attendanceFilteredStudents.filter(s => attendanceMap[s.id] === 'Late').length}</span>
                    </span>
                  </div>
                </div>

                {/* Students Attendance List */}
                {attendanceFilteredStudents.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-200/80">
                    <Users className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No students found for {selectedAttendanceBatch}.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try selecting another batch from the dropdown above.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {paginatedAttendanceStudents.map((std, idx) => {
                      const currentStatus = attendanceMap[std.id] || 'Present';
                      const fee = std.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
                      
                      // Pastel avatar backgrounds matching screenshot
                      const avatarThemes = [
                        'bg-blue-100 text-blue-700 border-blue-200',
                        'bg-purple-100 text-purple-700 border-purple-200',
                        'bg-rose-100 text-rose-700 border-rose-200',
                        'bg-teal-100 text-teal-700 border-teal-200',
                        'bg-amber-100 text-amber-700 border-amber-200'
                      ];
                      const avatarTheme = avatarThemes[idx % avatarThemes.length];
                      const initials = (std.name || '')
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'ST';

                      return (
                        <div
                          key={std.id}
                          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            {/* Avatar Initials Circle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${avatarTheme}`}>
                              {initials}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-xs truncate">{std.name}</h4>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-[10px] font-semibold">
                                  {std.batch}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  fee.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                    : fee.status === 'Partial'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/60'
                                }`}>
                                  Fee: {fee.status}
                                </span>
                                {/* Proof button */}
                                <button
                                  type="button"
                                  onClick={() => setProofStudent(std)}
                                  title="View Real-time Attendance Proof"
                                  className="text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold ml-1 cursor-pointer"
                                >
                                  Proof
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                                {std.email} • {std.college} • {std.domain}
                              </p>
                            </div>
                          </div>

                          {/* 3 Status Pill Buttons */}
                          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(std.id, 'Present')}
                              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Present'
                                  ? 'bg-[#059669] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {currentStatus === 'Present' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>Present</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(std.id, 'Absent')}
                              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Absent'
                                  ? 'bg-[#e11d48] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {currentStatus === 'Absent' ? (
                                <XCircle className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>Absent</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(std.id, 'Late')}
                              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                currentStatus === 'Late'
                                  ? 'bg-[#ea580c] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 text-current stroke-[2]" />
                              <span>Late</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls for Take Attendance */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                  <div className="text-slate-400 text-xs">
                    Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * attendanceStudentsPerPage + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * attendanceStudentsPerPage, attendanceFilteredStudents.length)}</span> of <span className="font-semibold text-slate-700">{attendanceFilteredStudents.length}</span> students
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setAttendancePage(p => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 shadow-2xs cursor-pointer"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalAttendancePages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setAttendancePage(pg)}
                          className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === pg
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={currentPage === totalAttendancePages}
                      onClick={() => setAttendancePage(p => Math.min(p + 1, totalAttendancePages))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 shadow-2xs cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW REPORTS SUB-TAB */}
          {attendanceTab === 'view' && (() => {
            const filteredReports = attendanceReports
              .filter(r => {
                if (reportBatchFilter !== 'All' && r.batch !== reportBatchFilter) return false;
                if (exactDateFilter) return r.date === exactDateFilter;
                if (reportTimeFilter === 'All') return true;
                const rDate = new Date(r.date).getTime();
                const now = new Date().getTime();
                if (reportTimeFilter === 'Daily') return r.date === new Date().toISOString().split('T')[0];
                if (reportTimeFilter === 'Weekly') return (now - rDate) <= 7 * 24 * 60 * 60 * 1000;
                if (reportTimeFilter === 'Monthly') return (now - rDate) <= 30 * 24 * 60 * 60 * 1000;
                return true;
              })
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const totalReportPages = Math.ceil(filteredReports.length / reportsPerPage) || 1;
            const currentRPage = Math.min(reportPage, totalReportPages);
            const paginatedReports = filteredReports.slice((currentRPage - 1) * reportsPerPage, currentRPage * reportsPerPage);

            return (
              <div className="space-y-4 print:space-y-6">
                
                {/* Control Toolbar: Filters & View Switcher */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden pb-1 border-b border-slate-100">
                  
                  {/* View Mode Toggle Buttons */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => {
                        setReportViewMode('grid');
                        setReportPage(1);
                      }}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                        reportViewMode === 'grid'
                          ? 'bg-white text-orange-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="2-Column Grid Cards"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid View</span>
                    </button>
                    <button
                      onClick={() => {
                        setReportViewMode('table');
                        setReportPage(1);
                      }}
                      className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                        reportViewMode === 'table'
                          ? 'bg-white text-orange-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Compact Table List"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Compact Table</span>
                    </button>
                  </div>

                  {/* Right Controls: Filter Selectors */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Batch Filter Dropdown */}
                    <select
                      value={reportBatchFilter}
                      onChange={(e) => {
                        setReportBatchFilter(e.target.value);
                        setReportPage(1);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs"
                    >
                      <option value="All">All Batches</option>
                      {availableAttendanceBatches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Exact Date Picker */}
                    <div className="relative flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                      <input
                        type="date"
                        value={exactDateFilter}
                        onChange={(e) => {
                          setExactDateFilter(e.target.value);
                          setReportPage(1);
                          if (e.target.value) setReportTimeFilter('All');
                        }}
                        className="pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 shadow-xs"
                      />
                      {exactDateFilter && (
                        <button 
                          onClick={() => {
                            setExactDateFilter('');
                            setReportPage(1);
                          }}
                          className="ml-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-200 rounded-md"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Range Dropdown */}
                    <select
                      value={reportTimeFilter}
                      onChange={(e) => {
                        setReportTimeFilter(e.target.value as any);
                        setReportPage(1);
                        if (e.target.value !== 'All') setExactDateFilter('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs"
                    >
                      <option value="All">All Ranges</option>
                      <option value="Daily">Today</option>
                      <option value="Weekly">Last 7 Days</option>
                      <option value="Monthly">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                    <FileTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">No attendance reports found matching your batch/date filters.</p>
                  </div>
                ) : reportViewMode === 'grid' ? (
                  /* 2-COLUMN GRID VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                    {paginatedReports.map(report => {
                      const total = report.totalStudents || 1;
                      const presentPct = Math.round((report.presentCount / total) * 100);
                      const absentPct = Math.round((report.absentCount / total) * 100);
                      const latePct = Math.round((report.lateCount / total) * 100);

                      return (
                        <div key={report.id} className="p-4 bg-gradient-to-br from-white via-slate-50/60 to-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all space-y-3.5 relative overflow-hidden group">
                          {/* Top Subtle Gradient Stripe */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />

                          {/* Card Header: Date & Batch Tag */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-9 h-9 rounded-xl bg-orange-100/80 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-xs shrink-0 shadow-xs">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xs leading-tight">
                                  {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </h4>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                                    {report.batch}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold">• {report.totalStudents} Interns</span>
                                </div>
                              </div>
                            </div>

                            {/* Percentage Pill */}
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border shadow-2xs ${
                              presentPct >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : presentPct >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {presentPct}% Present
                            </span>
                          </div>

                          {/* Multi-Color Progress Track */}
                          <div className="space-y-1.5">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div style={{ width: `${presentPct}%` }} className="bg-emerald-500 h-full" title={`Present: ${report.presentCount}`} />
                              <div style={{ width: `${latePct}%` }} className="bg-amber-400 h-full" title={`Late: ${report.lateCount}`} />
                              <div style={{ width: `${absentPct}%` }} className="bg-rose-500 h-full" title={`Absent: ${report.absentCount}`} />
                            </div>

                            {/* Compact Stats Badges */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="px-2 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-100">
                                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Present</span>
                                <span className="text-sm font-black text-emerald-800">{report.presentCount}</span>
                              </div>
                              <div className="px-2 py-1.5 rounded-xl bg-rose-50/90 border border-rose-100">
                                <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider block">Absent</span>
                                <span className="text-sm font-black text-rose-800">{report.absentCount}</span>
                              </div>
                              <div className="px-2 py-1.5 rounded-xl bg-amber-50/90 border border-amber-100">
                                <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider block">Late</span>
                                <span className="text-sm font-black text-amber-800">{report.lateCount}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Action Button */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">PDF Report Ready</span>
                            <button 
                              onClick={() => setPreviewReport(report)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-[11px] rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                            >
                              <FileTextIcon className="w-3.5 h-3.5" />
                              <span>Preview & Download</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* COMPACT TABLE VIEW */
                  <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-2xl bg-white shadow-xs scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-3">Batch</th>
                          <th className="py-3 px-3">Attendance Breakdown</th>
                          <th className="py-3 px-3 text-center">Rate</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {paginatedReports.map(report => {
                          const total = report.totalStudents || 1;
                          const presentPct = Math.round((report.presentCount / total) * 100);
                          return (
                            <tr key={report.id} className="hover:bg-orange-50/40 transition-colors font-medium">
                              <td className="py-3 px-4 font-extrabold text-slate-900">
                                {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                  {report.batch}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center space-x-3 text-[11px] font-bold">
                                  <span className="text-emerald-700">P: {report.presentCount}</span>
                                  <span className="text-rose-700">A: {report.absentCount}</span>
                                  <span className="text-amber-700">L: {report.lateCount}</span>
                                  <span className="text-slate-400 text-[10px]">({report.totalStudents} total)</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                  presentPct >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {presentPct}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setPreviewReport(report)}
                                  className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-extrabold rounded-lg inline-flex items-center space-x-1 transition-all cursor-pointer"
                                >
                                  <FileTextIcon className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls for View Reports */}
                {totalReportPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs font-bold text-slate-600 print:hidden">
                    <div className="text-slate-500 text-xs">
                      Showing <span className="font-black text-slate-800">{(currentRPage - 1) * reportsPerPage + 1}</span> to <span className="font-black text-slate-800">{Math.min(currentRPage * reportsPerPage, filteredReports.length)}</span> of <span className="font-black text-slate-800">{filteredReports.length}</span> reports
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={currentRPage === 1}
                        onClick={() => setReportPage(p => Math.max(p - 1, 1))}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Previous
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalReportPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            onClick={() => setReportPage(pg)}
                            className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              currentRPage === pg
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={currentRPage === totalReportPages}
                        onClick={() => setReportPage(p => Math.min(p + 1, totalReportPages))}
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
        </div>
      )}

      {/* TAB 2: STUDENTS DIRECTORY & FINANCIAL FEE RECORDS FOR MENTORS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
          
          {/* Top Decorative Banner Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#ff5a00] via-[#eab308] via-[#84cc16] to-[#10b981]"></div>

          {/* Header & Controls Section */}
          <div className="overflow-x-auto">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-5 min-w-max bg-white">
              
              {/* Left: Icon + Title & Description */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-[#fff4ed] flex items-center justify-center shrink-0 border border-orange-100/60">
                  <Users className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                      Registered Students Directory & Company Fee Records
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f8ee] text-[#15803d] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                      {filteredStudents.length} Active Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-normal whitespace-nowrap">
                    Track total course fees, payments made, pending balances and manage records in real time.
                  </p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-11 w-px bg-slate-200 mx-2 shrink-0"></div>

              {/* Right: Controls in 2 exact rows */}
              <div className="flex flex-col gap-2 shrink-0">
                
                {/* Row 1: Time Pills + Search + Filters (NEVER WRAPS) */}
                <div className="flex items-center gap-2.5 flex-nowrap">
                  
                  {/* Time Range Dropdown */}
                  <div className="relative flex items-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="pl-8 pr-7 py-1.5 text-[11px] font-medium text-slate-800 bg-white rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-slate-300 cursor-pointer appearance-none transition-all"
                    >
                      <option value="Today">Today</option>
                      <option value="Week">This Week</option>
                      <option value="Month">This Month</option>
                      <option value="Year">This Year</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Search Bar */}
                  <div className="relative shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by student"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setStudentPage(1);
                      }}
                      className="pl-8.5 pr-7 py-1.5 text-[11px] rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-300 text-slate-800 placeholder:text-slate-400 w-36 transition-all"
                    />
                    {studentSearch && (
                      <button 
                        onClick={() => setStudentSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Fee Status Filter Dropdown */}
                  <div className="relative flex items-center shrink-0">
                    <Filter className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={feeStatusFilter}
                      onChange={(e) => {
                        setFeeStatusFilter(e.target.value);
                        setStudentPage(1);
                      }}
                      className="pl-8 pr-7 py-1.5 text-[11px] font-medium text-slate-800 bg-white rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-slate-300 cursor-pointer appearance-none transition-all"
                    >
                      <option value="All">All Fee Status</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial Dues</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Batch Filter Dropdown */}
                  <div className="relative flex items-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedBatch}
                      onChange={(e) => {
                        setSelectedBatch(e.target.value);
                        setStudentPage(1);
                      }}
                      className="pl-8 pr-7 py-1.5 text-[11px] font-medium text-slate-800 bg-white rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-slate-300 cursor-pointer appearance-none transition-all"
                    >
                      <option value="All">All Batches</option>
                      {availableAttendanceBatches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                </div>

                {/* Row 2: Sync Data Button (Aligned directly under Time Pills) */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      resetData();
                      alert('Data synced! Batch RK-Gurukul-DS and student records updated.');
                    }}
                    title="Click to sync new batches and refresh student records"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-orange-500 bg-white hover:bg-orange-50 text-orange-600 font-bold text-[11px] transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                    <span>Sync Data</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Directory & Financial Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200/80">
                  <th className="py-2.5 px-3">Student Info</th>
                  <th className="py-2.5 px-3">Domain & Specialization</th>
                  <th className="py-2.5 px-3">Batch & College</th>
                  <th className="py-2.5 px-3">Total Fee</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Pending Due</th>
                  <th className="py-2.5 px-3">Fee Status</th>
                  <th className="py-3 px-4 text-center font-bold text-xs uppercase text-[#0a2540] tracking-wider">Fee Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-xs text-slate-500">No students match your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((std) => {
                    const fee = std.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
                    
                    const getDomainBadgeStyle = (domainName?: string | null) => {
                      const d = String(domainName || '');
                      if (d.includes('MERN') || d.includes('Full Stack')) {
                        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100';
                      } else if (d.includes('AI') || d.includes('Artificial Intelligence') || d.includes('Deep Learning')) {
                        return 'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100';
                      } else if (d.includes('DevOps') || d.includes('Cloud')) {
                        return 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100';
                      } else if (d.includes('UI/UX') || d.includes('Design')) {
                        return 'bg-pink-50 text-pink-700 border-pink-200/80 hover:bg-pink-100';
                      } else if (d.includes('Data Science')) {
                        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100';
                      }
                      return 'bg-orange-50 text-orange-700 border-orange-200/80 hover:bg-orange-100';
                    };

                    const getAvatarGradient = (name?: string | null) => {
                      const colors = [
                        'from-orange-500 to-amber-500 text-white',
                        'from-indigo-500 to-purple-500 text-white',
                        'from-emerald-500 to-teal-500 text-white',
                        'from-rose-500 to-pink-500 text-white',
                        'from-sky-500 to-blue-500 text-white'
                      ];
                      let sum = 0;
                      const safeName = String(name || 'Student');
                      for (let i = 0; i < safeName.length; i++) sum += safeName.charCodeAt(i);
                      return colors[sum % colors.length];
                    };

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Student Info with Avatar */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${getAvatarGradient(std.name)} flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0`}>
                              {std.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs tracking-tight group-hover:text-orange-600 transition-colors">
                                {std.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex flex-col gap-y-1 mt-1 font-medium">
                                <div className="flex items-center space-x-1.5 hover:text-slate-700 transition-colors">
                                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="truncate max-w-[160px]">{std.email}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 hover:text-slate-700 transition-colors">
                                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="whitespace-nowrap">{std.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Domain Tag Pill */}
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-colors ${getDomainBadgeStyle(std.domain)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{std.domain}</span>
                          </span>
                        </td>

                        {/* Batch & College */}
                        <td className="py-2.5 px-3">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px] border border-slate-200/60 mb-0.5">
                              {std.batch}
                            </span>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[130px]">{std.college}</span>
                            </div>
                          </div>
                        </td>

                        {/* Total Fee */}
                        <td className="py-2.5 px-3 font-black text-slate-900 text-xs font-mono">
                          ₹{fee.totalFee.toLocaleString('en-IN')}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-2.5 px-3">
                          <span className="font-black text-emerald-600 text-xs font-mono flex items-center space-x-1">
                            <span>₹{fee.paidAmount.toLocaleString('en-IN')}</span>
                          </span>
                        </td>

                        {/* Pending Due */}
                        <td className="py-2.5 px-3">
                          {fee.pendingAmount > 0 ? (
                            <span className="font-black text-rose-600 text-xs font-mono bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80 inline-block shadow-2xs">
                              ₹{fee.pendingAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400 text-xs font-mono">
                              ₹0
                            </span>
                          )}
                        </td>

                        {/* Fee Status Badge */}
                        <td className="py-2.5 px-3">
                          {fee.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          ) : fee.status === 'Partial' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>₹{fee.pendingAmount.toLocaleString('en-IN')} Due</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Unpaid</span>
                            </span>
                          )}
                        </td>

                        {/* Actions: Payment */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                setSelectedStudentForFee(std);
                                setShowFeeModal(true);
                              }}
                              title="Record Payment"
                              className="w-8 h-8 rounded-lg bg-[#eff6ff] border border-[#dbeafe] text-[#0066cc] hover:bg-[#dbeafe] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <DollarSign className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-bold flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Showing <strong className="text-slate-900">{Math.min((currentStudentPage - 1) * studentsPerPage + 1, filteredFeeStudents.length)}</strong> - <strong className="text-slate-900">{Math.min(currentStudentPage * studentsPerPage, filteredFeeStudents.length)}</strong> of <strong className="text-slate-900">{filteredFeeStudents.length}</strong> students</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentStudentPage === 1}
                onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-[10px]"
              >
                Prev
              </button>
              <span className="text-[10px] font-extrabold text-slate-700 px-2">
                {currentStudentPage} / {totalStudentPages}
              </span>
              <button
                disabled={currentStudentPage === totalStudentPages}
                onClick={() => setStudentPage((p) => Math.min(totalStudentPages, p + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-[10px]"
              >
                Next
              </button>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-bold flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Showing <strong className="text-slate-900">{filteredFeeStudents.length}</strong> of <strong className="text-slate-900">{students.length}</strong> students</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Total Pool:</span>
                <span className="font-black text-slate-900 font-mono">₹{filteredFeeStudents.reduce((acc, s) => acc + (s.feeDetails?.totalFee || 15000), 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-emerald-700 font-bold">Collected:</span>
                <span className="font-black text-emerald-700 font-mono">₹{filteredFeeStudents.reduce((acc, s) => acc + (s.feeDetails?.paidAmount || 0), 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-rose-50/90 px-3 py-1.5 rounded-xl border border-rose-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-rose-700 font-bold">Dues:</span>
                <span className="font-black text-rose-700 font-mono">₹{filteredFeeStudents.reduce((acc, s) => acc + (s.feeDetails?.pendingAmount || 0), 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: APPLICANTS & PDF RESUMES FOR MENTOR REVIEW */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Internship Applications & Resume Screenings</h3>
              <p className="text-xs text-slate-500">Mentors can evaluate candidate skills, review PDF resumes, and approve/reject applications</p>
            </div>
            
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter applicant by name or college..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{app.applicantName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-orange-600 mt-0.5">{app.domain}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{app.appliedDate}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <div><span className="font-bold">College:</span> {app.college}</div>
                  <div><span className="font-bold">Contact:</span> {app.email} • {app.phone}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setSelectedAppForResume(app);
                      setShowResumeModal(true);
                    }}
                    className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>View PDF Resume</span>
                  </button>

                  <div className="flex space-x-1.5">
                    {app.status !== 'Accepted' && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'Accepted')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Accept
                      </button>
                    )}
                    {app.status !== 'Rejected' && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Domain Assignments & Intern Submissions</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage tasks, deadlines, and review student code submissions</p>
            </div>
            <button 
              onClick={() => setShowAssignmentModal(true)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => {
              const asgSubmissions = submissions.filter(s => s.assignmentId === asg.id);
              const isExpanded = expandedAsg === asg.id;
              
              return (
              <div key={asg.id} className="group p-5 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-orange-200/80 transition-all shadow-sm hover:shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-100/50 group-hover:scale-105 transition-transform shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-[15px] group-hover:text-orange-600 transition-colors tracking-tight">{asg.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 mt-1.5">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60">{asg.domain}</span>
                        <span className="flex items-center space-x-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                          <Clock className="w-3 h-3" />
                          <span>Due: {asg.dueDate}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <Award className="w-3 h-3" />
                          <span>Max Marks: {asg.maxMarks}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setExpandedAsg(isExpanded ? null : asg.id)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 text-orange-700 hover:bg-orange-100 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm sm:self-start transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>{asgSubmissions.length} Submissions</span>
                    <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-orange-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <div className="pl-[58px]">
                  <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{asg.description}</p>
                </div>

                {/* Submissions Accordion Dropdown */}
                {isExpanded && (
                  <div className="pl-[58px] mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Intern Submissions Log</h5>
                    {asgSubmissions.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium">
                        No submissions yet for this assignment.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {asgSubmissions.map((sub, idx) => (
                          <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/40 transition-colors shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 flex items-center justify-center text-[10px] font-bold border border-orange-200/50 shadow-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Submitted: <span className="font-semibold">{sub.submittedAt}</span></p>
                              </div>
                            </div>
                            <a 
                              href={sub.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="mt-2 sm:mt-0 flex items-center space-x-1.5 px-3.5 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60 shadow-sm"
                            >
                              <Link className="w-3.5 h-3.5" />
                              <span>View Work</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )})}
            
            {assignments.length === 0 && (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-600">No assignments created</h4>
                <p className="text-xs text-slate-400 mt-1">Click the button above to create your first assignment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LECTURES & STUDY MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Top Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Real-time Class Broadcasting
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Lecture Scheduling & Video Resource Center
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                  Schedule live classes with precision timing, broadcast meeting links to specific intern batches, and seamlessly publish session recordings upon lecture completion.
                </p>

                {/* Quick Stats Pill Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-extrabold text-white">
                      {liveClasses.filter(c => getLectureRealTimeStatus(c) === 'Live').length} Live Now
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-extrabold text-white">
                      {liveClasses.filter(c => getLectureRealTimeStatus(c) === 'Upcoming').length} Upcoming
                    </span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold text-white">
                      {recordedLectures.length} Recorded Library
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
                <button 
                  onClick={() => {
                    setEditingLecture(null);
                    setShowScheduleModal(true);
                  }}
                  className="px-5 py-3 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Schedule Live Class</span>
                </button>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-5 py-3 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload / Add Recording</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtering & Search Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lectures by topic, domain, or batch..."
                value={materialsSearch}
                onChange={(e) => setMaterialsSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {materialsSearch && (
                <button
                  onClick={() => setMaterialsSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills: Batch & Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">Batch:</span>
                <select
                  value={materialsBatchFilter}
                  onChange={(e) => setMaterialsBatchFilter(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Batches</option>
                  {availableAttendanceBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {(['All', 'Live', 'Upcoming', 'Completed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setMaterialsStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      materialsStatusFilter === st
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Live' ? '🔴 Live Now' : st === 'Upcoming' ? '📅 Upcoming' : st === 'Completed' ? '🎬 Completed' : 'All Classes'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 1: SCHEDULED & LIVE LECTURES */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Active & Scheduled Class Sessions
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Real-time status calculated automatically by session date & start/end time</p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {liveClasses.length} Scheduled
              </span>
            </div>

            {(() => {
              const q = materialsSearch.trim().toLowerCase();
              const filtered = liveClasses.filter(lc => {
                const rtStatus = getLectureRealTimeStatus(lc);
                const matchesStatus = 
                  materialsStatusFilter === 'All' ? true :
                  materialsStatusFilter === 'Live' ? rtStatus === 'Live' :
                  materialsStatusFilter === 'Upcoming' ? rtStatus === 'Upcoming' :
                  rtStatus === 'Completed';

                const matchesBatch = materialsBatchFilter === 'All' || lc.batch === materialsBatchFilter || lc.batch === 'All Batches';

                const matchesSearch = !q ||
                  (lc.title || '').toLowerCase().includes(q) ||
                  (lc.domain || '').toLowerCase().includes(q) ||
                  (lc.batch || '').toLowerCase().includes(q) ||
                  (lc.mentorName || '').toLowerCase().includes(q);

                return matchesStatus && matchesBatch && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 bg-slate-50/70 rounded-3xl border border-slate-200/80 space-y-3">
                    <Video className="w-12 h-12 text-slate-300 mx-auto" />
                    <h5 className="text-sm font-extrabold text-slate-700">No scheduled classes match this filter</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Schedule a new live class or select "All Batches" to view all active timetable sessions.
                    </p>
                    <button
                      onClick={() => {
                        setEditingLecture(null);
                        setShowScheduleModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      + Schedule Lecture Now
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filtered.map(lc => {
                    const rtStatus = getLectureRealTimeStatus(lc);
                    const countdown = getLectureCountdown(lc);
                    const scheduleStr = formatLectureSchedule(lc);
                    const isLive = rtStatus === 'Live';
                    const isUpcoming = rtStatus === 'Upcoming';
                    const isCompleted = rtStatus === 'Completed';

                    return (
                      <div 
                        key={lc.id}
                        className={`rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                          isLive 
                            ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-500/20' 
                            : isUpcoming 
                            ? 'bg-indigo-50/30 border-indigo-200/80 hover:border-indigo-300' 
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        {/* Top Badges & Timing Status */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {/* Live / Upcoming / Completed Indicator */}
                            {isLive ? (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs shadow-rose-600/30 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                <span>{countdown.badgeText}</span>
                              </span>
                            ) : isUpcoming ? (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                <Clock className="w-3 h-3 text-indigo-600" />
                                <span>{countdown.badgeText}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Completed & Recorded</span>
                              </span>
                            )}

                            {/* Batch Pill */}
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                              {lc.batch}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 line-clamp-2 mt-1">
                              {lc.title}
                            </h4>
                            {lc.description && (
                              <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                                {lc.description}
                              </p>
                            )}
                          </div>

                          {/* Metadata Grid */}
                          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">{scheduleStr}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Video className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span className="truncate">{lc.meetingPlatform}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">Mentor: <strong>{lc.mentorName}</strong></span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span className="truncate">{lc.domain}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            {/* Join Live Meeting Link */}
                            {lc.meetingUrl && !isCompleted && (
                              <a
                                href={lc.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                                  isLive 
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isLive ? 'Join Live Now' : 'Join Link'}</span>
                              </a>
                            )}

                            {/* If session has recording, allow instant playback */}
                            {lc.recordingUrl && (
                              <button
                                onClick={() => setActiveVideoModal({
                                  videoUrl: lc.recordingUrl!,
                                  title: lc.title,
                                  domain: lc.domain,
                                  batch: lc.batch,
                                  mentorName: lc.mentorName,
                                  duration: `${lc.durationMinutes}m`,
                                  date: lc.date,
                                  notesUrl: lc.notesUrl,
                                  notesFileName: lc.notesFileName
                                })}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Play Recording</span>
                              </button>
                            )}

                            {/* End Class & Publish Recording Button */}
                            {!isCompleted && (
                              <button
                                onClick={() => setEndingLecture(lc)}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                                title="End lecture and add recording URL/video"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>End & Publish</span>
                              </button>
                            )}
                          </div>

                          {/* Edit & Delete Controls */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setEditingLecture(lc)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                              title="Edit scheduled class"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${lc.title}"?`)) {
                                  deleteLiveClass(lc.id);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                              title="Delete class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* SECTION 2: PUBLISHED RECORDED LECTURES & STUDY MATERIALS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Play className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                    <span>Published Batch Video Lectures & Study Notes</span>
                    <span className="text-xs bg-orange-100 text-orange-800 font-black px-2.5 py-0.5 rounded-full border border-orange-200">
                      {recordedLectures.length} Total
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">All archived class recordings available for interns to watch anytime</p>
                </div>
              </div>

              {/* Search Inside Videos */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search published videos..."
                  value={mentorVideoSearch}
                  onChange={(e) => {
                    setMentorVideoSearch(e.target.value);
                    setMentorVideoPage(1);
                  }}
                  className="w-full pl-9 pr-7 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
                {mentorVideoSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setMentorVideoSearch('');
                      setMentorVideoPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {recordedLectures.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-2">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-black text-slate-700">No recorded lectures published yet</p>
                <p className="text-[11px] text-slate-400">When you end a live class or upload a file, it will appear here automatically.</p>
              </div>
            ) : (() => {
              const q = (mentorVideoSearch || '').trim().toLowerCase();
              const filtered = recordedLectures.filter((lec) => {
                const matchesSearch = !q ||
                  (lec.title || '').toLowerCase().includes(q) || 
                  (lec.domain || '').toLowerCase().includes(q) ||
                  (lec.batch || '').toLowerCase().includes(q) ||
                  `week ${lec.week || ''}`.toLowerCase().includes(q);
                const matchesBatch = materialsBatchFilter === 'All' || lec.batch === materialsBatchFilter || !lec.batch;
                return matchesSearch && matchesBatch;
              });

              const totalPages = Math.ceil(filtered.length / mentorVideosPerPage) || 1;
              const currentPage = Math.min(mentorVideoPage, totalPages);
              const paginated = filtered.slice(
                (currentPage - 1) * mentorVideosPerPage,
                currentPage * mentorVideosPerPage
              );

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 bg-orange-50/30 rounded-2xl border border-orange-100 p-4">
                    <p className="text-xs font-bold text-slate-700">No published materials match "{mentorVideoSearch}"</p>
                    <button
                      type="button"
                      onClick={() => { setMentorVideoSearch(''); setMentorVideoPage(1); }}
                      className="mt-2 text-xs font-extrabold text-orange-600 underline cursor-pointer"
                    >
                      Reset Search Filters
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginated.map((lec) => (
                      <div 
                        key={lec.id} 
                        className="p-4 bg-slate-50 hover:bg-white rounded-3xl border border-slate-200 hover:border-orange-300 flex flex-col justify-between space-y-3 group transition-all shadow-2xs hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                              Week {lec.week || 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {lec.batch || 'All Batches'}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-slate-900 text-xs group-hover:text-orange-600 transition-colors line-clamp-2">
                            {lec.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {lec.domain} • 🕒 {lec.duration}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveVideoModal({
                              videoUrl: lec.videoUrl,
                              title: lec.title,
                              domain: lec.domain,
                              batch: lec.batch,
                              mentorName: lec.mentorName,
                              duration: lec.duration,
                              date: lec.date,
                              notesUrl: lec.pdfNotesUrl,
                              notesFileName: lec.pdfNotesName
                            })}
                            className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Watch</span>
                          </button>

                          {lec.pdfNotesUrl && lec.pdfNotesUrl !== '#' && (
                            <a
                              href={lec.pdfNotesUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white text-slate-700 hover:text-indigo-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                              title="Download Notes"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete lecture "${lec.title}"?`)) {
                                deleteRecordedLecture(lec.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Delete video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500">
                        Showing {(currentPage - 1) * mentorVideosPerPage + 1} - {Math.min(currentPage * mentorVideosPerPage, filtered.length)} of {filtered.length}
                      </p>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setMentorVideoPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-bold px-2 text-slate-700">{currentPage} / {totalPages}</span>
                        <button
                          type="button"
                          onClick={() => setMentorVideoPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* PDF RESUME MODAL */}
      <PdfResumeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        application={selectedAppForResume}
        onAccept={(id) => updateApplicationStatus(id, 'Accepted')}
        onReject={(id) => updateApplicationStatus(id, 'Rejected')}
      />

      <AttendanceReportPreviewModal 
        report={previewReport} 
        onClose={() => setPreviewReport(null)} 
      />

      {/* RECORD PAYMENT MODAL FOR MENTOR */}
      <RecordPaymentModal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        student={selectedStudentForFee}
      />

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAssignmentModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <FileText className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-black text-lg drop-shadow-md">Create New Assignment</h3>
                  <p className="text-[11px] font-medium text-white/90 drop-shadow-sm">Set a new task for your internship batch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all backdrop-blur-md relative z-10 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Assignment Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Build RESTful API for E-Commerce"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Domain <span className="text-rose-500">*</span></label>
                  <select 
                    value={newAssignment.domain}
                    onChange={(e) => setNewAssignment({...newAssignment, domain: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="MERN Stack Development">MERN Stack Development</option>
                    <option value="Full Stack Java">Full Stack Java</option>
                    <option value="Data Science & ML">Data Science & ML</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Due Date <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Max Marks <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="1000"
                  value={newAssignment.maxMarks}
                  onChange={(e) => setNewAssignment({...newAssignment, maxMarks: parseInt(e.target.value) || 100})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Detailed Description <span className="text-rose-500">*</span></label>
                <textarea 
                  required
                  placeholder="Describe the tasks, requirements, and submission guidelines..."
                  rows={4}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">Attach Assignment PDF <span className="text-slate-400 font-semibold normal-case">(Optional)</span></label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setNewAssignment({...newAssignment, pdfFileName: e.target.files?.[0]?.name || ''})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full px-4 py-3 rounded-2xl border-2 border-dashed ${newAssignment.pdfFileName ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50 group-hover:border-orange-300 group-hover:bg-orange-50/30'} transition-all flex items-center justify-center space-x-2`}>
                    <Upload className={`w-4 h-4 ${newAssignment.pdfFileName ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-400'}`} />
                    <span className={`text-xs font-bold ${newAssignment.pdfFileName ? 'text-orange-700' : 'text-slate-500 group-hover:text-orange-600'}`}>
                      {newAssignment.pdfFileName ? newAssignment.pdfFileName : 'Click to upload PDF or drag and drop'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-5 py-2.5 text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE & EDIT LECTURE MODAL */}
      <ScheduleLectureModal
        isOpen={showScheduleModal || !!editingLecture}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingLecture(null);
        }}
        onSave={(data) => {
          if (editingLecture) {
            updateLiveClass(editingLecture.id, data);
          } else {
            addLiveClass({
              ...data,
              status: data.status || 'Upcoming',
              mentorName: data.mentorName || mentorName
            });
          }
          setShowScheduleModal(false);
          setEditingLecture(null);
        }}
        initialData={editingLecture}
        domains={INITIAL_DOMAINS.map(d => d.name)}
        batches={availableAttendanceBatches}
        currentMentorName={mentorName}
      />

      {/* END CLASS & PUBLISH RECORDING MODAL */}
      <EndClassRecordingModal
        isOpen={!!endingLecture}
        onClose={() => setEndingLecture(null)}
        onConfirm={(classId, recordingUrl, notesUrl, notesFileName) => {
          endLiveClass(classId, recordingUrl, notesUrl, notesFileName);
          setEndingLecture(null);
        }}
        liveClass={endingLecture}
      />

      {/* UNIVERSAL LECTURE VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <LectureVideoModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          videoUrl={activeVideoModal.videoUrl}
          title={activeVideoModal.title}
          domain={activeVideoModal.domain}
          batch={activeVideoModal.batch}
          mentorName={activeVideoModal.mentorName}
          duration={activeVideoModal.duration}
          date={activeVideoModal.date}
          notesUrl={activeVideoModal.notesUrl}
          notesFileName={activeVideoModal.notesFileName}
        />
      )}

      {/* UPLOAD RECORDED LECTURE / MATERIAL MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowUploadModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Upload className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-black text-lg drop-shadow-md">Upload Recorded Video & Notes</h3>
                  <p className="text-[11px] font-medium text-white/90 drop-shadow-sm">Upload video file directly from laptop or paste link</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all backdrop-blur-md relative z-10 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUploadNote} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">Lecture / Video Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 5: Advanced Mongoose Aggregation & Pipelines"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">Domain</label>
                  <input
                    type="text"
                    readOnly
                    value={newNote.domain}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">Week Number</label>
                  <select
                    value={newNote.week}
                    onChange={(e) => setNewNote({ ...newNote, week: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-800 shadow-sm cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Mode Switcher: Laptop File vs Video URL */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">
                  Select Video Source <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-3">
                  <button
                    type="button"
                    onClick={() => setNoteSourceType('file')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                      noteSourceType === 'file'
                        ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📁 Upload Video from Laptop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteSourceType('url')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                      noteSourceType === 'url'
                        ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>🔗 Paste Video Link</span>
                  </button>
                </div>

                {noteSourceType === 'file' ? (
                  <div>
                    {!videoFile ? (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                        onDragLeave={() => setIsDraggingVideo(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingVideo(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleVideoFileSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
                          isDraggingVideo ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-orange-400 bg-slate-50/70 hover:bg-orange-50/30'
                        }`}
                      >
                        <input
                          type="file"
                          required={noteSourceType === 'file' && !videoPreviewUrl}
                          accept="video/*,.mp4,.webm,.mkv,.mov,.avi"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleVideoFileSelect(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800">
                          Click to select video from laptop or Drag & Drop
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Supports MP4, WEBM, MOV, MKV, AVI files
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-black text-xs shadow-sm">
                              🎬
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-black text-slate-900 truncate">{newNote.fileName}</p>
                              <p className="text-[10px] font-bold text-slate-500">Size: {newNote.fileSize} • Duration: {newNote.duration}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreviewUrl(null);
                              setNewNote(prev => ({ ...prev, fileUrl: '', fileName: '', fileSize: '' }));
                            }}
                            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Change</span>
                          </button>
                        </div>

                        {videoPreviewUrl && (
                          <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-40 border border-orange-200">
                            <video src={videoPreviewUrl} controls className="w-full h-full object-contain"></video>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={noteSourceType === 'url'}
                      placeholder="Paste Google Drive, YouTube, Loom, Vimeo or .mp4 link..."
                      value={newNote.link}
                      onChange={(e) => setNewNote({ ...newNote, link: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      💡 Supports Google Drive ("Anyone with link"), YouTube, Loom, Vimeo, or direct MP4 files.
                    </p>
                  </div>
                )}
              </div>

              {/* Optional PDF Notes File Upload from Laptop */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Attach PDF Notes / Reference Code <span className="text-slate-400 font-semibold normal-case">(Optional)</span>
                </label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    onChange={(e) => setNewNote({ ...newNote, pdfNotesName: e.target.files?.[0]?.name || '' })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full px-4 py-2.5 rounded-xl border-2 border-dashed ${newNote.pdfNotesName ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50 group-hover:border-orange-300 group-hover:bg-orange-50/30'} transition-all flex items-center justify-center space-x-2`}>
                    <Upload className={`w-4 h-4 ${newNote.pdfNotesName ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-400'}`} />
                    <span className={`text-xs font-bold ${newNote.pdfNotesName ? 'text-orange-700' : 'text-slate-500 group-hover:text-orange-600'}`}>
                      {newNote.pdfNotesName ? newNote.pdfNotesName : 'Upload PDF notes or source code zip from laptop'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 text-sm font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4 stroke-[3]" />
                  <span>Publish Recorded Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal Player for Mentor Preview */}
      {playingMentorVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 rounded-2xl max-w-4xl w-full p-2 relative shadow-2xl border border-slate-800">
            <button onClick={() => setPlayingMentorVideo(null)} className="absolute -top-4 -right-4 text-white text-lg z-50 bg-rose-600 hover:bg-rose-700 rounded-full w-10 h-10 shadow-xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-slate-900">
              ✕
            </button>
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {playingMentorVideo.match(/\.(mp4|webm|ogg|mov|mkv|avi)$/i) || playingMentorVideo.includes('w3schools.com') || playingMentorVideo.startsWith('blob:') || playingMentorVideo.startsWith('data:') ? (
                <video src={playingMentorVideo} controls autoPlay className="w-full h-full object-contain"></video>
              ) : playingMentorVideo.includes('youtube.com') || playingMentorVideo.includes('youtu.be') ? (
                <iframe 
                  src={playingMentorVideo.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : playingMentorVideo.includes('drive.google.com') ? (
                 <iframe 
                  src={playingMentorVideo.replace(/\/view.*/, '/preview')} 
                  className="w-full h-full" 
                  allow="autoplay; encrypted-media" 
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe 
                  src={playingMentorVideo} 
                  className="w-full h-full bg-white" 
                  allow="autoplay; encrypted-media" 
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Report Preview Modal */}
      <AttendanceReportPreviewModal
        report={previewReport}
        onClose={() => setPreviewReport(null)}
      />

      {/* Real-time Student Attendance Proof Modal */}
      <StudentAttendanceProofModal
        isOpen={!!proofStudent}
        onClose={() => setProofStudent(null)}
        student={proofStudent}
        attendanceReports={attendanceReports}
      />

    </div>
  );
};
