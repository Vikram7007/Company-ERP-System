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
  Play
} from 'lucide-react';
import { INITIAL_LIVE_CLASSES, INITIAL_ASSIGNMENTS, INITIAL_LECTURES } from '../../data/mockData';
import { Student, Assignment, StudentApplication } from '../../types';
import { useData } from '../../context/DataContext';
import { PdfResumeModal } from '../common/PdfResumeModal';
import { RecordPaymentModal } from '../common/RecordPaymentModal';
import { AttendanceReportPreviewModal } from '../common/AttendanceReportPreviewModal';
import { generateAttendancePDF } from '../../utils/pdfGenerator';

export const MentorDashboard: React.FC = () => {
  const { students, applications, updateApplicationStatus, assignments, addAssignment, submissions, attendanceReports, saveAttendanceReport, liveClasses, recordedLectures, addLiveClass, addRecordedLecture, endLiveClass } = useData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'applications' | 'assignments' | 'materials'>('attendance');
  const [attendanceTab, setAttendanceTab] = useState<'take' | 'view'>('take');
  const [reportTimeFilter, setReportTimeFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly'>('All');
  const [exactDateFilter, setExactDateFilter] = useState('');
  const [expandedAsg, setExpandedAsg] = useState<string | null>(null);
  
  // Modals
  const [previewReport, setPreviewReport] = useState<any>(null);
  
  // Search & Filters for Students Directory
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('All');

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

  // New Live Class State
  const [newLiveClass, setNewLiveClass] = useState({ title: '', domain: 'MERN Stack Development', batch: 'Batch W-2026-A', date: '', time: '', durationMinutes: 60, meetingPlatform: 'Zoom' as const, meetingUrl: '' });

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const handleMarkAttendance = (id: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const records: any[] = students.map(std => ({
      id: `rec-${std.id}`,
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
      batch: 'Batch W-2026-A',
      mentorName: 'Dr. Rajesh Verma',
      totalStudents: students.length,
      presentCount,
      absentCount,
      lateCount,
      records
    });

    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
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

  const handleScheduleLiveClass = (e: React.FormEvent) => {
    e.preventDefault();
    addLiveClass({
      ...newLiveClass,
      mentorName: 'Dr. Rajesh Verma'
    });
    setNewLiveClass({ title: '', domain: 'MERN Stack Development', batch: 'Batch W-2026-A', date: '', time: '', durationMinutes: 60, meetingPlatform: 'Zoom', meetingUrl: '' });
    setShowScheduleModal(false);
  };

  const filteredApps = applications.filter(a => 
    a.applicantName.toLowerCase().includes(appSearch.toLowerCase()) || 
    a.domain.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.college.toLowerCase().includes(appSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase());
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
          <h2 className="text-2xl sm:text-3xl font-black">Dr. Rajesh Verma • Mentor Panel</h2>
          <p className="text-xs text-orange-950/90 mt-1 font-medium">Assigned Domains: MERN Stack Development & Full Stack Java</p>
        </div>

        <div className="flex items-center space-x-3 bg-white/25 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/40 text-xs font-semibold shadow-sm">
          <div>
            <div className="text-white font-black text-sm">Batch W-2026-A</div>
            <div className="text-orange-950/90 text-[10px] font-bold">{students.length} Active Students</div>
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Batch W-2026-A Live Attendance</h3>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => setAttendanceTab('take')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${attendanceTab === 'take' ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  Take Attendance
                </button>
                <button
                  onClick={() => setAttendanceTab('view')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${attendanceTab === 'view' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  View Reports
                </button>
              </div>
            </div>
            {attendanceTab === 'take' && (
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Attendance Report</span>
              </button>
            )}
          </div>

          {attendanceSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Attendance report recorded successfully! Student percentages updated.</span>
            </div>
          )}

          {attendanceTab === 'take' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              {students.map((std) => {
                const currentStatus = attendanceMap[std.id] || 'Present';
                const fee = std.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
                return (
                  <div key={std.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-orange-200 transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-xs">{std.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : fee.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Fee: {fee.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{std.email} • {std.college} • {std.domain}</p>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {['Present', 'Absent', 'Late'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleMarkAttendance(std.id, status as any)}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === status
                              ? status === 'Present' ? 'bg-emerald-600 text-white shadow-md' : status === 'Absent' ? 'bg-rose-500 text-white shadow-md' : 'bg-amber-500 text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {attendanceTab === 'view' && (
            <div className="space-y-4 print:space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 print:hidden">
                {/* Exact Date Picker */}
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="date"
                    value={exactDateFilter}
                    onChange={(e) => {
                      setExactDateFilter(e.target.value);
                      if (e.target.value) setReportTimeFilter('All');
                    }}
                    className="pl-9 pr-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                  />
                  {exactDateFilter && (
                    <button 
                      onClick={() => setExactDateFilter('')}
                      className="ml-2 px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
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
                    if (e.target.value !== 'All') setExactDateFilter('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="All">All Range</option>
                  <option value="Daily">Today (Daily)</option>
                  <option value="Weekly">Last 7 Days (Weekly)</option>
                  <option value="Monthly">Last 30 Days (Monthly)</option>
                </select>
              </div>

              {attendanceReports.filter(r => {
                if (exactDateFilter) return r.date === exactDateFilter;
                if (reportTimeFilter === 'All') return true;
                const rDate = new Date(r.date).getTime();
                const now = new Date().getTime();
                if (reportTimeFilter === 'Daily') return r.date === new Date().toISOString().split('T')[0];
                if (reportTimeFilter === 'Weekly') return (now - rDate) <= 7 * 24 * 60 * 60 * 1000;
                if (reportTimeFilter === 'Monthly') return (now - rDate) <= 30 * 24 * 60 * 60 * 1000;
                return true;
              }).length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                  <FileTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600">No attendance reports generated yet.</p>
                </div>
              ) : (
                attendanceReports
                  .filter(r => {
                    if (exactDateFilter) return r.date === exactDateFilter;
                    if (reportTimeFilter === 'All') return true;
                    const rDate = new Date(r.date).getTime();
                    const now = new Date().getTime();
                    if (reportTimeFilter === 'Daily') return r.date === new Date().toISOString().split('T')[0];
                    if (reportTimeFilter === 'Weekly') return (now - rDate) <= 7 * 24 * 60 * 60 * 1000;
                    if (reportTimeFilter === 'Monthly') return (now - rDate) <= 30 * 24 * 60 * 60 * 1000;
                    return true;
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(report => (
                  <div key={report.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 print:shadow-none print:border-none print:p-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-slate-900">{new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                        <p className="text-[11px] text-slate-500 font-bold">{report.batch} • {report.totalStudents} Total Interns</p>
                      </div>
                      <button 
                        onClick={() => setPreviewReport(report)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold rounded-lg flex items-center space-x-1.5 transition-colors print:hidden"
                      >
                        <FileTextIcon className="w-3.5 h-3.5" />
                        <span>Preview & Download</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Present</p>
                        <p className="text-2xl font-black text-emerald-700">{report.presentCount}</p>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                        <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Absent</p>
                        <p className="text-2xl font-black text-rose-700">{report.absentCount}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Late</p>
                        <p className="text-2xl font-black text-amber-700">{report.lateCount}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENTS DIRECTORY & FINANCIAL FEE RECORDS FOR MENTORS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden space-y-0">
          
          {/* Top Decorative Banner Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"></div>

          {/* Header & Controls Section */}
          <div className="p-6 pb-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Registered Students Directory & Company Fee Records</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                  {filteredStudents.length} Active Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Track total course fees, payments made, pending balances and manage records in real time</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
                {studentSearch && (
                  <button 
                    onClick={() => setStudentSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Fee Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value)}
                  className="py-2.5 pl-3 pr-8 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white font-extrabold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="All">All Fee Status</option>
                  <option value="Paid">✅ Fully Paid</option>
                  <option value="Partial">⚠️ Partial Dues</option>
                  <option value="Unpaid">🔴 Unpaid</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Batch Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="py-2.5 pl-3 pr-8 text-xs rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white font-extrabold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="All">All Batches</option>
                  <option value="Batch W-2026-A">Batch W-2026-A</option>
                  <option value="Batch W-2026-B">Batch W-2026-B</option>
                  <option value="Batch W-2026-C">Batch W-2026-C</option>
                </select>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
              </div>
            </div>
          </div>

          {/* Directory & Financial Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 uppercase font-extrabold text-[11px] tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-4">Student Info</th>
                  <th className="py-3.5 px-4">Domain & Specialization</th>
                  <th className="py-3.5 px-4">Batch & College</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Pending Due</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4 text-right">Fee Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-xs text-slate-500">No students match your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => {
                    const fee = std.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
                    
                    const getDomainBadgeStyle = (domainName: string) => {
                      if (domainName.includes('MERN') || domainName.includes('Full Stack')) {
                        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100';
                      } else if (domainName.includes('AI') || domainName.includes('Artificial Intelligence') || domainName.includes('Deep Learning')) {
                        return 'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100';
                      } else if (domainName.includes('DevOps') || domainName.includes('Cloud')) {
                        return 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100';
                      } else if (domainName.includes('UI/UX') || domainName.includes('Design')) {
                        return 'bg-pink-50 text-pink-700 border-pink-200/80 hover:bg-pink-100';
                      } else if (domainName.includes('Data Science')) {
                        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100';
                      }
                      return 'bg-orange-50 text-orange-700 border-orange-200/80 hover:bg-orange-100';
                    };

                    const getAvatarGradient = (name: string) => {
                      const colors = [
                        'from-orange-500 to-amber-500 text-white',
                        'from-indigo-500 to-purple-500 text-white',
                        'from-emerald-500 to-teal-500 text-white',
                        'from-rose-500 to-pink-500 text-white',
                        'from-sky-500 to-blue-500 text-white'
                      ];
                      let sum = 0;
                      for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
                      return colors[sum % colors.length];
                    };

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Student Info with Avatar */}
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-extrabold border transition-colors ${getDomainBadgeStyle(std.domain)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{std.domain}</span>
                          </span>
                        </td>

                        {/* Batch & College */}
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 font-black text-slate-900 text-xs font-mono">
                          ₹{fee.totalFee.toLocaleString('en-IN')}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-emerald-600 text-xs font-mono flex items-center space-x-1">
                            <span>₹{fee.paidAmount.toLocaleString('en-IN')}</span>
                          </span>
                        </td>

                        {/* Pending Due */}
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4">
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

                        {/* Record Payment Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentForFee(std);
                              setShowFeeModal(true);
                            }}
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[11px] font-extrabold transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center space-x-1.5 ml-auto whitespace-nowrap cursor-pointer active:scale-95 border border-emerald-500/20"
                          >
                            <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Record Payment</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary Bar */}
          <div className="bg-slate-50/90 px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-bold flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Showing <strong className="text-slate-900">{filteredStudents.length}</strong> of <strong className="text-slate-900">{students.length}</strong> students</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Total Pool:</span>
                <span className="font-black text-slate-900 font-mono">₹{filteredStudents.reduce((acc, s) => acc + (s.feeDetails?.totalFee || 15000), 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-emerald-700 font-bold">Collected:</span>
                <span className="font-black text-emerald-700 font-mono">₹{filteredStudents.reduce((acc, s) => acc + (s.feeDetails?.paidAmount || 0), 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-rose-50/90 px-3 py-1.5 rounded-xl border border-rose-200/80 shadow-2xs flex items-center space-x-2">
                <span className="text-rose-700 font-bold">Dues:</span>
                <span className="font-black text-rose-700 font-mono">₹{filteredStudents.reduce((acc, s) => acc + (s.feeDetails?.pendingAmount || 0), 0).toLocaleString('en-IN')}</span>
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

      {/* TAB 5: LECTURES & NOTES */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Study Materials & Live Classes</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your class schedules and upload resources</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Video className="w-4 h-4 stroke-[3]" />
                <span>Schedule Live Class</span>
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Upload className="w-4 h-4 stroke-[3]" />
                <span>Upload Material</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {liveClasses.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                  Scheduled Live Classes ({liveClasses.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveClasses.map((lc) => (
                    <div key={lc.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{lc.meetingPlatform}</span>
                          <span className="text-[10px] font-bold text-slate-500">{lc.batch}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{lc.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-1">🕒 {lc.date} at {lc.time} • {lc.durationMinutes} mins</p>
                      </div>
                      <button 
                        onClick={() => {
                          // Automatically save the meeting URL as the recording link
                          endLiveClass(lc.id, lc.meetingUrl);
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>End Class & Save</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Published Study Materials & Video Lectures</span>
                    <span className="text-xs bg-orange-100 text-orange-800 font-extrabold px-2.5 py-0.5 rounded-full border border-orange-200">
                      {recordedLectures.length} total
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Manage and preview all course materials published to student portals</p>
                </div>

                {/* Search Box */}
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
                    className="w-full pl-9 pr-7 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 placeholder:text-slate-400"
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
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                  <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No study materials published yet</p>
                </div>
              ) : (() => {
                const filtered = recordedLectures.filter((lec) => {
                  const matchesSearch = 
                    lec.title.toLowerCase().includes(mentorVideoSearch.toLowerCase()) || 
                    lec.domain.toLowerCase().includes(mentorVideoSearch.toLowerCase()) ||
                    `week ${lec.week}`.toLowerCase().includes(mentorVideoSearch.toLowerCase());
                  const matchesWeek = mentorVideoWeekFilter === 'All' || lec.week.toString() === mentorVideoWeekFilter;
                  return matchesSearch && matchesWeek;
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
                        onClick={() => { setMentorVideoSearch(''); setMentorVideoWeekFilter('All'); setMentorVideoPage(1); }}
                        className="mt-2 text-xs font-extrabold text-orange-600 underline"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginated.map((lec) => (
                        <div key={lec.id} className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-orange-300 flex justify-between items-center group transition-all shadow-2xs">
                          <div className="flex space-x-3 items-center">
                            <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 font-black text-xs shadow-sm">
                              Week {lec.week}
                            </div>
                            <div className="max-w-[200px] sm:max-w-[280px]">
                              <h4 className="font-bold text-slate-900 text-xs group-hover:text-orange-600 transition-colors line-clamp-1">{lec.title}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{lec.domain} • Duration: {lec.duration}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPlayingMentorVideo(lec.videoUrl)}
                            className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap active:scale-95 shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-orange-700 text-orange-700" />
                            <span>Watch</span>
                          </button>
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
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40"
                          >
                            Prev
                          </button>
                          <span className="text-xs font-bold px-2 text-slate-700">{currentPage} / {totalPages}</span>
                          <button
                            type="button"
                            onClick={() => setMentorVideoPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40"
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

      {/* SCHEDULE LIVE CLASS MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowScheduleModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Video className="w-5 h-5 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="font-black text-lg drop-shadow-md">Schedule Live Interactive Class</h3>
                  <p className="text-[11px] font-medium text-white/90 drop-shadow-sm">Host via Zoom, Google Meet, or Teams</p>
                </div>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-all backdrop-blur-md relative z-10 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleLiveClass} className="p-6 space-y-5 text-sm">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Class Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Live Q&A & Code Review Session"
                  value={newLiveClass.title}
                  onChange={(e) => setNewLiveClass({ ...newLiveClass, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={newLiveClass.date}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Time <span className="text-rose-500">*</span></label>
                  <input
                    type="time"
                    required
                    value={newLiveClass.time}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Meeting Platform <span className="text-rose-500">*</span></label>
                  <select
                    value={newLiveClass.meetingPlatform}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, meetingPlatform: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="Zoom">🔷 Zoom Meeting</option>
                    <option value="Google Meet">🔴 Google Meet</option>
                    <option value="Microsoft Teams">🟣 Microsoft Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">Live Join Link <span className="text-rose-500">*</span></label>
                  <input
                    type="url"
                    required
                    placeholder={newLiveClass.meetingPlatform === 'Zoom' ? "https://zoom.us/j/..." : "https://meet.google.com/..."}
                    value={newLiveClass.meetingUrl}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, meetingUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-5 py-2.5 text-sm font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <Video className="w-4 h-4 stroke-[3]" />
                  <span>Schedule Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

    </div>
  );
};
