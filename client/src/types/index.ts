export type Role = 'CEO' | 'Mentor' | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  domain?: string;
  batch?: string;
  token?: string;
}

export interface SyllabusLesson {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  notesUrl?: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface WeeklySyllabus {
  week: number;
  title: string;
  topics: string[];
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Locked';
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  practicalProject?: string;
  lessons?: SyllabusLesson[];
}

export interface Domain {
  id: string;
  name: string;
  category: string;
  iconName: string;
  studentsEnrolled: number;
  durationWeeks: number;
  description: string;
  syllabus: WeeklySyllabus[];
}

export interface FeeTransaction {
  id: string;
  amount: number;
  date: string;
  paymentMode: 'UPI / GPay' | 'Bank Transfer / NEFT' | 'Cash' | 'Credit / Debit Card';
  receiptNo: string;
  notes?: string;
}

export interface FeeDetail {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  transactions: FeeTransaction[];
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  batch: string;
  mentorName: string;
  profileCompletion: number;
  attendancePercentage: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  averageGrade: string; // e.g. "A+", "94%"
  joinedDate: string;
  status: 'Active' | 'Completed' | 'On Leave';
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  college: string;
  feeDetails: FeeDetail;
}

export interface StudentApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  domain: string;
  college: string;
  qualification?: string;
  appliedDate: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  resumeUrl: string;
  resumeFileName: string;
  statement?: string;
  notes?: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedDomains: string[];
  activeBatches: string[];
  totalStudents: number;
  rating: number;
  joinedDate: string;
  status: 'Active' | 'On Leave';
}

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  domain: string;
  batch: string;
  mentorName: string;
  date: string;
  time: string;
  endTime?: string;
  durationMinutes: number;
  meetingPlatform: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'YouTube Live' | 'Other';
  meetingUrl: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  recordingUrl?: string;
  notesUrl?: string;
  notesFileName?: string;
  completedAt?: string;
}

export interface RecordedLecture {
  id: string;
  title: string;
  description?: string;
  domain: string;
  batch?: string;
  week?: number;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  viewsCount?: number;
  pdfNotesUrl?: string;
  pdfNotesName?: string;
  date?: string;
  mentorName?: string;
  liveClassId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  batch: string;
  domain: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
}

export interface DailyAttendanceReport {
  id: string;
  date: string;
  batch: string;
  mentorName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  sessionTopic?: string;
  records: AttendanceRecord[];
}

export interface Assignment {
  id: string;
  title: string;
  domain: string;
  batch: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  attachmentUrl?: string;
  pdfFileName?: string;
  totalSubmissions: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl: string;
  marksObtained?: number;
  feedback?: string;
  status: 'Pending' | 'Graded';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category?: string;
  domain?: string;
}

export interface Quiz {
  id: string;
  title: string;
  domain: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  xpReward: number;
  questions: QuizQuestion[];
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Locked';
  prerequisiteTitle?: string;
  progressPercent?: number;
  questionsAnswered?: number;
  bestScore?: number;
  timeLimitMins?: number;
}

export interface Certificate {
  id: string;
  certificateCode: string;
  studentName: string;
  studentEmail: string;
  domain: string;
  issueDate: string;
  grade: string;
  qrCodeUrl: string;
  certificateUrl?: string;
  verified: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Mentor' | 'Student';
  authorName: string;
  createdAt: string;
  urgent: boolean;
}

export interface JobPosting {
  id: string;
  companyName: string;
  companyLogo?: string;
  roleTitle: string;
  location: string;
  salaryPackage: string;
  type: 'Full-time' | 'Internship' | 'PPO';
  skillsRequired: string[];
  appliedCount: number;
  title?: string;
  company?: string;
  salary?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}
