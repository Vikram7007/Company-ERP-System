import React, { useState } from 'react';
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
  RefreshCw
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

export const CeoDashboard: React.FC = () => {
  const { user } = useAuth();
  const { mentors, students, applications, addStudent, updateApplicationStatus, attendanceReports, resetData } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'students' | 'mentors' | 'applications' | 'attendance' | 'live-classes' | 'certificates'>('overview');
  const [reportDateFilter, setReportDateFilter] = useState('');
  
  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
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

  const [previewReport, setPreviewReport] = useState<any>(null);

  // Time Filter for Analytics
  const [timeFilter, setTimeFilter] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');

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
  const handleExportCSV = () => {
    const exportRows = filteredStudents.length > 0 ? filteredStudents : students;
    const headers = ['Student Name', 'Email', 'Phone', 'Domain', 'Batch', 'College', 'Total Fee', 'Paid Amount', 'Pending Due', 'Fee Status'];
    const rows = exportRows.map(s => {
      const f = s.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
      return [
        s.name,
        s.email,
        s.phone,
        s.domain,
        s.batch,
        s.college || '',
        f.totalFee,
        f.paidAmount,
        f.pendingAmount,
        f.status || 'Unpaid'
      ];
    });

    const csvData = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvData], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Websums_Student_Fee_Report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.domain.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
    const feeStatus = s.feeDetails?.status || 'Unpaid';
    const matchesFee = feeStatusFilter === 'All' || feeStatus === feeStatusFilter;
    return matchesSearch && matchesBatch && matchesFee;
  });

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const currentStudentPage = Math.min(studentPage, totalStudentPages);
  const paginatedStudents = filteredStudents.slice((currentStudentPage - 1) * studentsPerPage, currentStudentPage * studentsPerPage);

  const filteredApplications = applications.filter(a => {
    const matchesSearch = a.applicantName.toLowerCase().includes(appSearch.toLowerCase()) || a.email.toLowerCase().includes(appSearch.toLowerCase()) || a.domain.toLowerCase().includes(appSearch.toLowerCase());
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
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-white/45 bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-white/25 sm:text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Export Excel</span>
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
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden space-y-0">
          
          {/* Top Decorative Banner Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"></div>

          {/* Header & Controls Section */}
          <div className="p-4 pb-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-[1.05rem] font-black text-slate-900 tracking-tight leading-tight">Registered Students Directory & Company Fee Records</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-700 border border-orange-200">
                  {filteredStudents.length} Active Records
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Track total course fees, payments made, pending balances and manage records in real time</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              
              {/* Time Range Filter */}
              <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <button 
                  onClick={() => setTimeFilter('Today')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${timeFilter === 'Today' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setTimeFilter('Week')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${timeFilter === 'Week' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setTimeFilter('Month')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${timeFilter === 'Month' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setTimeFilter('Year')}
                  className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${timeFilter === 'Year' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                >
                  This Year
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setStudentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 text-[11px] rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
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
                  onChange={(e) => {
                    setFeeStatusFilter(e.target.value);
                    setStudentPage(1);
                  }}
                  className="py-2 pl-3 pr-8 text-[11px] rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white font-extrabold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-all appearance-none"
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
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setStudentPage(1);
                  }}
                  className="py-2 pl-3 pr-8 text-[11px] rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white font-extrabold text-slate-700 cursor-pointer focus:outline-none focus:border-orange-500 transition-all appearance-none"
                >
                  <option value="All">All Batches</option>
                  {availableBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
              </div>

              {/* Sync Data Button to reload new batches & initial data */}
              <button
                onClick={() => {
                  resetData();
                  alert('Data synced! Batch RK-Gurukul-DS and all updated student records are now live.');
                }}
                title="Click to sync new batches and refresh student records"
                className="py-2 px-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold text-[11px] flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Data</span>
              </button>
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
                  <th className="py-2.5 px-3 text-right">Fee Action</th>
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
                    
                    // Dynamic Domain pill badge styling
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

                    // Dynamic Avatar gradient based on name hash
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

                        {/* Record Payment Button */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentForFee(std);
                              setShowFeeModal(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-extrabold transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center space-x-1.5 ml-auto whitespace-nowrap cursor-pointer active:scale-95 border border-emerald-500/20"
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
      {activeSubTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assigned Senior Mentors</h3>
              <p className="text-xs text-slate-500">Manage mentor loads, domain allocations, and add new instructors</p>
            </div>
            <button
              onClick={() => setShowAddMentorModal(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Mentor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((mnt) => (
              <div key={mnt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-base">
                    {mnt.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{mnt.name}</h4>
                    <p className="text-xs text-slate-500">{mnt.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Assigned Domains:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mnt.assignedDomains.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-semibold text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-slate-600">
                    <span>Total Interns Managed:</span>
                    <span className="font-bold text-slate-900">{mnt.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Mentor Rating:</span>
                    <span className="font-bold text-amber-500">⭐ {mnt.rating} / 5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Add New Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <select
                value={newStudent.domain}
                onChange={(e) => setNewStudent({ ...newStudent, domain: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              >
                {INITIAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={newStudent.totalFee}
                    onChange={(e) => setNewStudent({ ...newStudent, totalFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Initial Paid (₹)</label>
                  <input
                    type="number"
                    value={newStudent.paidAmount}
                    onChange={(e) => setNewStudent({ ...newStudent, paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
