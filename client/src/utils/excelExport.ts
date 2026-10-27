import ExcelJS from 'exceljs';
import { Student, DailyAttendanceReport } from '../types';
import { calculateStudentAttendanceStats } from './attendanceCalculator';

/**
 * Converts an image URL (e.g. /logo.png) to a base64 Data URL or ArrayBuffer
 * for embedding into an ExcelJS worksheet.
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Could not load company logo for Excel export:', error);
    return null;
  }
}

export interface ExportStudentsExcelOptions {
  students: Student[];
  filteredStudents?: Student[];
  companyName?: string;
  ceoName?: string;
  reportTitle?: string;
  attendanceReports?: DailyAttendanceReport[];
}

/**
 * Generates an ultra-premium, beautifully formatted Excel spreadsheet (.xlsx)
 * featuring the Websums Software PVT. LTD. branding, official company logo,
 * executive KPI summary cards, zebra-striped student data, and totals.
 */
export async function exportStudentsToExcel({
  students,
  filteredStudents,
  companyName = 'Websums Software PVT.LTD',
  ceoName = 'Shriram Thorat (CEO)',
  reportTitle = 'STUDENT ENROLLMENT & EXECUTIVE FEE REPORT',
  attendanceReports = []
}: ExportStudentsExcelOptions): Promise<void> {
  const exportList = (filteredStudents && filteredStudents.length > 0) ? filteredStudents : students;

  // 1. Initialize Workbook & Worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Websums Software Pvt. Ltd.';
  workbook.lastModifiedBy = ceoName;
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Student Records & Fees', {
    views: [{ showGridLines: true, state: 'normal' }],
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Calculate Metrics
  const totalStudents = exportList.length;
  const totalFee = exportList.reduce((acc, s) => acc + (s.feeDetails?.totalFee ?? 15000), 0);
  const totalPaid = exportList.reduce((acc, s) => acc + (s.feeDetails?.paidAmount ?? 0), 0);
  const totalDue = exportList.reduce((acc, s) => acc + (s.feeDetails?.pendingAmount ?? 0), 0);
  const collectionRate = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;
  const nowStr = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // 2. Add Company Logo
  const logoBase64 = await fetchImageAsBase64('/logo.png');
  let startHeaderCol = 'C';

  if (logoBase64) {
    try {
      const logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });

      // Place the logo spanning A1 to B4
      worksheet.addImage(logoId, {
        tl: { col: 0.2, row: 0.2 },
        ext: { width: 95, height: 95 }
      });
      startHeaderCol = 'C';
    } catch (e) {
      console.warn('Failed to embed logo in Excel:', e);
    }
  }

  // Set Row Heights for Header Section
  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 28;
  worksheet.getRow(3).height = 20;
  worksheet.getRow(4).height = 18;
  worksheet.getRow(5).height = 12; // Gap
  worksheet.getRow(6).height = 24; // KPI Cards Row 1
  worksheet.getRow(7).height = 26; // KPI Cards Row 2
  worksheet.getRow(8).height = 14; // Gap
  worksheet.getRow(9).height = 32; // Table Header

  // 3. Header Titles
  // Row 1: Company Category / Tagline
  worksheet.mergeCells(`${startHeaderCol}1:M1`);
  const tagCell = worksheet.getCell(`${startHeaderCol}1`);
  tagCell.value = 'ENTERPRISE TRAINING & SKILL DEVELOPMENT PORTAL';
  tagCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFEA580C' } };
  tagCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Row 2: Company Name (Websums Software PVT.LTD)
  worksheet.mergeCells(`${startHeaderCol}2:M2`);
  const compCell = worksheet.getCell(`${startHeaderCol}2`);
  compCell.value = companyName.toUpperCase();
  compCell.font = { name: 'Segoe UI', size: 18, bold: true, color: { argb: 'FF0B3B60' } };
  compCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Row 3: Report Title
  worksheet.mergeCells(`${startHeaderCol}3:M3`);
  const titleCell = worksheet.getCell(`${startHeaderCol}3`);
  titleCell.value = reportTitle;
  titleCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Row 4: Generation Meta
  worksheet.mergeCells(`${startHeaderCol}4:M4`);
  const metaCell = worksheet.getCell(`${startHeaderCol}4`);
  metaCell.value = `Exported by: ${ceoName}  |  Generated on: ${nowStr}  |  Status: Official & Confidential`;
  metaCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF64748B' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // 4. Executive KPI Summary Cards (Rows 6 & 7)
  const kpiCards = [
    { label: 'TOTAL STUDENTS', value: `${totalStudents} Enrolled`, colStart: 'A', colEnd: 'C', bg: 'FFF8FAFC', accent: 'FF0B3B60' },
    { label: 'TOTAL COURSE VALUE', value: `₹${totalFee.toLocaleString('en-IN')}`, colStart: 'D', colEnd: 'F', bg: 'FFF8FAFC', accent: 'FF1E293B' },
    { label: 'TOTAL COLLECTED', value: `₹${totalPaid.toLocaleString('en-IN')}`, colStart: 'G', colEnd: 'I', bg: 'FFF0FDF4', accent: 'FF15803D' },
    { label: 'PENDING DUES', value: `₹${totalDue.toLocaleString('en-IN')}`, colStart: 'J', colEnd: 'K', bg: 'FFFEF2F2', accent: 'FFDC2626' },
    { label: 'COLLECTION RATE', value: `${collectionRate}% Completed`, colStart: 'L', colEnd: 'M', bg: 'FFFFF7ED', accent: 'FFEA580C' },
  ];

  kpiCards.forEach(kpi => {
    worksheet.mergeCells(`${kpi.colStart}6:${kpi.colEnd}6`);
    worksheet.mergeCells(`${kpi.colStart}7:${kpi.colEnd}7`);

    const labelCell = worksheet.getCell(`${kpi.colStart}6`);
    labelCell.value = kpi.label;
    labelCell.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: 'FF64748B' } };
    labelCell.alignment = { vertical: 'middle', horizontal: 'center' };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };

    const valCell = worksheet.getCell(`${kpi.colStart}7`);
    valCell.value = kpi.value;
    valCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: kpi.accent } };
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.bg } };

    // Apply borders around the card cells
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
    labelCell.border = borderStyle;
    valCell.border = borderStyle;
  });

  // 5. Table Header Row (Row 9)
  const columns = [
    { header: 'SR. NO.', key: 'srNo', width: 9, align: 'center' },
    { header: 'STUDENT NAME', key: 'name', width: 24, align: 'left' },
    { header: 'EMAIL ADDRESS', key: 'email', width: 28, align: 'left' },
    { header: 'PHONE NUMBER', key: 'phone', width: 17, align: 'center' },
    { header: 'ENROLLED DOMAIN', key: 'domain', width: 26, align: 'left' },
    { header: 'BATCH CODE', key: 'batch', width: 18, align: 'center' },
    { header: 'COLLEGE / INSTITUTION', key: 'college', width: 26, align: 'left' },
    { header: 'ASSIGNED MENTOR', key: 'mentor', width: 22, align: 'left' },
    { header: 'TOTAL FEE (₹)', key: 'totalFee', width: 16, align: 'right' },
    { header: 'PAID AMOUNT (₹)', key: 'paidAmount', width: 16, align: 'right' },
    { header: 'PENDING DUE (₹)', key: 'pendingDue', width: 16, align: 'right' },
    { header: 'FEE STATUS', key: 'feeStatus', width: 15, align: 'center' },
    { header: 'ATTENDANCE', key: 'attendance', width: 14, align: 'center' },
  ];

  // Set Column widths
  columns.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width;
  });

  const headerRow = worksheet.getRow(9);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F2D4A' } // Deep Navy Executive Brand Color
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0B3B60' } },
      bottom: { style: 'medium', color: { argb: 'FFEA580C' } }, // Brand Orange accent underline
      left: { style: 'thin', color: { argb: 'FF1E3A5F' } },
      right: { style: 'thin', color: { argb: 'FF1E3A5F' } },
    };
  });

  // 6. Data Rows (Starting from Row 10)
  let currentRowIdx = 10;
  exportList.forEach((student, index) => {
    const row = worksheet.getRow(currentRowIdx);
    row.height = 24;

    const f = student.feeDetails || { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid' };
    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Zebra striping

    // Calculate real-time attendance percentage
    let attPct = student.attendancePercentage ?? 0;
    if (attendanceReports && attendanceReports.length > 0) {
      const stats = calculateStudentAttendanceStats(student.id, attendanceReports);
      if (stats.totalSessions > 0) {
        attPct = stats.attendancePercentage;
      }
    }

    const rowData = [
      index + 1,
      student.name || 'N/A',
      student.email || 'N/A',
      student.phone || 'N/A',
      student.domain || 'N/A',
      student.batch || 'N/A',
      student.college || 'N/A',
      student.mentorName || 'Unassigned',
      f.totalFee,
      f.paidAmount,
      f.pendingAmount,
      f.status || 'Unpaid',
      `${attPct}%`
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: columns[colIdx].align as ExcelJS.Alignment['horizontal']
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
        right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
      };

      // Currency Formatting
      if (colIdx === 8 || colIdx === 9 || colIdx === 10) {
        cell.numFmt = '₹#,##0';
        cell.font = { name: 'Segoe UI', size: 9.5, bold: colIdx === 10, color: { argb: colIdx === 10 && f.pendingAmount > 0 ? 'FFDC2626' : 'FF1E293B' } };
      }

      // Fee Status Badge Styling
      if (colIdx === 11) {
        const status = String(val).toLowerCase();
        if (status === 'paid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF15803D' } };
        } else if (status === 'partial') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFB45309' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFDC2626' } };
        }
      }

      // Real Attendance Badge Styling
      if (colIdx === 12) {
        if (attPct >= 75) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF15803D' } };
        } else if (attPct >= 65) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFB45309' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFDC2626' } };
        }
      }
    });

    currentRowIdx++;
  });

  // 7. Grand Total Row
  const totalRow = worksheet.getRow(currentRowIdx);
  totalRow.height = 28;

  worksheet.mergeCells(`A${currentRowIdx}:H${currentRowIdx}`);
  const totalLabelCell = worksheet.getCell(`A${currentRowIdx}`);
  totalLabelCell.value = 'GRAND TOTAL SUMMARY';
  totalLabelCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0B3B60' } };
  totalLabelCell.alignment = { vertical: 'middle', horizontal: 'right' };
  totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };

  // Set Totals using Formulas
  const totalFeeCell = worksheet.getCell(`I${currentRowIdx}`);
  totalFeeCell.value = { formula: `SUM(I10:I${currentRowIdx - 1})`, result: totalFee };
  totalFeeCell.numFmt = '₹#,##0';
  totalFeeCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0B3B60' } };
  totalFeeCell.alignment = { vertical: 'middle', horizontal: 'right' };
  totalFeeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };

  const totalPaidCell = worksheet.getCell(`J${currentRowIdx}`);
  totalPaidCell.value = { formula: `SUM(J10:J${currentRowIdx - 1})`, result: totalPaid };
  totalPaidCell.numFmt = '₹#,##0';
  totalPaidCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF15803D' } };
  totalPaidCell.alignment = { vertical: 'middle', horizontal: 'right' };
  totalPaidCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };

  const totalDueCell = worksheet.getCell(`K${currentRowIdx}`);
  totalDueCell.value = { formula: `SUM(K10:K${currentRowIdx - 1})`, result: totalDue };
  totalDueCell.numFmt = '₹#,##0';
  totalDueCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFDC2626' } };
  totalDueCell.alignment = { vertical: 'middle', horizontal: 'right' };
  totalDueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };

  // Empty cells for Status & Attendance in total row
  ['L', 'M'].forEach(col => {
    const c = worksheet.getCell(`${col}${currentRowIdx}`);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
  });

  // Apply Double Bottom Border for Accounting Standard
  for (let c = 1; c <= 13; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'double', color: { argb: 'FF0B3B60' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  }

  // 8. Footer Note (Row + 2)
  currentRowIdx += 2;
  worksheet.mergeCells(`A${currentRowIdx}:M${currentRowIdx}`);
  const footerCell = worksheet.getCell(`A${currentRowIdx}`);
  footerCell.value = `© ${new Date().getFullYear()} ${companyName}. All rights reserved. This document is confidential and proprietary to Websums Software Pvt. Ltd.`;
  footerCell.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: 'FF94A3B8' } };
  footerCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // 9. Generate & Trigger Download with guaranteed .xlsx filename extension
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = `Websums_Software_PVT_LTD_Student_Report_${todayStr}.xlsx`;

  if (typeof (window.navigator as any).msSaveBlob === 'function') {
    (window.navigator as any).msSaveBlob(blob, fileName);
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', fileName);
  anchor.download = fileName;

  document.body.appendChild(anchor);

  try {
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  } catch {
    anchor.click();
  }

  // CRITICAL FIX: Do NOT immediately revoke the blob URL synchronously!
  // In modern Chromium, immediate URL.revokeObjectURL causes the browser to lose the
  // filename attribute and save as an extensionless UUID. Delaying by 60s gives the browser
  // ample time to safely stream and write the .xlsx file.
  setTimeout(() => {
    try {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 60000);
}
