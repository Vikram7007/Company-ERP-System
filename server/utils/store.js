const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const StoreSnapshot = mongoose.models.StoreSnapshot || mongoose.model('StoreSnapshot', new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true }));

const id = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

const store = {
  users: [],
  domains: [],
  students: [],
  mentors: [],
  applications: [],
  assignments: [],
  submissions: [],
  attendance: [],
  liveClasses: [],
  lectures: [],
  quizzes: [],
  certificates: [],
  announcements: [],
  jobs: []
};

const publicUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const ensureRequestedCeo = async () => {
  const email = 'websumssoftware@gmail.com';
  if (store.users.some((user) => user.email.toLowerCase() === email)) return false;

  store.users.push({
    id: 'usr-ceo-shriram-thorat',
    name: 'Shriram Thorat',
    email,
    passwordHash: await bcrypt.hash('12345678', 10),
    role: 'CEO'
  });
  return true;
};

const removeLegacyDemoUsers = () => {
  const legacyEmails = new Set(['ceo@websums.com', 'vikram.lale@websums.com', 'aarav.sharma@example.com']);
  const originalCount = store.users.length;
  store.users = store.users.filter((user) => !legacyEmails.has(user.email.toLowerCase()));
  return store.users.length !== originalCount;
};

const removeAllMentorCredentials = () => {
  const originalCount = store.users.length;
  store.users = store.users.filter((user) => user.role !== 'Mentor');
  return store.users.length !== originalCount;
};

const persistStore = async () => {
  if (mongoose.connection.readyState !== 1) return;
  await StoreSnapshot.findOneAndUpdate(
    { key: 'internship-store' },
    { key: 'internship-store', data: store },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const initializeStore = async () => {
  if (store.users.length) return;

  if (mongoose.connection.readyState === 1) {
    const snapshot = await StoreSnapshot.findOne({ key: 'internship-store' }).lean();
    if (snapshot?.data?.users?.length) {
      Object.assign(store, snapshot.data);
      const removedLegacyUsers = removeLegacyDemoUsers();
      const removedMentorCredentials = removeAllMentorCredentials();
      const addedRequestedCeo = await ensureRequestedCeo();
      if (removedLegacyUsers || removedMentorCredentials || addedRequestedCeo) await persistStore();
      console.log('MongoDB data loaded');
      return;
    }
  }

  store.users.push(
    { id: 'usr-ceo-shriram-thorat', name: 'Shriram Thorat', email: 'websumssoftware@gmail.com', passwordHash: await bcrypt.hash('12345678', 10), role: 'CEO' }
  );
  store.domains.push(
    { id: 'dom-mern', name: 'MERN Stack Development', description: 'Full-stack JavaScript development', duration: '6 months', status: 'Active', syllabus: [] },
    { id: 'dom-java', name: 'Full Stack Java Development', description: 'Enterprise Java and web development', duration: '6 months', status: 'Active', syllabus: [] },
    { id: 'dom-python', name: 'Python Data Science', description: 'Python, analytics and machine learning', duration: '6 months', status: 'Active', syllabus: [] }
  );
  store.mentors.push({ id: 'mnt-1', userId: 'usr-mentor-1', name: 'Vikram Lale', email: 'vikram.lale@websums.com', phone: '+91 98000 22233', assignedDomains: ['MERN Stack Development'], activeBatches: ['Batch W-2026-A'], status: 'Active', rating: 4.9 });
  store.students.push({ id: 'std-101', userId: 'usr-student-1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', domain: 'MERN Stack Development', batch: 'Batch W-2026-A', mentorName: 'Vikram Lale', college: 'IIT Delhi', status: 'Active', feeDetails: { totalFee: 15000, paidAmount: 15000, pendingAmount: 0, status: 'Paid', transactions: [] } });
  store.announcements.push({ id: id('ann'), title: 'Welcome to Websums Internship Program', content: 'Your learning journey starts here.', audience: 'All', createdBy: 'usr-ceo-1', createdAt: new Date().toISOString() });
  await persistStore();
};

module.exports = { store, id, publicUser, initializeStore, persistStore };
