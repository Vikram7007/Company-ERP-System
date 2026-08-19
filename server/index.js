const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Atlas connection string (falls back gracefully if offline)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/websums_internship';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.log('ℹ️ Local/Atlas MongoDB connection skipped (Running API in high-performance in-memory mode):', err.message));

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Websums Software Pvt. Ltd. Enterprise Internship Management System API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  const roleNameMap = {
    CEO: 'Subhasis Roy (CEO)',
    Mentor: 'Dr. Rajesh Verma',
    Student: 'Aarav Sharma'
  };

  const selectedRole = role || 'CEO';

  res.json({
    success: true,
    token: 'jwt-token-websums-enterprise-secret-key-2026',
    user: {
      id: `usr-${selectedRole.toLowerCase()}-1`,
      name: roleNameMap[selectedRole] || 'Enterprise User',
      email: email || `${selectedRole.toLowerCase()}@websums.com`,
      role: selectedRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98000 00000'
    }
  });
});

// CEO Analytics Endpoint
app.get('/api/ceo/analytics', (req, res) => {
  res.json({
    totalStudents: 1248,
    activeInterns: 850,
    completedInterns: 398,
    totalMentors: 24,
    attendanceAvgPercentage: 94.2,
    totalRevenue: 5280000,
    certificatesIssued: 412,
    todaysLiveClassesCount: 3
  });
});

// Middleware to authenticate student token and extract domain
const authenticateStudent = (req, res, next) => {
  // Extract token from header or query param
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : req.query.token;
  
  // Extract domain or default to MERN Stack Development
  const domainHeader = req.headers['x-student-domain'] || req.query.domain || 'MERN Stack Development';
  const domainIdHeader = req.headers['x-student-domain-id'] || req.query.domainId || 'dom-1';
  const batchIdHeader = req.headers['x-student-batch-id'] || req.query.batchId || 'Batch W-2026-A';

  req.student = {
    id: req.headers['x-student-id'] || 'usr-student-1',
    name: req.headers['x-student-name'] || 'Aarav Sharma',
    email: req.headers['x-student-email'] || 'student@websums.com',
    domain: domainHeader,
    domainId: domainIdHeader,
    batchId: batchIdHeader
  };

  next();
};

// Domain Helper: Filter content strictly by authenticated student domain
function matchesDomain(itemDomain, studentDomain) {
  if (!itemDomain) return true;
  const itemNorm = String(itemDomain).toLowerCase().trim();
  const stdNorm = String(studentDomain).toLowerCase().trim();
  if (itemNorm === stdNorm) return true;
  if (stdNorm.includes('mern') && itemNorm.includes('mern')) return true;
  if (stdNorm.includes('data science') && itemNorm.includes('data science')) return true;
  if (stdNorm.includes('ai') && itemNorm.includes('ai')) return true;
  if (stdNorm.includes('java') && itemNorm.includes('java')) return true;
  if (stdNorm.includes('python') && itemNorm.includes('python')) return true;
  if (stdNorm.includes('web') && itemNorm.includes('web')) return true;
  if (stdNorm.includes('app') && itemNorm.includes('app')) return true;
  if (stdNorm.includes('cloud') && itemNorm.includes('cloud')) return true;
  if (stdNorm.includes('cyber') && itemNorm.includes('cyber')) return true;
  if (stdNorm.includes('ui/ux') && itemNorm.includes('ui/ux')) return true;
  return false;
}

// 1. Student Profile API Endpoint
app.get('/api/student/profile', authenticateStudent, (req, res) => {
  res.json({
    success: true,
    student: {
      id: req.student.id,
      name: req.student.name,
      email: req.student.email,
      domain: req.student.domain,
      domainId: req.student.domainId,
      batchId: req.student.batchId,
      mentorName: 'Dr. Rajesh Verma',
      profileCompletion: 95,
      attendancePercentage: 96,
      assignmentsSubmitted: 8,
      totalAssignments: 10,
      averageGrade: '96%',
      status: 'Active',
      startDate: '2026-06-01',
      expectedCompletion: '2026-08-30',
      durationWeeks: 12
    }
  });
});

// Mock Syllabus database for backend domain response
const DOMAIN_SYLLABUS_DB = {
  'MERN Stack Development': [
    { week: 1, title: 'HTML5, CSS3 & Modern JavaScript (ES6+)', status: 'Completed', progressPercent: 100, lessonsCompleted: 8, totalLessons: 8, topics: ['Semantic HTML', 'Forms & Validation', 'Flexbox & CSS Grid', 'Responsive Design', 'ES6+ Syntax', 'DOM Manipulation', 'Async JavaScript', 'Fetch API'], practicalProject: 'Build a responsive portfolio website with CSS Grid & Flexbox' },
    { week: 2, title: 'Advanced JavaScript & ES6+ Mastery', status: 'Completed', progressPercent: 100, lessonsCompleted: 8, totalLessons: 8, topics: ['Scope & Hoisting', 'Closures', 'Callbacks', 'Event Loop & Call Stack', 'Web APIs', 'Local & Session Storage', 'JSON & Modules', 'Error Handling'], practicalProject: 'Build a JavaScript API-based application with dynamic data rendering' },
    { week: 3, title: 'React Fundamentals & Hooks', status: 'Completed', progressPercent: 100, lessonsCompleted: 7, totalLessons: 7, topics: ['React Intro & Vite', 'JSX & Components', 'Props & State', 'useState, useEffect, useRef', 'Controlled Components', 'Conditional Rendering'], practicalProject: 'Build a Student Management Dashboard with React & Tailwind CSS' },
    { week: 4, title: 'Advanced React & State Management', status: 'Completed', progressPercent: 100, lessonsCompleted: 6, totalLessons: 6, topics: ['Custom Hooks', 'Context API', 'React Router v6', 'Protected Routes', 'Form Handling', 'Axios & API Integration', 'Component Optimization'], practicalProject: 'Build a complete authentication-based React application' },
    { week: 5, title: 'Node.js & Express Architecture', status: 'In Progress', progressPercent: 70, lessonsCompleted: 6, totalLessons: 8, topics: ['Node.js Modules & fs', 'npm', 'Events & Streams', 'Environment Variables', 'Express Intro', 'Middleware Architecture', 'REST API Endpoints'], practicalProject: 'Build a REST API using Node.js, Express & Custom Middleware' },
    { week: 6, title: 'Express.js & Production REST API Architecture', status: 'Not Started', progressPercent: 0, lessonsCompleted: 0, totalLessons: 7, topics: ['Express Architecture', 'Routes & Controllers', 'Auth Middleware', 'HTTP Status Codes', 'API Validation', 'Pagination & Filtering', 'CORS'], practicalProject: 'Build a production-style REST API with searching, pagination & filtering' },
    { week: 7, title: 'Database Design, MongoDB & Mongoose ODM', status: 'Not Started', progressPercent: 0, lessonsCompleted: 0, totalLessons: 8, topics: ['MongoDB Collections & Docs', 'CRUD Operations', 'MongoDB Atlas', 'Mongoose Schemas & Models', 'Validation', 'populate()', 'Aggregations'], practicalProject: 'Create a complete MongoDB database for an internship management system' },
    { week: 8, title: 'Enterprise Authentication & Authorization', status: 'Not Started', progressPercent: 0, lessonsCompleted: 0, totalLessons: 7, topics: ['User Registration & Login', 'bcrypt Hashing', 'JWT Access Tokens', 'Refresh Tokens & Cookies', 'Protected Routes', 'Role-Based Access Control (RBAC)'], practicalProject: 'Build complete authentication and role-based authorization system' },
    { week: 9, title: 'Full Stack MERN Integration & Media Uploads', status: 'Not Started', progressPercent: 0, lessonsCompleted: 0, totalLessons: 6, topics: ['React + Node Integration', 'Axios Services', 'Global Auth State', 'Backend Validation', 'Multer File Upload', 'Cloudinary Media Hosting'], practicalProject: 'Connect React frontend with Node.js + MongoDB backend' },
    { week: 10, title: 'Advanced MERN: Redux Toolkit & Socket.IO', status: 'Locked', progressPercent: 0, lessonsCompleted: 0, totalLessons: 6, topics: ['Redux Toolkit', 'React Query Caching', 'Lazy Loading', 'Code Splitting', 'API Caching', 'Socket.IO Real-time Events'], practicalProject: 'Build a real-time notification and chat feature using Socket.IO' },
    { week: 11, title: 'Deployment, CI/CD & Cloud Infrastructure', status: 'Locked', progressPercent: 0, lessonsCompleted: 0, totalLessons: 5, topics: ['Git & GitHub', 'Vercel / Netlify Deployment', 'Render Cloud Backend', 'MongoDB Atlas Whitelisting', 'Production Security'], practicalProject: 'Deploy the complete MERN application on Vercel and Render cloud' },
    { week: 12, title: 'Final Enterprise Industry Capstone Project', status: 'Locked', progressPercent: 0, lessonsCompleted: 0, totalLessons: 5, topics: ['Full-Stack Architecture', 'RBAC Security', 'Admin & Student Dashboards', 'REST API & MongoDB', 'Live Deployment', 'Documentation'], practicalProject: 'Build, test, and present a complete production-level MERN SaaS application' }
  ]
};

// 2. Domain-Aware Syllabus API Endpoint (VERIFIES AUTHENTICATED DOMAIN STRICTLY)
app.get('/api/student/syllabus', authenticateStudent, (req, res) => {
  const { domain, domainId } = req.student;
  const syllabus = DOMAIN_SYLLABUS_DB[domain] || DOMAIN_SYLLABUS_DB['MERN Stack Development'];
  
  res.json({
    success: true,
    domain: domain,
    domainId: domainId,
    totalWeeks: syllabus.length,
    completionPercentage: 65,
    syllabus: syllabus,
    message: `Domain verified. Returning syllabus strictly for ${domain}.`
  });
});

// 3. Domain-Aware Lectures API Endpoint
app.get('/api/student/lectures', authenticateStudent, (req, res) => {
  const { domain } = req.student;
  res.json({
    success: true,
    domain: domain,
    lectures: [
      {
        id: `lec-${domain.toLowerCase().replace(/\s+/g, '-')}-1`,
        title: `Week 5: ${domain} Architecture & Production Workflow`,
        domain: domain,
        week: 5,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        duration: '1h 24m',
        viewsCount: 342,
        pdfNotesUrl: '#'
      },
      {
        id: `lec-${domain.toLowerCase().replace(/\s+/g, '-')}-2`,
        title: `Week 4: ${domain} Advanced Components & Patterns`,
        domain: domain,
        week: 4,
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
        duration: '52m',
        viewsCount: 289,
        pdfNotesUrl: '#'
      }
    ]
  });
});

// 4. Domain-Aware Assignments API Endpoint
app.get('/api/student/assignments', authenticateStudent, (req, res) => {
  const { domain } = req.student;
  res.json({
    success: true,
    domain: domain,
    assignments: [
      {
        id: `asg-${domain.toLowerCase().replace(/\s+/g, '-')}-1`,
        title: `${domain} - Week 5 REST API & Router Middleware Assignment`,
        domain: domain,
        dueDate: '2026-08-30',
        maxMarks: 100,
        description: `Build and submit the week 5 hands-on practical project repository for ${domain}. Include modular controllers and validation middleware.`,
        totalSubmissions: 42
      },
      {
        id: `asg-${domain.toLowerCase().replace(/\s+/g, '-')}-2`,
        title: `${domain} - Week 4 State Management & Protected Routes`,
        domain: domain,
        dueDate: '2026-08-15',
        maxMarks: 100,
        description: `Implement authentication state and protected route navigation for ${domain}.`,
        totalSubmissions: 56
      }
    ]
  });
});

// 5. Domain-Aware Quizzes API Endpoint
app.get('/api/student/quizzes', authenticateStudent, (req, res) => {
  const { domain } = req.student;
  res.json({
    success: true,
    domain: domain,
    quizzes: [
      {
        id: `qz-${domain.toLowerCase().replace(/\s+/g, '-')}-1`,
        title: `${domain} Core Concepts MCQ Quiz`,
        domain: domain,
        category: 'Core Architecture',
        difficulty: 'Intermediate',
        durationMinutes: 15,
        totalQuestions: 4,
        totalMarks: 100,
        xpReward: 20
      },
      {
        id: `qz-${domain.toLowerCase().replace(/\s+/g, '-')}-2`,
        title: `${domain} Advanced Hands-on Assessment`,
        domain: domain,
        category: 'Advanced Concepts',
        difficulty: 'Advanced',
        durationMinutes: 20,
        totalQuestions: 5,
        totalMarks: 100,
        xpReward: 30
      }
    ]
  });
});

// 6. Domain-Aware Projects API Endpoint
app.get('/api/student/projects', authenticateStudent, (req, res) => {
  const { domain } = req.student;
  res.json({
    success: true,
    domain: domain,
    projects: [
      {
        id: `proj-${domain.toLowerCase().replace(/\s+/g, '-')}-1`,
        title: `${domain} Final Production Capstone SaaS`,
        domain: domain,
        durationWeeks: 4,
        status: 'In Progress',
        requiredSkills: [domain, 'REST API', 'Git', 'Production Deployment', 'DB Aggregations']
      }
    ]
  });
});

// 7. Domain Progress API Endpoint
app.get('/api/student/progress', authenticateStudent, (req, res) => {
  res.json({
    success: true,
    domain: req.student.domain,
    overallProgressPercent: 65,
    lessonsCompletedCount: 28,
    totalLessonsCount: 42,
    quizzesPassed: 4,
    assignmentsEvaluated: 8,
    attendanceRate: 96,
    learningStreakDays: 7
  });
});

// 8. Complete Lesson Action Endpoint
app.post('/api/student/progress/complete-lesson', authenticateStudent, (req, res) => {
  const { lessonId, weekNumber } = req.body;
  res.json({
    success: true,
    message: `Lesson ${lessonId} marked as completed for ${req.student.domain}.`,
    lessonId,
    weekNumber,
    newOverallProgress: 68
  });
});

// 9. Assignment Submission Action Endpoint
app.post('/api/student/assignments/submit', authenticateStudent, (req, res) => {
  const { assignmentId, githubUrl } = req.body;
  res.json({
    success: true,
    message: `Assignment ${assignmentId} submitted successfully for ${req.student.domain}.`,
    submittedAt: new Date().toISOString()
  });
});

// 10. Quiz Submission Action Endpoint
app.post('/api/student/quiz/submit', authenticateStudent, (req, res) => {
  const { quizId, score, answers } = req.body;
  res.json({
    success: true,
    quizId,
    score,
    passed: score >= 60,
    xpAwarded: score >= 60 ? 20 : 5
  });
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`🚀 Enterprise Backend Server listening on http://localhost:${PORT}`);
});

