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

const persistStore = async () => {
  if (mongoose.connection.readyState !== 1) return;
  await StoreSnapshot.findOneAndUpdate(
    { key: 'internship-store' },
    { key: 'internship-store', data: store },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const ensureCeoAccount = async () => {
  const ceoEmail = 'websumssoftware@gmail.com';
  let ceo = store.users.find((u) => u.email.toLowerCase() === ceoEmail && u.role === 'CEO');
  if (!ceo) {
    store.users.push({
      id: 'usr-ceo-shriram-thorat',
      name: 'Shriram Thorat',
      email: ceoEmail,
      phone: '9822122101',
      passwordHash: await bcrypt.hash('12345678', 10),
      role: 'CEO'
    });
    return true;
  }
  return false;
};

const initializeStore = async () => {
  if (mongoose.connection.readyState === 1) {
    const snapshot = await StoreSnapshot.findOne({ key: 'internship-store' }).lean();
    if (snapshot?.data) {
      Object.assign(store, snapshot.data);
      store.users = Array.isArray(snapshot.data.users) ? snapshot.data.users : [];
      const addedCeo = await ensureCeoAccount();
      if (addedCeo) await persistStore();
      console.log('MongoDB data loaded (users count: ' + store.users.length + ')');
      return;
    }
  }

  store.users = [];
  await ensureCeoAccount();
  store.domains.push(
    { id: 'dom-mern', name: 'MERN Stack Development', description: 'Full-stack JavaScript development', duration: '6 months', status: 'Active', syllabus: [] },
    { id: 'dom-java', name: 'Full Stack Java Development', description: 'Enterprise Java and web development', duration: '6 months', status: 'Active', syllabus: [] },
    { id: 'dom-python', name: 'Python Data Science', description: 'Python, analytics and machine learning', duration: '6 months', status: 'Active', syllabus: [] }
  );
  store.students.push({ id: 'std-101', userId: '', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', domain: 'MERN Stack Development', batch: 'Batch W-2026-A', mentorName: '', college: 'IIT Delhi', status: 'Active', feeDetails: { totalFee: 15000, paidAmount: 15000, pendingAmount: 0, status: 'Paid', transactions: [] } });
  store.announcements.push({ id: id('ann'), title: 'Welcome to Websums Internship Program', content: 'Your learning journey starts here.', audience: 'All', createdBy: 'usr-ceo-shriram-thorat', createdAt: new Date().toISOString() });
  await persistStore();
};

module.exports = { store, id, publicUser, initializeStore, persistStore };
