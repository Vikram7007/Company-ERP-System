const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { store, id, publicUser } = require('../utils/store');
const { authenticate, authorize, signToken } = require('../middleware/authMiddleware');

const router = express.Router();
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });
const find = (collection, value) => collection.find((item) => item.id === value);
const add = (collection, data, prefix) => { const item = { id: id(prefix), createdAt: new Date().toISOString(), ...data }; collection.push(item); return item; };
const update = (collection, item, body) => Object.assign(item, body, { updatedAt: new Date().toISOString() });
const remove = (collection, item) => collection.splice(collection.indexOf(item), 1);
const query = (collection, req) => collection.filter((item) => Object.entries(req.query).every(([key, value]) => !value || String(item[key]).toLowerCase() === String(value).toLowerCase()));
const passwordOtps = new Map();
const sendPasswordEmail = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM_EMAIL) throw new Error('Email service is not configured');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_PORT) === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });
  await transporter.sendMail({
    from: SMTP_FROM_EMAIL,
    to: email,
    subject: 'Websums Mentor Password Reset OTP',
    text: `Your Websums mentor password reset OTP is ${otp}. It expires in 10 minutes.`
  });
};

router.post('/auth/register', async (req, res) => {
  const { name, email, password, role = 'Student', phone, domain, batch } = req.body;
  if (!name || !email || !password) return fail(res, 'name, email and password are required');
  if (role !== 'Student') return fail(res, 'Only Student registration is allowed. Mentors must be added by a CEO.');
  if (store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return fail(res, 'Email is already registered', 409);
  const user = { id: id('usr'), name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role, phone, domain, batch };
  store.users.push(user);
  if (role === 'Student') add(store.students, { userId: user.id, name, email: user.email, phone, domain, batch, status: 'Pending', feeDetails: { totalFee: 0, paidAmount: 0, pendingAmount: 0, status: 'Pending', transactions: [] } }, 'std');
  ok(res, { token: signToken(user), user: publicUser(user) }, 201);
});

router.post('/auth/request-password-otp', async (req, res) => {
  const { email, role } = req.body;
  const user = store.users.find((item) => item.email === String(email || '').toLowerCase() && item.role === role);
  if (!user || role !== 'Mentor') return fail(res, 'Mentor email does not match any account', 404);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  passwordOtps.set(user.id, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  try {
    await sendPasswordEmail(user.email, otp);
    ok(res, { message: 'OTP sent to the registered email' });
  } catch {
    passwordOtps.delete(user.id);
    fail(res, 'OTP could not be sent. Configure the email delivery service and try again.', 503);
  }
});

router.post('/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword, role } = req.body;
  const user = store.users.find((item) => item.email === String(email || '').toLowerCase() && item.role === role);
  const reset = user && passwordOtps.get(user.id);
  if (!user || role !== 'Mentor' || !reset || reset.expiresAt < Date.now() || reset.otp !== String(otp || '')) return fail(res, 'Invalid or expired OTP', 400);
  if (!newPassword || String(newPassword).length < 6) return fail(res, 'New password must be at least 6 characters');

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  passwordOtps.delete(user.id);
  ok(res, { message: 'Password changed successfully' });
});

router.post('/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  const user = store.users.find((item) => item.email === String(email || '').toLowerCase());
  if (!user || (role && user.role !== role) || !(await bcrypt.compare(password || '', user.passwordHash))) return fail(res, 'Invalid email, password or role', 401);
  ok(res, { token: signToken(user), user: publicUser(user) });
});
router.get('/auth/me', authenticate, (req, res) => ok(res, { user: publicUser(req.user) }));
router.post('/auth/logout', authenticate, (req, res) => ok(res, { message: 'Logged out successfully' }));
router.post('/auth/forgot-password', (req, res) => ok(res, { message: 'If the account exists, password reset instructions will be sent.' }));

router.get('/domains', (req, res) => ok(res, query(store.domains, req)));
router.get('/domains/:id', (req, res) => { const item = find(store.domains, req.params.id); return item ? ok(res, item) : fail(res, 'Domain not found', 404); });
router.post('/domains', authenticate, authorize('CEO'), (req, res) => ok(res, add(store.domains, req.body, 'dom'), 201));
router.patch('/domains/:id', authenticate, authorize('CEO'), (req, res) => { const item = find(store.domains, req.params.id); return item ? ok(res, update(store.domains, item, req.body)) : fail(res, 'Domain not found', 404); });

router.get('/students', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, query(store.students, req)));
router.get('/students/me', authenticate, (req, res) => ok(res, store.students.find((item) => item.userId === req.user.id) || null));
router.get('/students/:id', authenticate, (req, res) => { const item = find(store.students, req.params.id); return item ? ok(res, item) : fail(res, 'Student not found', 404); });
router.post('/students', authenticate, authorize('CEO'), (req, res) => {
  const student = add(store.students, { ...req.body, status: req.body.status || 'Active', feeDetails: { totalFee: Number(req.body.totalFee || 0), paidAmount: Number(req.body.paidAmount || 0), pendingAmount: Math.max(0, Number(req.body.totalFee || 0) - Number(req.body.paidAmount || 0)), status: Number(req.body.paidAmount || 0) >= Number(req.body.totalFee || 0) ? 'Paid' : 'Pending', transactions: [] } }, 'std');
  ok(res, student, 201);
});
router.patch('/students/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.students, req.params.id); return item ? ok(res, update(store.students, item, req.body)) : fail(res, 'Student not found', 404); });
router.post('/students/:id/payments', authenticate, authorize('CEO'), (req, res) => {
  const student = find(store.students, req.params.id); const amount = Number(req.body.amount || req.body.additionalPayment || 0);
  if (!student) return fail(res, 'Student not found', 404); if (amount <= 0) return fail(res, 'Payment amount must be greater than zero');
  const fee = student.feeDetails || { totalFee: 0, paidAmount: 0, pendingAmount: 0, transactions: [] };
  fee.paidAmount += amount; fee.pendingAmount = Math.max(0, fee.totalFee - fee.paidAmount); fee.status = fee.pendingAmount === 0 ? 'Paid' : 'Pending';
  fee.transactions.push({ id: id('tx'), amount, date: new Date().toISOString(), paymentMode: req.body.paymentMode || 'Other', notes: req.body.notes || '' });
  student.feeDetails = fee; ok(res, student);
});

router.get('/mentors', authenticate, (req, res) => ok(res, query(store.mentors, req)));
router.get('/mentors/:id', authenticate, (req, res) => { const item = find(store.mentors, req.params.id); return item ? ok(res, item) : fail(res, 'Mentor not found', 404); });
router.post('/mentors', authenticate, authorize('CEO'), async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return fail(res, 'name, email and phone are required');

  const normalizedEmail = email.toLowerCase();
  if (store.users.some((user) => user.email === normalizedEmail)) return fail(res, 'Email is already registered', 409);

  const user = {
    id: id('usr'),
    name,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(phone, 10),
    role: 'Mentor',
    phone
  };
  store.users.push(user);

  const mentor = add(store.mentors, {
    ...req.body,
    userId: user.id,
    email: normalizedEmail,
    status: req.body.status || 'Active'
  }, 'mnt');
  ok(res, mentor, 201);
});
router.patch('/mentors/:id', authenticate, authorize('CEO'), (req, res) => { const item = find(store.mentors, req.params.id); return item ? ok(res, update(store.mentors, item, req.body)) : fail(res, 'Mentor not found', 404); });

router.get('/applications', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, query(store.applications, req)));
router.post('/applications', (req, res) => ok(res, add(store.applications, { ...req.body, status: 'Pending' }, 'app'), 201));
router.patch('/applications/:id/status', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.applications, req.params.id); return item ? ok(res, update(store.applications, item, { status: req.body.status, reviewNotes: req.body.reviewNotes, reviewedBy: req.user.id })) : fail(res, 'Application not found', 404); });

router.get('/assignments', authenticate, (req, res) => ok(res, query(store.assignments, req)));
router.post('/assignments', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.assignments, { ...req.body, createdBy: req.user.id, status: 'Published' }, 'asg'), 201));
router.patch('/assignments/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.assignments, req.params.id); return item ? ok(res, update(store.assignments, item, req.body)) : fail(res, 'Assignment not found', 404); });
router.get('/submissions', authenticate, (req, res) => ok(res, query(store.submissions, req)));
router.post('/assignments/:id/submissions', authenticate, authorize('Student'), (req, res) => ok(res, add(store.submissions, { ...req.body, assignmentId: req.params.id, studentId: req.user.id, status: 'Submitted', submittedAt: new Date().toISOString() }, 'sub'), 201));
router.patch('/submissions/:id/grade', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.submissions, req.params.id); return item ? ok(res, update(store.submissions, item, { marks: req.body.marks, feedback: req.body.feedback, status: 'Graded', gradedBy: req.user.id })) : fail(res, 'Submission not found', 404); });

router.get('/attendance/reports', authenticate, (req, res) => ok(res, query(store.attendance, req)));
router.post('/attendance/reports', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.attendance, { ...req.body, recordedBy: req.user.id }, 'att'), 201));
router.patch('/attendance/reports/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.attendance, req.params.id); return item ? ok(res, update(store.attendance, item, req.body)) : fail(res, 'Attendance report not found', 404); });

router.get('/live-classes', authenticate, (req, res) => ok(res, query(store.liveClasses, req)));
router.post('/live-classes', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.liveClasses, { ...req.body, createdBy: req.user.id, status: req.body.status || 'Scheduled' }, 'class'), 201));
router.patch('/live-classes/:id/end', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.liveClasses, req.params.id); return item ? ok(res, update(store.liveClasses, item, { status: 'Completed', endedAt: new Date().toISOString() })) : fail(res, 'Live class not found', 404); });

router.get('/lectures', authenticate, (req, res) => ok(res, query(store.lectures, req)));
router.post('/lectures', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.lectures, { ...req.body, uploadedBy: req.user.id, status: 'Published' }, 'lec'), 201));
router.patch('/lectures/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.lectures, req.params.id); return item ? ok(res, update(store.lectures, item, req.body)) : fail(res, 'Lecture not found', 404); });

router.get('/quizzes', authenticate, (req, res) => ok(res, query(store.quizzes, req)));
router.post('/quizzes', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.quizzes, { ...req.body, createdBy: req.user.id }, 'quiz'), 201));
router.post('/quizzes/:id/results', authenticate, authorize('Student'), (req, res) => { const quiz = find(store.quizzes, req.params.id); if (!quiz) return fail(res, 'Quiz not found', 404); const result = add(quiz.results || (quiz.results = []), { ...req.body, studentId: req.user.id }, 'result'); return ok(res, result, 201); });

router.get('/certificates', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, store.certificates));
router.post('/certificates', authenticate, authorize('CEO'), (req, res) => ok(res, add(store.certificates, { ...req.body, certificateCode: req.body.certificateCode || `WEB-${Date.now()}`, issuedBy: req.user.id, issuedAt: new Date().toISOString() }, 'cert'), 201));
router.get('/certificates/verify/:code', (req, res) => { const item = store.certificates.find((certificate) => certificate.certificateCode === req.params.code); return item ? ok(res, { valid: true, certificate: item }) : ok(res, { valid: false, certificate: null }); });

router.get('/announcements', (req, res) => ok(res, query(store.announcements, req)));
router.post('/announcements', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.announcements, { ...req.body, createdBy: req.user.id }, 'ann'), 201));
router.patch('/announcements/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.announcements, req.params.id); return item ? ok(res, update(store.announcements, item, req.body)) : fail(res, 'Announcement not found', 404); });
router.delete('/announcements/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.announcements, req.params.id); if (!item) return fail(res, 'Announcement not found', 404); remove(store.announcements, item); return ok(res, { message: 'Announcement deleted' }); });

router.get('/jobs', (req, res) => ok(res, store.jobs));
router.post('/jobs', authenticate, authorize('CEO'), (req, res) => ok(res, add(store.jobs, { ...req.body, status: req.body.status || 'Open' }, 'job'), 201));
router.patch('/jobs/:id', authenticate, authorize('CEO'), (req, res) => { const item = find(store.jobs, req.params.id); return item ? ok(res, update(store.jobs, item, req.body)) : fail(res, 'Job not found', 404); });
router.delete('/jobs/:id', authenticate, authorize('CEO'), (req, res) => { const item = find(store.jobs, req.params.id); if (!item) return fail(res, 'Job not found', 404); remove(store.jobs, item); return ok(res, { message: 'Job deleted' }); });

router.get('/stats', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, { students: store.students.length, mentors: store.mentors.length, applications: store.applications.length, assignments: store.assignments.length, revenue: store.students.reduce((sum, student) => sum + Number(student.feeDetails?.paidAmount || 0), 0) }));

module.exports = router;
