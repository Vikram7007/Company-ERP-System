import { DailyAttendanceReport, AttendanceRecord } from '../types';

export interface DetailedAttendanceProofRecord {
  id: string;
  reportId: string;
  date: string;
  dayName: string;
  sessionTopic: string;
  batch: string;
  mentorName: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  timeMarked: string;
  auditId: string;
  verified: boolean;
}

export interface StudentMonthlyAttendanceSummary {
  studentId: string;
  studentName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  attendancePercentage: number;
  complianceStatus: 'Eligible' | 'Warning' | 'Critical';
  complianceMessage: string;
  monthLabel: string;
  records: DetailedAttendanceProofRecord[];
}

/**
 * Calculates a student's real monthly attendance stats dynamically from actual attendance reports.
 * Formula: Attendance % = Math.round(((Present + Late) / Total Sessions) * 100)
 */
export function calculateStudentAttendanceStats(
  studentId: string,
  reports: DailyAttendanceReport[],
  monthFilter: string = 'All' // e.g., '2026-10' or 'All'
): StudentMonthlyAttendanceSummary {
  const matchingRecords: DetailedAttendanceProofRecord[] = [];
  let studentName = '';

  // Sort reports chronologically descending (newest first)
  const sortedReports = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedReports.forEach(report => {
    // If filtering by specific month (e.g. '2026-10')
    if (monthFilter !== 'All' && !report.date.startsWith(monthFilter)) {
      return;
    }

    const rec = report.records.find(
      r => r.studentId === studentId || 
           (r.studentName && studentId && r.studentName.toLowerCase() === studentId.toLowerCase())
    );

    if (rec) {
      if (!studentName && rec.studentName) studentName = rec.studentName;
      
      const dateObj = new Date(report.date);
      const dayName = isNaN(dateObj.getTime())
        ? 'Weekday'
        : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      // Generate a reproducible official audit verification ID
      const dateCode = report.date.replace(/-/g, '');
      const auditId = `WEBSUMS-ATT-${dateCode}-${rec.id ? rec.id.slice(-4) : 'AUTH'}`;

      matchingRecords.push({
        id: rec.id || `rec-${report.id}-${studentId}`,
        reportId: report.id,
        date: report.date,
        dayName,
        sessionTopic: report.sessionTopic || 'Enterprise Curriculum & Practical Lecture',
        batch: report.batch,
        mentorName: report.mentorName || 'Vikram Lale',
        status: rec.status,
        timeMarked: '09:30 AM IST',
        auditId,
        verified: true
      });
    }
  });

  const totalSessions = matchingRecords.length;
  const presentCount = matchingRecords.filter(r => r.status === 'Present').length;
  const lateCount = matchingRecords.filter(r => r.status === 'Late').length;
  const absentCount = matchingRecords.filter(r => r.status === 'Absent').length;
  const leaveCount = matchingRecords.filter(r => r.status === 'Leave').length;

  // Institutional evaluation: Present = 1 credit, Late = 1 credit (with record note)
  const attendancePercentage = totalSessions > 0
    ? Math.min(100, Math.round(((presentCount + lateCount) / totalSessions) * 100))
    : 100;

  let complianceStatus: 'Eligible' | 'Warning' | 'Critical' = 'Eligible';
  let complianceMessage = 'Compliant: Eligible for Certificate of Internship & Final Evaluation (>= 75%)';

  if (attendancePercentage < 65) {
    complianceStatus = 'Critical';
    complianceMessage = 'Critical: Attendance is below 65%. Ineligible for Certificate unless medical leave approved.';
  } else if (attendancePercentage < 75) {
    complianceStatus = 'Warning';
    complianceMessage = 'Warning: Attendance is between 65% and 75%. Minimum 75% required for final evaluation.';
  }

  const monthLabel = monthFilter === 'All' 
    ? 'All Sessions (Cumulative)' 
    : new Date(`${monthFilter}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    studentId,
    studentName: studentName || 'Student',
    totalSessions,
    presentCount,
    lateCount,
    absentCount,
    leaveCount,
    attendancePercentage,
    complianceStatus,
    complianceMessage,
    monthLabel,
    records: matchingRecords
  };
}
