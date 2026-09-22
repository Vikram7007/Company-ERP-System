const Domain = require('../models/Domain');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Application = require('../models/Application');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const LiveClass = require('../models/LiveClass');
const RecordedLecture = require('../models/RecordedLecture');
const Quiz = require('../models/Quiz');
const Certificate = require('../models/Certificate');
const Announcement = require('../models/Announcement');

const seedData = async () => {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 Seeding initial Internship System MongoDB collections...');

      // Seed Student
      await Student.create({
        id: 'std-101',
        userId: 'usr-student-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        domain: 'MERN Stack Development',
        batch: 'Batch W-2026-A',
        mentorName: 'Vikram Lale',
        college: 'IIT Delhi',
        githubUrl: 'https://github.com/aarav-sharma',
        linkedinUrl: 'https://linkedin.com/in/aaravsharma',
        feeDetails: {
          totalFee: 15000,
          paidAmount: 15000,
          pendingAmount: 0,
          status: 'Paid',
          transactions: [
            { id: 'tx-1', amount: 15000, date: '2026-06-01', paymentMode: 'UPI / GPay', receiptNo: 'WEB-REC-101' }
          ]
        }
      });

      // Seed Mentor
      await Mentor.create({
        id: 'mnt-2',
        name: 'Vikram Lale',
        email: 'vikram.lale@websums.com',
        phone: '+91 98000 22233',
        assignedDomains: ['MERN Stack Development', 'Full Stack Java Development'],
        activeBatches: ['Batch W-2026-A'],
        totalStudents: 145,
        rating: 4.95
      });

      console.log('✅ Seed completed successfully!');
    }
  } catch (err) {
    console.log('ℹ️ Automatic seed skipped (in-memory mode active):', err.message);
  }
};

module.exports = seedData;
