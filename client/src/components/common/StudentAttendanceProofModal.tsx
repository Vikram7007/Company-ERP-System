import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  ShieldCheck, 
  Download, 
  Printer, 
  User, 
  GraduationCap, 
  Building2, 
  FileText,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Student, DailyAttendanceReport } from '../../types';
import { calculateStudentAttendanceStats } from '../../utils/attendanceCalculator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentAttendanceProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  attendanceReports: DailyAttendanceReport[];
}

export const StudentAttendanceProofModal: React.FC<StudentAttendanceProofModalProps> = ({
  isOpen,
  onClose,
  student,
  attendanceReports
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10'); // Default to October 2026

  if (!isOpen || !student) return null;

  const stats = calculateStudentAttendanceStats(student.id, attendanceReports, selectedMonth);

  // Available months extracted from reports
  const availableMonths = Array.from(new Set(
    attendanceReports.map(r => r.date.slice(0, 7)).filter(Boolean)
  )).sort().reverse();

  if (!availableMonths.includes('2026-10')) {
    availableMonths.unshift('2026-10');
  }

  // Handle PDF Proof Generation
  const handleDownloadProofPDF = () => {
    const doc = new jsPDF();

    // Primary Brand Colors
    const primaryNavy: [number, number, number] = [11, 59, 96]; // #0B3B60
    const accentOrange: [number, number, number] = [255, 118, 0]; // #FF7600

    // Header
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('WEBSUMS SOFTWARE PVT. LTD.', 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL STUDENT MONTHLY ATTENDANCE AUDIT & PROOF REGISTER', 14, 21);

    // Metadata Strip
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student Name: ${student.name}`, 14, 38);
    doc.text(`Batch Code: ${student.batch}`, 14, 44);
    doc.text(`Domain: ${student.domain}`, 14, 50);

    doc.text(`Student ID: ${student.userId || student.id}`, 130, 38);
    doc.text(`Month: ${stats.monthLabel}`, 130, 44);
    doc.text(`Attendance Rate: ${stats.attendancePercentage}%`, 130, 50);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 56, 182, 16, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 56, 182, 16, 2, 2, 'D');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Sessions: ${stats.totalSessions}`, 20, 66);
    doc.setTextColor(22, 101, 52);
    doc.text(`Present: ${stats.presentCount}`, 70, 66);
    doc.setTextColor(180, 83, 9);
    doc.text(`Late: ${stats.lateCount}`, 115, 66);
    doc.setTextColor(220, 38, 38);
    doc.text(`Absent: ${stats.absentCount}`, 155, 66);

    // Table of Attendance Proof
    const tableRows = stats.records.map((r, idx) => [
      String(idx + 1),
      r.date,
      r.dayName,
      r.sessionTopic,
      r.status,
      r.mentorName,
      r.auditId
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['Sr.', 'Date', 'Day', 'Session Topic', 'Status', 'Verified By', 'Audit Hash ID']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 59, 96],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'left', cellWidth: 50 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'left', cellWidth: 30 },
        6: { halign: 'center', cellWidth: 30 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'Present') {
            data.cell.styles.textColor = [22, 101, 52];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Late') {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Verification Seal / Signatures at bottom
    const finalY = (doc as any).lastAutoTable?.finalY || 200;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an electronically verified attendance audit log issued by Websums Software Pvt. Ltd.', 14, finalY + 12);
    doc.text('Verification Code: WSS-ATT-VERIFIED-2026 • Valid for Placement Drive & PPO Eligibility', 14, finalY + 17);

    doc.save(`Websums_Attendance_Proof_${student.name.replace(/\s+/g, '_')}_${selectedMonth}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-[0_25px_70px_rgba(15,23,42,0.4)] border border-slate-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[92vh]">
        
        {/* Ambient Top Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-sky-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-orange-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 ring-4 ring-blue-50 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Student Monthly Attendance Proof
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  Official Register
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Verified audit trail for</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {student.name}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-slate-500 text-[11px]">{student.userId || student.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar: Month Selector & Download Proof */}
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Filter Month:</span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-xs font-bold bg-white text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer appearance-none"
              >
                <option value="All">All Sessions (Full Internship)</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>
                    {new Date(`${m}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadProofPDF}
              className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Download formal signed PDF attendance proof document"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download PDF Proof</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3 shrink-0">
          {/* Rate */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100">Attendance Rate</span>
            <div className="my-1">
              <span className="text-2xl font-black">{stats.attendancePercentage}%</span>
            </div>
            <span className="text-[10px] font-medium text-blue-100 truncate">
              {stats.attendancePercentage >= 75 ? 'Compliant (>=75%)' : 'Below 75%'}
            </span>
          </div>

          {/* Sessions */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Held</span>
            <span className="text-xl font-black text-slate-800 my-0.5">{stats.totalSessions}</span>
            <span className="text-[10px] text-slate-400">Class Sessions</span>
          </div>

          {/* Present */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present</span>
            <span className="text-xl font-black text-emerald-800 my-0.5">{stats.presentCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Attended</span>
          </div>

          {/* Late */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Late</span>
            <span className="text-xl font-black text-amber-800 my-0.5">{stats.lateCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">Recorded Late</span>
          </div>

          {/* Absent */}
          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent</span>
            <span className="text-xl font-black text-rose-800 my-0.5">{stats.absentCount}</span>
            <span className="text-[10px] text-rose-600 font-medium">Missed Sessions</span>
          </div>
        </div>

        {/* Compliance Banner */}
        <div className={`mt-3 p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 ${
          stats.complianceStatus === 'Eligible'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : stats.complianceStatus === 'Warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {stats.complianceStatus === 'Eligible' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{stats.complianceMessage}</span>
        </div>

        {/* Detailed Proof Table (Scrollable Body) */}
        <div className="relative mt-3 flex-1 overflow-y-auto border border-slate-200 rounded-2xl scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-sm text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Date & Day</th>
                <th className="py-2.5 px-3">Session Curriculum Topic</th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Verified By</th>
                <th className="py-2.5 px-3 text-right">Audit ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No session logs found for {stats.monthLabel}.
                  </td>
                </tr>
              ) : (
                stats.records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-800">{r.date}</p>
                      <p className="text-[10px] text-slate-400">{r.dayName}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800 max-w-xs">{r.sessionTopic}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {r.batch}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        r.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : r.status === 'Late'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {r.status === 'Present' && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                        {r.status === 'Late' && <Clock className="w-3 h-3" />}
                        {r.status === 'Absent' && <XCircle className="w-3 h-3 stroke-[2.5]" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-700">{r.mentorName}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {r.auditId}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="relative mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Websums Software Pvt. Ltd. Enterprise Academic Verification</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            Close Proof Register
          </button>
        </div>

      </div>
    </div>
  );
};
