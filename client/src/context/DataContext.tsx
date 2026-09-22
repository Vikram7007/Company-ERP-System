import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mentor, Student, StudentApplication, FeeTransaction, Assignment, Submission, DailyAttendanceReport, AttendanceRecord, LiveClass, RecordedLecture, Quiz } from '../types';
import { INITIAL_MENTORS, INITIAL_STUDENTS, INITIAL_APPLICATIONS, INITIAL_ASSIGNMENTS, INITIAL_LIVE_CLASSES, INITIAL_LECTURES, INITIAL_QUIZZES } from '../data/mockData';
import { apiGet, apiPost, apiPatch } from '../utils/api';

interface DataContextType {
  mentors: Mentor[];
  students: Student[];
  applications: StudentApplication[];
  addMentor: (mentorData: Omit<Mentor, 'id' | 'totalStudents' | 'rating' | 'joinedDate'>) => Promise<void>;
  addStudent: (studentData: Omit<Student, 'id' | 'feeDetails'> & { totalFee?: number; paidAmount?: number }) => void;
  updateStudentFee: (studentId: string, additionalPayment: number, paymentMode: any, notes?: string) => void;
  addApplication: (appData: Omit<StudentApplication, 'id' | 'appliedDate' | 'status' | 'resumeFileName'>) => void;
  updateApplicationStatus: (appId: string, newStatus: 'Accepted' | 'Rejected' | 'Pending') => void;
  assignments: Assignment[];
  submissions: Submission[];
  attendanceReports: DailyAttendanceReport[];
  addAssignment: (asgData: Omit<Assignment, 'id' | 'totalSubmissions'>) => void;
  submitAssignment: (asgId: string, studentName: string, link: string) => void;
  saveAttendanceReport: (reportData: Omit<DailyAttendanceReport, 'id'>) => void;
  liveClasses: LiveClass[];
  recordedLectures: RecordedLecture[];
  addLiveClass: (classData: Omit<LiveClass, 'id' | 'status'>) => void;
  endLiveClass: (classId: string, videoUrl: string) => void;
  addRecordedLecture: (lectureData: Omit<RecordedLecture, 'id' | 'viewsCount'>) => void;
  quizzes: Quiz[];
  updateQuizResult: (quizId: string, score: number, questionsAnswered: number) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem('websums_mentors');
    return saved ? JSON.parse(saved) : INITIAL_MENTORS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('websums_students');
    if (saved) {
      try {
        const parsed: Student[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(s => s.id));
        const missingInitial = INITIAL_STUDENTS.filter(s => !existingIds.has(s.id));
        if (missingInitial.length > 0) {
          const merged = [...parsed, ...missingInitial];
          localStorage.setItem('websums_students', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (err) {
        return INITIAL_STUDENTS;
      }
    }
    return INITIAL_STUDENTS;
  });

  const [applications, setApplications] = useState<StudentApplication[]>(() => {
    const saved = localStorage.getItem('websums_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  useEffect(() => {
    // Auto-sync initial mentors with updated names & assigned domains
    setMentors(INITIAL_MENTORS);
    localStorage.setItem('websums_mentors', JSON.stringify(INITIAL_MENTORS));
  }, []);

  useEffect(() => {
    localStorage.setItem('websums_mentors', JSON.stringify(mentors));
  }, [mentors]);

  useEffect(() => {
    // Auto-sync INITIAL_STUDENTS (e.g. RK Gurukul batch & paid fees) into state
    setStudents((prev) => {
      const existingIds = new Set(prev.map(s => s.id));
      const missing = INITIAL_STUDENTS.filter(s => !existingIds.has(s.id));
      
      // Also update RK Gurukul DS students to Paid status
      let hasChanges = missing.length > 0;
      const updated = prev.map(s => {
        if (s.batch === 'Batch RK-Gurukul-DS' && s.feeDetails?.status !== 'Paid') {
          hasChanges = true;
          return {
            ...s,
            feeDetails: {
              totalFee: 3000,
              paidAmount: 3000,
              pendingAmount: 0,
              status: 'Paid' as const,
              transactions: s.feeDetails?.transactions?.length ? s.feeDetails.transactions : [
                { id: `tx-sync-${s.id}`, amount: 3000, date: '2026-08-15', paymentMode: 'UPI / GPay' as const, receiptNo: `GURUKUL-REC-${s.id}` }
              ]
            }
          };
        }
        return s;
      });

      if (hasChanges) {
        const merged = [...updated, ...missing];
        localStorage.setItem('websums_students', JSON.stringify(merged));
        return merged;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('websums_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('websums_applications', JSON.stringify(applications));
  }, [applications]);

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('websums_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  useEffect(() => {
    localStorage.setItem('websums_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('websums_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('websums_submissions', JSON.stringify(submissions));
  }, [submissions]);

  const [attendanceReports, setAttendanceReports] = useState<DailyAttendanceReport[]>(() => {
    const saved = localStorage.getItem('websums_attendance_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('websums_attendance_reports', JSON.stringify(attendanceReports));
  }, [attendanceReports]);

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => {
    const saved = localStorage.getItem('websums_live_classes');
    return saved ? JSON.parse(saved) : INITIAL_LIVE_CLASSES;
  });

  useEffect(() => {
    localStorage.setItem('websums_live_classes', JSON.stringify(liveClasses));
  }, [liveClasses]);

  const [recordedLectures, setRecordedLectures] = useState<RecordedLecture[]>(() => {
    const saved = localStorage.getItem('websums_recorded_lectures');
    return saved ? JSON.parse(saved) : INITIAL_LECTURES;
  });

  useEffect(() => {
    localStorage.setItem('websums_recorded_lectures', JSON.stringify(recordedLectures));
  }, [recordedLectures]);

  // CEO capability: Add New Mentor
  const addMentor = async (mentorData: Omit<Mentor, 'id' | 'totalStudents' | 'rating' | 'joinedDate'>) => {
    const newMentor: Mentor = {
      ...mentorData,
      id: `mnt-${Date.now()}`,
      totalStudents: 0,
      rating: 5.0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const createdMentor = await apiPost<Mentor>('/api/mentors', newMentor);
    setMentors((prev) => [createdMentor, ...prev]);
  };

  // CEO / Admin capability: Add New Student
  const addStudent = (data: Omit<Student, 'id' | 'feeDetails'> & { totalFee?: number; paidAmount?: number }) => {
    const totalFee = data.totalFee || 15000;
    const paidAmount = data.paidAmount || 0;
    const pendingAmount = Math.max(0, totalFee - paidAmount);
    const status = paidAmount >= totalFee ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      feeDetails: {
        totalFee,
        paidAmount,
        pendingAmount,
        status,
        transactions: paidAmount > 0 ? [
          {
            id: `tx-${Date.now()}`,
            amount: paidAmount,
            date: new Date().toISOString().split('T')[0],
            paymentMode: 'UPI / GPay',
            receiptNo: `WEB-REC-${Math.floor(100 + Math.random() * 900)}`
          }
        ] : []
      }
    };
    setStudents((prev) => [newStudent, ...prev]);
    apiPost<Student>('/api/students', newStudent).catch(console.error);
  };

  // Manual Fee Payment Tracker for Student Company Records
  const updateStudentFee = (studentId: string, additionalPayment: number, paymentMode: any, notes?: string) => {
    setStudents((prev) =>
      prev.map((std) => {
        if (std.id !== studentId) return std;
        const currentDetails = std.feeDetails || {
          totalFee: 15000,
          paidAmount: 0,
          pendingAmount: 15000,
          status: 'Unpaid',
          transactions: []
        };
        const newPaid = currentDetails.paidAmount + Number(additionalPayment);
        const newPending = Math.max(0, currentDetails.totalFee - newPaid);
        const newStatus = newPaid >= currentDetails.totalFee ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';

        const newTx: FeeTransaction = {
          id: `tx-${Date.now()}`,
          amount: Number(additionalPayment),
          date: new Date().toISOString().split('T')[0],
          paymentMode: paymentMode || 'UPI / GPay',
          receiptNo: `WEB-REC-${Math.floor(100 + Math.random() * 900)}`,
          notes: notes || 'Manual Payment Entry'
        };

        return {
          ...std,
          feeDetails: {
            ...currentDetails,
            paidAmount: newPaid,
            pendingAmount: newPending,
            status: newStatus,
            transactions: [newTx, ...(currentDetails.transactions || [])]
          }
        };
      })
    );
    apiPost<Student>(`/api/students/${studentId}/payments`, { amount: additionalPayment, paymentMode, notes }).catch(console.error);
  };

  // Student Application Submission from Landing Page
  const addApplication = (appData: Omit<StudentApplication, 'id' | 'appliedDate' | 'status' | 'resumeFileName'>) => {
    const newApp: StudentApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      resumeFileName: `${appData.applicantName.replace(/\s+/g, '_')}_Resume.pdf`,
      resumeUrl: appData.resumeUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };
    setApplications((prev) => [newApp, ...prev]);
    apiPost<StudentApplication>('/api/applications', newApp).catch(console.error);
  };

  // Status Manager for Applications (Accept / Reject / Pending)
  const updateApplicationStatus = (appId: string, newStatus: 'Accepted' | 'Rejected' | 'Pending') => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return { ...app, status: newStatus };
      })
    );
    apiPatch<StudentApplication>(`/api/applications/${appId}/status`, { status: newStatus }).catch(console.error);

    // If accepted, automatically enroll student if not already present
    if (newStatus === 'Accepted') {
      const app = applications.find((a) => a.id === appId);
      if (app) {
        const alreadyEnrolled = students.some((s) => s.email.toLowerCase() === app.email.toLowerCase());
        if (!alreadyEnrolled) {
          addStudent({
            userId: `usr-${Date.now()}`,
            name: app.applicantName,
            email: app.email,
            phone: app.phone,
            domain: app.domain,
            batch: 'Batch W-2026-A',
            mentorName: 'Dr. Rajesh Verma',
            profileCompletion: 85,
            attendancePercentage: 100,
            assignmentsSubmitted: 0,
            totalAssignments: 8,
            averageGrade: 'N/A',
            joinedDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            college: app.college,
            totalFee: 15000,
            paidAmount: 0
          });
        }
      }
    }
  };

  const addAssignment = (asgData: Omit<Assignment, 'id' | 'totalSubmissions'>) => {
    const newAsg: Assignment = {
      ...asgData,
      id: `asg-${Date.now()}`,
      totalSubmissions: 0
    };
    setAssignments(prev => [newAsg, ...prev]);
    apiPost<Assignment>('/api/assignments', newAsg).catch(console.error);
  };

  const submitAssignment = (asgId: string, studentName: string, link: string) => {
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: asgId,
      assignmentTitle: assignments.find(a => a.id === asgId)?.title || 'Assignment',
      studentId: `std-current`,
      studentName: studentName || 'Aarav Sharma',
      submittedAt: new Date().toISOString().split('T')[0],
      fileUrl: link || '#',
      status: 'Pending'
    };
    
    setSubmissions(prev => [newSubmission, ...prev]);

    setAssignments(prev => prev.map(asg => 
      asg.id === asgId ? { ...asg, totalSubmissions: asg.totalSubmissions + 1 } : asg
    ));
    apiPost<Submission>(`/api/assignments/${asgId}/submissions`, { ...newSubmission, link }).catch(console.error);
  };

  const saveAttendanceReport = (reportData: Omit<DailyAttendanceReport, 'id'>) => {
    const newReport: DailyAttendanceReport = {
      ...reportData,
      id: `rep-${Date.now()}`
    };
    
    // Check if report already exists for today & batch to update instead of add duplicate
    setAttendanceReports(prev => {
      const existsIdx = prev.findIndex(r => r.date === reportData.date && r.batch === reportData.batch);
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = newReport;
        return copy;
      }
      return [newReport, ...prev];
    });
    apiPost<DailyAttendanceReport>('/api/attendance/reports', newReport).catch(console.error);

    // Also update student attendance percentage logically 
    // (mock implementation: just add to their percentage visually in a real app)
  };

  const addLiveClass = (classData: Omit<LiveClass, 'id' | 'status'>) => {
    const newClass: LiveClass = {
      ...classData,
      id: `lc-${Date.now()}`,
      status: 'Upcoming'
    };
    setLiveClasses(prev => [newClass, ...prev]);
    apiPost<LiveClass>('/api/live-classes', newClass).catch(console.error);
  };

  const addRecordedLecture = (lectureData: Omit<RecordedLecture, 'id' | 'viewsCount'>) => {
    const newLecture: RecordedLecture = {
      ...lectureData,
      id: `rec-${Date.now()}`,
      viewsCount: 0
    };
    setRecordedLectures(prev => [newLecture, ...prev]);
    apiPost<RecordedLecture>('/api/lectures', newLecture).catch(console.error);
  };

  const endLiveClass = (classId: string, videoUrl: string) => {
    const liveClass = liveClasses.find(lc => lc.id === classId);
    if (liveClass) {
      // Remove from live classes
      setLiveClasses(prev => prev.filter(lc => lc.id !== classId));
      
      // Add to recorded lectures
      addRecordedLecture({
        title: liveClass.title,
        domain: liveClass.domain,
        week: parseInt(liveClass.batch.split('-').pop() || '1') || 1, // Fallback week
        videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        duration: `${liveClass.durationMinutes}m`,
        pdfNotesUrl: '#'
      });
    }
  };

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('websums_quizzes');
    return saved ? JSON.parse(saved) : INITIAL_QUIZZES;
  });

  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [remoteMentors, remoteStudents, remoteApplications, remoteAssignments, remoteSubmissions, remoteAttendance, remoteClasses, remoteLectures, remoteQuizzes] = await Promise.all([
          apiGet<Mentor[]>('/api/mentors'), apiGet<Student[]>('/api/students'), apiGet<StudentApplication[]>('/api/applications'),
          apiGet<Assignment[]>('/api/assignments'), apiGet<Submission[]>('/api/submissions'), apiGet<DailyAttendanceReport[]>('/api/attendance/reports'),
          apiGet<LiveClass[]>('/api/live-classes'), apiGet<RecordedLecture[]>('/api/lectures'), apiGet<Quiz[]>('/api/quizzes')
        ]);
        setMentors(remoteMentors); setStudents(remoteStudents); setApplications(remoteApplications); setAssignments(remoteAssignments);
        setSubmissions(remoteSubmissions); setAttendanceReports(remoteAttendance); setLiveClasses(remoteClasses); setRecordedLectures(remoteLectures); setQuizzes(remoteQuizzes);
      } catch { /* Keep mock data available until an authenticated API session exists. */ }
    };
    if (localStorage.getItem('websums_user')) loadBackendData();
  }, []);

  useEffect(() => {
    localStorage.setItem('websums_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const updateQuizResult = (quizId: string, score: number, questionsAnswered: number) => {
      apiPost(`/api/quizzes/${quizId}/results`, { score, questionsAnswered }).catch(console.error);
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          const isFullScore = score >= 60;
          return {
            ...q,
            status: isFullScore ? 'Completed' : 'In Progress',
            bestScore: Math.max(q.bestScore || 0, score),
            questionsAnswered: Math.max(q.questionsAnswered || 0, questionsAnswered),
            progressPercent: isFullScore ? 100 : Math.round((questionsAnswered / q.totalQuestions) * 100)
          };
        }
        return q;
      })
    );
    apiPost(`/api/quizzes/${quizId}/results`, { score, questionsAnswered }).catch(console.error);
  };

  const resetData = () => {
    localStorage.removeItem('websums_students');
    localStorage.removeItem('websums_mentors');
    localStorage.removeItem('websums_applications');
    setStudents(INITIAL_STUDENTS);
    setMentors(INITIAL_MENTORS);
    setApplications(INITIAL_APPLICATIONS);
  };

  return (
    <DataContext.Provider
      value={{
        mentors,
        students,
        applications,
        addMentor,
        addStudent,
        updateStudentFee,
        addApplication,
        updateApplicationStatus,
        assignments,
        submissions,
        attendanceReports,
        addAssignment,
        submitAssignment,
        saveAttendanceReport,
        liveClasses,
        recordedLectures,
        addLiveClass,
        endLiveClass,
        addRecordedLecture,
        quizzes,
        updateQuizResult,
        resetData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
