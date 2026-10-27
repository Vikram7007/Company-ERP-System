import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Video, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Megaphone,
  Layers,
  BookOpen,
  Briefcase,
  UserPlus,
  DollarSign,
  Receipt,
  XCircle,
  X,
  Eye,
  Inbox,
  Mail,
  Phone,
  Download,
  CalendarCheck,
  RefreshCw,
  Trash2,
  Copy,
  Star,
  KeyRound,
  MessageSquare,
  AlertCircle,
  Check,
  Pencil,
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { INITIAL_DOMAINS, INITIAL_LIVE_CLASSES, INITIAL_CERTIFICATES, INITIAL_ANNOUNCEMENTS, ANALYTICS_GRAPH_DATA } from '../../data/mockData';
import { Student, Mentor, LiveClass, Certificate, StudentApplication } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AddMentorModal } from './AddMentorModal';
import { PdfResumeModal } from '../common/PdfResumeModal';
import { RecordPaymentModal } from '../common/RecordPaymentModal';
import { AttendanceReportPreviewModal } from '../common/AttendanceReportPreviewModal';
import { generateAttendancePDF } from '../../utils/pdfGenerator';
import { exportStudentsToExcel } from '../../utils/excelExport';
import { calculateStudentAttendanceStats, StudentMonthlyAttendanceSummary } from '../../utils/attendanceCalculator';
import { StudentAttendanceProofModal } from '../common/StudentAttendanceProofModal';

export const CeoDashboard: React.FC = () => {
  const { user } = useAuth();
  const { mentors, students, applications, addStudent, deleteStudent, updateStudent, updateApplicationStatus, attendanceReports, resetData, deleteMentor } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'students' | 'mentors' | 'applications' | 'attendance' | 'live-classes' | 'certificates'>('overview');
  const [reportDateFilter, setReportDateFilter] = useState('');
  
  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorDomainFilter, setMentorDomainFilter] = useState<string>('All');
  const [mentorToast, setMentorToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('All');
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 8;

  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All');

  // Modals
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const [selectedAppForResume, setSelectedAppForResume] = useState<StudentApplication | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Edit Student Modal
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({ name: '', email: '', phone: '', domain: '', batch: '', college: '' });
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // View Student Modal
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [showViewStudentModal, setShowViewStudentModal] = useState(false);

  // Delete Confirm
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [previewReport, setPreviewReport] = useState<any>(null);
  const [proofStudent, setProofStudent] = useState<Student | null>(null);

  // Time Filter for Analytics
  const [timeFilter, setTimeFilter] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');

  // Real-time attendance calculation from actual attendance report records
  const studentAttendanceMap = useMemo(() => {
    const map: Record<string, StudentMonthlyAttendanceSummary> = {};
    students.forEach(student => {
      map[student.id] = calculateStudentAttendanceStats(student.id, attendanceReports);
    });
    return map;
  }, [students, attendanceReports]);

  const availableBatches = Array.from(new Set([
    'Batch RK-Gurukul-DS',
    'Batch W-2026-A',
    'Batch W-2026-B',
    'Batch W-2026-C',
    ...students.map(s => s.batch).filter(Boolean)
  ]));

  // Form for new student creation
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    domain: INITIAL_DOMAINS[0].name,
    batch: 'Batch W-2026-A',
    college: '',
    totalFee: 15000,
    paidAmount: 5000
  });

  // Calculate Fee Summary Metrics across company
  const totalExpectedRevenue = students.reduce((acc, s) => acc + (s.feeDetails?.totalFee || 15000), 0);
  const totalCollectedRevenue = students.reduce((acc, s) => acc + (s.feeDetails?.paidAmount || 0), 0);
  const totalOutstandingDues = students.reduce((acc, s) => acc + (s.feeDetails?.pendingAmount || 0), 0);

  // Export handlers
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      setMentorToast('Preparing Websums Software official Excel report with company logo...');
      await exportStudentsToExcel({
        students,
        filteredStudents,
        companyName: 'Websums Software PVT.LTD',
        ceoName: 'Shriram Thorat (CEO)',
        reportTitle: 'STUDENT ENROLLMENT & EXECUTIVE FEE REPORT',
        attendanceReports
      });
      setMentorToast('Websums Software PVT.LTD Excel sheet generated successfully! 🎉');
      window.setTimeout(() => setMentorToast(null), 4000);
    } catch (error) {
      console.error('Failed to export Excel report:', error);
      setMentorToast('Failed to generate Excel report. Please try again.');
      window.setTimeout(() => setMentorToast(null), 3500);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCSV = handleExportExcel;

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      userId: `usr-${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      domain: newStudent.domain,
      batch: newStudent.batch,
      mentorName: 'Dr. Rajesh Verma',
      profileCompletion: 80,
      attendancePercentage: 100,
      assignmentsSubmitted: 0,
      totalAssignments: 8,
      averageGrade: 'N/A',
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      college: newStudent.college || 'Engineering Institute',
      totalFee: newStudent.totalFee,
      paidAmount: newStudent.paidAmount
    });
    setShowAddStudentModal(false);
    setNewStudent({ name: '', email: '', phone: '', domain: INITIAL_DOMAINS[0].name, batch: 'Batch W-2026-A', college: '', totalFee: 15000, paidAmount: 5000 });
    setMentorToast(`🎓 Student "${newStudent.name}" added successfully!`);
    window.setTimeout(() => setMentorToast(null), 4000);
  };

  // Dynamic Domain pill badge styling
  const getDomainBadgeStyle = (domainName?: string) => {
    const d = domainName || '';
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

  // Dynamic Avatar gradient based on name hash
  const getAvatarGradient = (name?: string) => {
    const colors = [
      'from-orange-500 to-amber-500 text-white',
      'from-indigo-500 to-purple-500 text-white',
      'from-emerald-500 to-teal-500 text-white',
      'from-rose-500 to-pink-500 text-white',
      'from-sky-500 to-blue-500 text-white'
    ];
    let sum = 0;
    const safeName = name || 'Student';
    for (let i = 0; i < safeName.length; i++) sum += safeName.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const filteredStudents = students.filter(s => {
    const q = (studentSearch || '').trim().toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(q);
    const emailMatch = (s.email || '').toLowerCase().includes(q);
    const domainMatch = (s.domain || '').toLowerCase().includes(q);
    const phoneMatch = (s.phone || '').toLowerCase().includes(q);
    const collegeMatch = (s.college || '').toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || emailMatch || domainMatch || phoneMatch || collegeMatch;
    const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
    const feeStatus = s.feeDetails?.status || 'Unpaid';
    const matchesFee = feeStatusFilter === 'All' || feeStatus === feeStatusFilter;
    return matchesSearch && matchesBatch && matchesFee;
  });

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const currentStudentPage = Math.min(studentPage, totalStudentPages);
  const paginatedStudents = filteredStudents.slice((currentStudentPage - 1) * studentsPerPage, currentStudentPage * studentsPerPage);

  const filteredApplications = applications.filter(a => {
    const q = (appSearch || '').trim().toLowerCase();
    const matchesSearch = !q ||
      (a.applicantName || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.domain || '').toLowerCase().includes(q);
    const matchesStatus = appStatusFilter === 'All' || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const COLORS = ['#F97316', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

  const domainPieData = [
    { name: 'MERN Stack', value: 245 },
    { name: 'AI & Deep Learning', value: 189 },
    { name: 'Data Science', value: 210 },
    { name: 'DevOps & Cloud', value: 140 },
    { name: 'UI/UX Design', value: 175 }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {mentorToast && (
        <div className="fixed top-8 left-1/2 z-70 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-3.5 text-sm font-extrabold text-emerald-950 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="font-black text-sm">{mentorToast}</p>
            <p className="text-[11px] font-medium text-emerald-700">Login credentials generated: Email as Login ID and Mobile No. as password.</p>
          </div>
        </div>
      )}
      
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#ff8b33] bg-[#FF7600] p-5 text-white shadow-[0_14px_30px_rgba(255,118,0,0.22)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[24px] border-white/10" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=85'}
                alt="Shriram Thorat profile"
                className="h-16 w-16 rounded-2xl border-2 border-white/80 object-cover shadow-lg sm:h-20 sm:w-20"
              />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#FF7600] bg-emerald-400" title="Online" />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/80">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">Executive Command Center</span>
              </div>
              <h2 className="text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[2.1rem]">
                CEO Portal
              </h2>
              <p className="mt-1 text-xs font-medium text-white/85 sm:text-sm">
                Shriram Thorat <span className="mx-1 text-white/50">•</span> Websums Software Pvt. Ltd.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button
            onClick={() => setShowAddMentorModal(true)}
            className="flex items-center gap-2 rounded-xl border border-white/45 bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-white/25 sm:text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Mentor</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 rounded-xl border border-white/45 bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-white/25 sm:text-sm active:scale-95 disabled:opacity-75 cursor-pointer"
            title="Download official Websums Software Pvt. Ltd. Excel report with company logo"
          >
            {isExportingExcel ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            )}
            <span>{isExportingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>
          
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="flex items-center gap-2 rounded-xl border border-white bg-white px-4 py-2.5 text-xs font-bold text-[#C65300] shadow-[0_8px_20px_rgba(115,42,0,0.18)] transition-all hover:bg-orange-50 sm:text-sm"
          >
            <Plus className="w-4 h-4 text-[#FF7600]" />
            <span>Add New Student</span>
          </button>
          </div>
        </div>
        <p className="relative mt-5 max-w-2xl text-xs font-medium leading-relaxed text-white/75">
          Real-time enterprise analytics, mentor load, student fee tracking and incoming applicant records.
        </p>
      </div>

      {/* CEO Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 pb-2 text-sm font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-[#FF7600] text-white border-[#FF7600] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📊</span>
          <span>Overview & Revenue</span>
        </button>
        <button
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'students'
              ? 'bg-[#FF7600] text-white border-[#FF7600] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🎓</span>
          <span>Students & Fees ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'applications'
              ? 'bg-[#FF7600] text-white border-[#FF7600] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Applications & Leads ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'attendance'
              ? 'bg-[#FF7600] text-white border-[#FF7600] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance Reports</span>
        </button>
        <button
          onClick={() => setActiveSubTab('mentors')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'mentors'
              ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>👨‍🏫</span>
          <span>Mentors ({mentors.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('live-classes')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'live-classes'
              ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📅</span>
          <span>Live Classes ({INITIAL_LIVE_CLASSES.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-4 py-2.5 rounded-full border transition-all flex items-center gap-2 ${
            activeSubTab === 'certificates'
              ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📜</span>
          <span>Issued Certificates</span>
        </button>
      </div>

      {/* SUB TAB 1: OVERVIEW & ANALYTICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metric Cards including Financial Records */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Active Interns</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{students.length}</h3>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center mt-0.5">
                  <TrendingUp className="w-3 h-3 mr-1" /> +14% from last month
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Revenue Collected</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{totalCollectedRevenue.toLocaleString('en-IN')}</h3>
                <span className="text-[11px] font-bold text-slate-500">Out of ₹{totalExpectedRevenue.toLocaleString('en-IN')} total</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Pending Student Dues</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">₹{totalOutstandingDues.toLocaleString('en-IN')}</h3>
                <span className="text-[11px] font-bold text-rose-500">Manual Fee Records</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Applicant Leads</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{applications.length}</h3>
                <span className="text-[11px] font-bold text-amber-600">
                  {applications.filter(a => a.status === 'Pending').length} Action Required
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Inbox className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Internship Enrollment & Revenue Growth</h3>
                  <p className="text-xs text-slate-500">Monthly student onboarding vs revenue (Lakhs INR)</p>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-extrabold">2026 YTD</span>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_GRAPH_DATA}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900">Top Domain Share</h3>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={domainPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                      {domainPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs">
                {domainPieData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB 2: STUDENTS DIRECTORY & FINANCIAL FEE RECORDS */}
      {activeSubTab === 'students' && (
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
                      {availableBatches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                </div>

                {/* Row 2: Sync Data & Export Excel Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetData();
                      alert('Data synced! Batch RK-Gurukul-DS and all updated student records are now live.');
                    }}
                    title="Click to sync new batches and refresh student records"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-orange-500 bg-white hover:bg-orange-50 text-orange-600 font-bold text-[11px] transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                    <span>Sync Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={isExportingExcel}
                    title="Export styled Excel spreadsheet (.xlsx) with Websums Software logo"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-[11px] transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isExportingExcel ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    <span>{isExportingExcel ? 'Exporting...' : 'Export Excel'}</span>
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
                  <th className="py-2.5 px-3">Attendance</th>
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
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-bold text-xs text-slate-500">No students match your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((std) => {
                    const fee = std.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
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
                                <div className="flex items-center space-x-1.5 hover:text-orange-600 transition-colors">
                                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <a href={`mailto:${std.email}`} className="truncate max-w-[160px] hover:text-orange-600 hover:underline" title={`Send email to ${std.email}`}>{std.email}</a>
                                </div>
                                <div className="flex items-center space-x-1.5 hover:text-slate-700 transition-colors">
                                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <a href={`tel:${std.phone}`} className="whitespace-nowrap hover:text-orange-600">{std.phone}</a>
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

                        {/* Attendance - Real-time calculated with Proof Click */}
                        <td className="py-2.5 px-3">
                          {(() => {
                            const att = studentAttendanceMap[std.id];
                            const pct = att?.totalSessions > 0 ? att.attendancePercentage : (std.attendancePercentage ?? 0);
                            const sessions = att?.totalSessions || 0;
                            const present = att ? (att.presentCount + att.lateCount) : 0;
                            const isGood = pct >= 75;
                            const isWarning = pct >= 65 && pct < 75;
                            return (
                              <button
                                type="button"
                                onClick={() => setProofStudent(std)}
                                title="Click to view real-time Attendance Proof & Audit Records"
                                className="flex flex-col items-center gap-1 group/att hover:scale-105 transition-transform cursor-pointer mx-auto"
                              >
                                <div className="relative w-11 h-11">
                                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                    <circle
                                      cx="18" cy="18" r="15.5" fill="none"
                                      stroke={isGood ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444'}
                                      strokeWidth="3"
                                      strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${
                                    isGood ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-700'
                                  }`}>
                                    {pct}%
                                  </span>
                                </div>
                                {sessions > 0 && (
                                  <span className="text-[9px] font-bold text-slate-400 group-hover/att:text-orange-600 transition-colors">
                                    {present}/{sessions}
                                  </span>
                                )}
                                <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                  isGood ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' :
                                  isWarning ? 'bg-amber-50 text-amber-600 border border-amber-200/60' :
                                  'bg-rose-50 text-rose-600 border border-rose-200/60'
                                }`}>
                                  {isGood ? 'Eligible' : isWarning ? 'Warning' : 'Critical'}
                                </span>
                              </button>
                            );
                          })()}
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

                        {/* Actions: View, Edit, Payment, Proof, Delete */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            {/* View */}
                            <button
                              onClick={() => { setSelectedStudentForView(std); setShowViewStudentModal(true); }}
                              title="View Details"
                              className="w-8 h-8 rounded-lg bg-[#eff6ff] border border-[#dbeafe] text-[#0066cc] hover:bg-[#dbeafe] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Eye className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => {
                                setSelectedStudentForEdit(std);
                                setEditStudentForm({ name: std.name || '', email: std.email || '', phone: std.phone || '', domain: std.domain || '', batch: std.batch || '', college: std.college || '' });
                                setShowEditStudentModal(true);
                              }}
                              title="Edit Info"
                              className="w-8 h-8 rounded-lg bg-[#eff6ff] border border-[#dbeafe] text-[#0066cc] hover:bg-[#dbeafe] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Pencil className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            {/* Payment */}
                            <button
                              onClick={() => { setSelectedStudentForFee(std); setShowFeeModal(true); }}
                              title="Record Payment"
                              className="w-8 h-8 rounded-lg bg-[#eff6ff] border border-[#dbeafe] text-[#0066cc] hover:bg-[#dbeafe] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <DollarSign className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            {/* Attendance Proof */}
                            <button
                              onClick={() => setProofStudent(std)}
                              title="View Attendance Audit Proof"
                              className="w-8 h-8 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] hover:bg-[#d1fae5] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setStudentToDelete(std)}
                              title="Delete Student"
                              className="w-8 h-8 rounded-lg bg-[#fff1f2] border border-[#ffe4e6] text-[#ef4444] hover:bg-[#ffe4e6] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2]" />
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
              <span>Showing <strong className="text-slate-900">{Math.min((currentStudentPage - 1) * studentsPerPage + 1, filteredStudents.length)}</strong> - <strong className="text-slate-900">{Math.min(currentStudentPage * studentsPerPage, filteredStudents.length)}</strong> of <strong className="text-slate-900">{filteredStudents.length}</strong> students</span>
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

      {/* SUB TAB 3: APPLICATIONS & LEADS (NEW STUDENT APPLY RECORD WITH PDF RESUME) */}
      {activeSubTab === 'applications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Internship Applications & PDF Resumes</h3>
              <p className="text-xs text-slate-500">Review incoming applications, inspect PDF resumes, and approve or reject candidates</p>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by candidate name or domain..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-orange-500"
                />
              </div>
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Accepted">Accepted & Enrolled</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{app.applicantName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                  <span className="text-[10px] font-bold text-slate-400">{app.appliedDate}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                  <div><span className="font-bold text-slate-700">Email:</span> {app.email}</div>
                  <div><span className="font-bold text-slate-700">Phone:</span> {app.phone}</div>
                  <div><span className="font-bold text-slate-700">College:</span> {app.college}</div>
                </div>

                {/* PDF Resume preview trigger button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setSelectedAppForResume(app);
                      setShowResumeModal(true);
                    }}
                    className="px-3.5 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>View PDF Resume ({app.resumeFileName})</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {app.status !== 'Accepted' && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'Accepted')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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

      {/* SUB TAB 4: MENTORS DIRECTORY */}
      {activeSubTab === 'mentors' && (() => {
        const filteredMentors = mentors.filter(mnt => {
          const q = (mentorSearch || '').trim().toLowerCase();
          const matchesSearch = !q ||
            (mnt.name || '').toLowerCase().includes(q) ||
            (mnt.email || '').toLowerCase().includes(q) ||
            (mnt.phone || '').toLowerCase().includes(q) ||
            (mnt.assignedDomains || []).some(d => (d || '').toLowerCase().includes(q));
          const matchesDomain = mentorDomainFilter === 'All' || (mnt.assignedDomains || []).includes(mentorDomainFilter);
          return matchesSearch && matchesDomain;
        });

        const totalInternsGuided = mentors.reduce((acc, m) => acc + (m.totalStudents || 0), 0) || students.length;
        const coveredDomainsCount = new Set(mentors.flatMap(m => m.assignedDomains || [])).size || INITIAL_DOMAINS.length;
        const avgFacultyRating = mentors.length 
          ? (mentors.reduce((acc, m) => acc + (m.rating || 5.0), 0) / mentors.length).toFixed(1) 
          : '5.0';

        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Senior Mentors</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{mentors.length}</h3>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center mt-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active Faculty
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Users className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Interns Under Guidance</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalInternsGuided}</h3>
                  <span className="text-[11px] font-bold text-orange-600 flex items-center mt-0.5">
                    <GraduationCap className="w-3 h-3 mr-1" /> Across all batches
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Covered Domains</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{coveredDomainsCount}</h3>
                  <span className="text-[11px] font-bold text-indigo-600 flex items-center mt-0.5">
                    <Layers className="w-3 h-3 mr-1" /> Tech Stacks
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Avg Faculty Rating</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span>{avgFacultyRating}</span>
                    <span className="text-amber-500 text-lg">★</span>
                  </h3>
                  <span className="text-[11px] font-bold text-amber-600 flex items-center mt-0.5">
                    <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" /> High Satisfaction
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Search, Filter & Add Button Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search mentors by name, email, phone, or domain..."
                    value={mentorSearch}
                    onChange={(e) => setMentorSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  {mentorSearch && (
                    <button 
                      onClick={() => setMentorSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={mentorDomainFilter}
                    onChange={(e) => setMentorDomainFilter(e.target.value)}
                    className="py-2.5 pl-3.5 pr-8 text-xs rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-all appearance-none"
                  >
                    <option value="All">All Domains</option>
                    {INITIAL_DOMAINS.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => setShowAddMentorModal(true)}
                className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add New Mentor</span>
              </button>
            </div>

            {/* Cards Grid */}
            {filteredMentors.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
                  <Users className="w-8 h-8 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">No Mentors Found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {mentorSearch ? 'No mentor records match your search criteria.' : 'No faculty mentors onboarded yet.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMentorModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard First Mentor</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMentors.map((mnt) => {
                  const cleanPhone = (mnt.phone || '').replace(/\D/g, '');

                  return (
                    <div 
                      key={mnt.id} 
                      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-orange-300 p-6 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden"
                    >
                      {/* Top Glow bar on hover */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-4">
                        {/* Top Header Row with Avatar, Status, Rating & Delete */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3.5">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(mnt.name)} flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/15 flex-shrink-0 border-2 border-white`}>
                              {(mnt.name || 'M').charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-base tracking-tight group-hover:text-orange-600 transition-colors">
                                {mnt.name}
                              </h4>
                              <p className="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-700 font-bold">Active Mentor</span>
                                <span className="text-slate-300">•</span>
                                <span>Websums Faculty</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] font-black flex items-center gap-1 shadow-2xs">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{mnt.rating || 5.0}</span>
                            </div>

                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to remove mentor "${mnt.name}"? This will delete their account credentials.`)) {
                                  await deleteMentor(mnt.id);
                                  setMentorToast(`Mentor "${mnt.name}" deleted successfully.`);
                                  window.setTimeout(() => setMentorToast(null), 3500);
                                }
                              }}
                              title="Delete Mentor"
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600 hover:text-slate-900 transition-colors">
                            <div className="flex items-center space-x-2 truncate pr-2">
                              <Mail className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <a href={`mailto:${mnt.email}`} className="truncate hover:text-orange-600 font-medium">
                                {mnt.email}
                              </a>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(mnt.email);
                                setCopiedField(`email-${mnt.id}`);
                                window.setTimeout(() => setCopiedField(null), 2000);
                              }}
                              title="Copy email"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              {copiedField === `email-${mnt.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-slate-600 hover:text-slate-900 transition-colors">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <a href={`tel:${mnt.phone}`} className="hover:text-orange-600 font-medium font-mono text-[11px]">
                                {mnt.phone || 'N/A'}
                              </a>
                            </div>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Prominent Login Credentials Box */}
                        <div className="p-3.5 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/90 border border-amber-200/80 rounded-2xl space-y-2 text-xs shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                              <span>Portal Credentials</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Email</span>
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
                            <div className="bg-white/90 px-2.5 py-1.5 rounded-xl border border-amber-100/90 flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">Login ID:</span>
                              <span className="font-bold text-slate-900 truncate max-w-[170px]">{mnt.email}</span>
                            </div>

                            <div className="bg-white/90 px-2.5 py-1.5 rounded-xl border border-amber-100/90 flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">Initial Password:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold font-mono text-slate-900">{mnt.phone || 'Mobile No.'}</span>
                                <button
                                  onClick={() => {
                                    if (mnt.phone) navigator.clipboard.writeText(mnt.phone);
                                    setCopiedField(`pass-${mnt.id}`);
                                    window.setTimeout(() => setCopiedField(null), 2000);
                                  }}
                                  title="Copy password"
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {copiedField === `pass-${mnt.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            💡 Mentor can sign in with mobile number and reset password via email OTP anytime.
                          </p>
                        </div>

                        {/* Specialization Domains */}
                        <div className="space-y-1.5 text-xs">
                          <span className="text-slate-500 font-bold text-[11px]">Specialization Domains:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(mnt.assignedDomains || []).map((dom, i) => (
                              <span 
                                key={i} 
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all ${getDomainBadgeStyle(dom)}`}
                              >
                                {dom}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Assigned Batches */}
                        {mnt.activeBatches && mnt.activeBatches.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400 text-[10px] font-semibold">Batches:</span>
                            <div className="flex flex-wrap gap-1">
                              {mnt.activeBatches.map((b, bi) => (
                                <span key={bi} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Interns Counter & Quick Actions */}
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-xs">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span>{mnt.totalStudents || 0} Interns Guided</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${mnt.email}`}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-[11px] font-bold border border-orange-200/80 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* SUB TAB 5: LIVE CLASSES */}
      {activeSubTab === 'live-classes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Scheduled Enterprise Live Lectures</h3>
            <button className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl">
              Schedule New Live Class
            </button>
          </div>
          <div className="space-y-3">
            {INITIAL_LIVE_CLASSES.map((lc) => (
              <div key={lc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] uppercase">
                    {lc.meetingPlatform}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{lc.title}</h4>
                  <p className="text-xs text-slate-600">{lc.domain} • Mentor: {lc.mentorName}</p>
                </div>
                <a
                  href={lc.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl"
                >
                  Join Meeting Link
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 6: CERTIFICATES */}
      {activeSubTab === 'certificates' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900">Issued Verification Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_CERTIFICATES.map((cert) => (
              <div key={cert.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold shadow-inner">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{cert.id}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{cert.studentName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cert.domain} • Grade: {cert.grade}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">Issued: {cert.issueDate}</span>
                  <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-orange-600 hover:text-orange-700">View Certificate</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB: ATTENDANCE REPORTS */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Daily Attendance Reports</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Company-wide view of intern attendance submitted by mentors</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Calendar className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="date"
                  value={reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
              {reportDateFilter && (
                <button 
                  onClick={() => setReportDateFilter('')}
                  className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 print:space-y-6">
            {attendanceReports.filter(r => !reportDateFilter || r.date === reportDateFilter).length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-600">No reports found</h4>
                <p className="text-xs text-slate-400 mt-1">No attendance records match the selected date filter.</p>
              </div>
            ) : (
              attendanceReports
                .filter(r => !reportDateFilter || r.date === reportDateFilter)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(report => (
                <div key={report.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 print:shadow-none print:border-none print:p-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-900">{new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{report.batch} • Mentor: {report.mentorName}</p>
                    </div>
                    <button 
                      onClick={() => setPreviewReport(report)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl border border-orange-200/60 flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 print:hidden"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Preview & Download</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total</p>
                      <p className="text-2xl font-black text-slate-700">{report.totalStudents}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center shadow-inner">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Present</p>
                      <p className="text-2xl font-black text-emerald-700">{report.presentCount}</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center shadow-inner">
                      <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Absent</p>
                      <p className="text-2xl font-black text-rose-700">{report.absentCount}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center shadow-inner">
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Late</p>
                      <p className="text-2xl font-black text-amber-700">{report.lateCount}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <AddMentorModal
        isOpen={showAddMentorModal}
        onClose={() => setShowAddMentorModal(false)}
        onMentorAdded={(name) => {
          setMentorToast(`New mentor added successfully! ${name} is now onboarded.`);
          window.setTimeout(() => setMentorToast(null), 4000);
        }}
      />

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

      <RecordPaymentModal
        isOpen={showFeeModal}
        onClose={() => setShowFeeModal(false)}
        student={selectedStudentForFee}
      />

      {/* Edit Student Modal */}
      {showEditStudentModal && selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200 space-y-5">
            {/* Ambient Background Gradient Accents */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-sky-400/10 via-indigo-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF7600] to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 ring-4 ring-orange-50 shrink-0">
                  <Pencil className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Student Info</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200/80">
                      Websums Portal
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>Update record for</span>
                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                      {selectedStudentForEdit.name}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditStudentModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Context Card */}
            <div className="relative p-3 bg-gradient-to-r from-slate-50 via-orange-50/25 to-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  {selectedStudentForEdit.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{selectedStudentForEdit.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">ID: {selectedStudentForEdit.userId || selectedStudentForEdit.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400">Fee Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                  selectedStudentForEdit.feeDetails?.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedStudentForEdit.feeDetails?.status === 'Partial'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedStudentForEdit.feeDetails?.status || 'Unpaid'}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudent(selectedStudentForEdit.id, {
                  name: editStudentForm.name,
                  email: editStudentForm.email,
                  phone: editStudentForm.phone,
                  domain: editStudentForm.domain,
                  batch: editStudentForm.batch,
                  college: editStudentForm.college
                });
                setShowEditStudentModal(false);
                setMentorToast(`Student "${editStudentForm.name}" updated successfully!`);
                window.setTimeout(() => setMentorToast(null), 3500);
              }}
              className="relative space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>Full Name</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Student Full Name"
                      value={editStudentForm.name}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={editStudentForm.email}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>Phone Number</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={editStudentForm.phone}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-500" />
                    <span>Domain Track</span>
                  </label>
                  <div className="relative">
                    <select
                      value={editStudentForm.domain}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, domain: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      {INITIAL_DOMAINS.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Batch Code</span>
                  </label>
                  <div className="relative">
                    <select
                      value={editStudentForm.batch}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, batch: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      {availableBatches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* College / Institution */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                    <span>College / Institution</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="College or University Name"
                      value={editStudentForm.college}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, college: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditStudentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF7600] via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Student Details Modal ────────────────────────────── */}
      {showViewStudentModal && selectedStudentForView && (() => {
        const sv = selectedStudentForView;
        const fee = sv.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid', transactions: [] };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(sv.name)} flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/40`}>
                      {(sv.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{sv.name}</h3>
                      <p className="text-xs font-semibold text-white/80 mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        Active Intern
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowViewStudentModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                    <a href={`mailto:${sv.email}`} className="text-xs font-semibold text-orange-600 hover:underline break-all">{sv.email}</a>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                    <a href={`tel:${sv.phone}`} className="text-xs font-semibold text-slate-800">{sv.phone || 'N/A'}</a>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${getDomainBadgeStyle(sv.domain)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />{sv.domain}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Batch</p>
                    <span className="text-xs font-bold text-slate-800">{sv.batch}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> College</p>
                    <span className="text-xs font-semibold text-slate-800">{sv.college || 'N/A'}</span>
                  </div>
                </div>

                {/* Attendance Summary */}
                {(() => {
                  const att = studentAttendanceMap[sv.id];
                  const pct = att?.totalSessions > 0 ? att.attendancePercentage : (sv.attendancePercentage ?? 0);
                  const sessions = att?.totalSessions || 0;
                  const present = att?.presentCount || 0;
                  const late = att?.lateCount || 0;
                  const absent = att?.absentCount || 0;
                  const isGood = pct >= 75;
                  const isWarning = pct >= 65 && pct < 75;
                  return (
                    <div className={`rounded-2xl p-4 border ${
                      isGood ? 'bg-gradient-to-br from-emerald-50 to-teal-50/30 border-emerald-100/80' :
                      isWarning ? 'bg-gradient-to-br from-amber-50 to-yellow-50/30 border-amber-100/80' :
                      'bg-gradient-to-br from-rose-50 to-pink-50/30 border-rose-100/80'
                    }`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                        isGood ? 'text-emerald-900' : isWarning ? 'text-amber-900' : 'text-rose-900'
                      }`}>
                        <CalendarCheck className={`w-3.5 h-3.5 ${isGood ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-rose-600'}`} />
                        Monthly Attendance Report
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white rounded-xl p-2 border border-slate-100">
                          <p className="text-[10px] text-slate-500 font-bold">Sessions</p>
                          <p className="text-sm font-black text-slate-800">{sessions}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                          <p className="text-[10px] text-emerald-600 font-bold">Present</p>
                          <p className="text-sm font-black text-emerald-700">{present}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-2 border border-amber-100">
                          <p className="text-[10px] text-amber-600 font-bold">Late</p>
                          <p className="text-sm font-black text-amber-700">{late}</p>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-2 border border-rose-100">
                          <p className="text-[10px] text-rose-600 font-bold">Absent</p>
                          <p className="text-sm font-black text-rose-700">{absent}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative w-10 h-10">
                            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                              <circle cx="18" cy="18" r="14" fill="none"
                                stroke={isGood ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444'}
                                strokeWidth="3" strokeDasharray={`${(pct / 100) * 88} 88`} strokeLinecap="round"
                              />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${
                              isGood ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-700'
                            }`}>{pct}%</span>
                          </div>
                          <div>
                            <p className={`text-xs font-black ${
                              isGood ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-700'
                            }`}>{pct}% Attendance</p>
                            <p className="text-[10px] text-slate-500 font-medium">{att?.complianceMessage || 'No sessions recorded yet'}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          isGood ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          isWarning ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                          {isGood ? '✅ Eligible' : isWarning ? '⚠️ Warning' : '🔴 Critical'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Fee Summary */}
                <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-2xl p-4 border border-orange-100/80">
                  <p className="text-[10px] font-black text-orange-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-orange-600" /> Fee Summary
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold">Total</p>
                      <p className="text-sm font-black text-slate-900">₹{fee.totalFee.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                      <p className="text-[10px] text-emerald-600 font-bold">Paid</p>
                      <p className="text-sm font-black text-emerald-700">₹{fee.paidAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`${fee.pendingAmount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} rounded-xl p-2.5 border`}>
                      <p className={`text-[10px] font-bold ${fee.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Due</p>
                      <p className={`text-sm font-black ${fee.pendingAmount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>₹{fee.pendingAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setShowViewStudentModal(false);
                      setProofStudent(sv);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" /> View Full Attendance Proof & Official Audit Log
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowViewStudentModal(false); setSelectedStudentForEdit(sv); setEditStudentForm({ name: sv.name || '', email: sv.email || '', phone: sv.phone || '', domain: sv.domain || '', batch: sv.batch || '', college: sv.college || '' }); setShowEditStudentModal(true); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Info
                    </button>
                    <button
                      onClick={() => { setShowViewStudentModal(false); setSelectedStudentForFee(sv); setShowFeeModal(true); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Record Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Confirm Dialog ─────────────────────────────────── */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Delete Student?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to remove <span className="font-bold text-rose-600">{studentToDelete.name}</span> from the records? This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  setMentorToast(`Student "${studentToDelete.name}" deleted.`);
                  window.setTimeout(() => setMentorToast(null), 3000);
                  setStudentToDelete(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-black text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add New Student Modal (Redesigned) ───────────────────── */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Add New Student</h3>
                    <p className="text-xs text-white/75 font-medium">Fill all details to enroll a student</p>
                  </div>
                </div>
                <button onClick={() => setShowAddStudentModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text" required
                    placeholder="e.g. Rahul Sharma"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email" required
                      placeholder="student@email.com"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel" required
                      placeholder="+91 98765 43210"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Domain */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Specialization Domain *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={newStudent.domain}
                    onChange={(e) => setNewStudent({ ...newStudent, domain: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all appearance-none bg-white"
                  >
                    {INITIAL_DOMAINS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Row 4: Batch + College */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Batch *</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={newStudent.batch}
                      onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all appearance-none bg-white"
                    >
                      {availableBatches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">College / Institute *</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text" required
                      placeholder="College Name"
                      value={newStudent.college}
                      onChange={(e) => setNewStudent({ ...newStudent, college: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-semibold text-sm text-slate-800 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Fee Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-4 border border-emerald-100 space-y-3">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Fee Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-emerald-700 font-bold mb-1">Total Fee (₹)</label>
                    <input
                      type="number" min={0}
                      value={newStudent.totalFee}
                      onChange={(e) => setNewStudent({ ...newStudent, totalFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 font-black text-sm text-emerald-900 bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-emerald-700 font-bold mb-1">Initial Paid (₹)</label>
                    <input
                      type="number" min={0}
                      value={newStudent.paidAmount}
                      onChange={(e) => setNewStudent({ ...newStudent, paidAmount: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-emerald-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 font-black text-sm text-emerald-900 bg-white transition-all"
                    />
                  </div>
                </div>
                {/* Live fee preview */}
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="flex-1 text-center">
                    <span className="text-slate-500">Due: </span>
                    <span className="font-black text-rose-600">₹{Math.max(0, newStudent.totalFee - newStudent.paidAmount).toLocaleString('en-IN')}</span>
                  </span>
                  <span className="flex-1 text-center">
                    <span className="text-slate-500">Status: </span>
                    <span className={`font-black ${
                      newStudent.paidAmount >= newStudent.totalFee ? 'text-emerald-600' :
                      newStudent.paidAmount > 0 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {newStudent.paidAmount >= newStudent.totalFee ? '✅ Paid' : newStudent.paidAmount > 0 ? '⚠️ Partial' : '🔴 Unpaid'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Enroll Student
                </button>
              </div>
            </form>
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
