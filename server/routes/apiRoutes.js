const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const { store, id, publicUser, persistStore } = require('../utils/store');
const { authenticate, authorize, signToken } = require('../middleware/authMiddleware');

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'throwawaymail.com', 'yopmail.com', 'trashmail.com',
  'dispostable.com', 'getairmail.com', 'fakeinbox.com', 'mytemp.email',
  'example.com', 'test.com', 'fake.com', 'temp.com'
]);

const verifyEmailOriginality = async (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email address format' };
  }

  const parts = email.split('@');
  const domain = parts[1].toLowerCase();

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, message: `Disposable or temporary email domains (@${domain}) are not permitted. Please provide an active, genuine email address.` };
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, message: `Email domain "@${domain}" does not have active MX mail exchanger records. Please provide a genuine email with valid mail server.` };
    }
    return { valid: true, domain, mx: mxRecords[0].exchange };
  } catch (err) {
    return { valid: false, message: `Domain "@${domain}" appears non-existent or has no active mail server. Only genuine, verifiable email addresses are accepted.` };
  }
};

const mentorVerificationCodes = new Map();

const sendMentorVerificationEmail = async (email, otp, mentorName) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM_EMAIL) {
    throw new Error('Email service is not configured');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });

  await transporter.sendMail({
    from: `"Websums Portal" <${SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Websums Mentor Onboarding: Verify Your Email Address',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #fed7aa; border-radius: 20px; box-shadow: 0 10px 25px rgba(255,118,0,0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ff7600; margin: 0; font-size: 24px; font-weight: 800;">Websums Software Pvt. Ltd.</h2>
          <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">Enterprise ERP & Internship Management</p>
        </div>
        <div style="background: #fffaf5; border: 1px solid #ffedd5; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 17px; font-weight: 700;">Mentor Email Verification</h3>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            Hello <strong>${mentorName || 'Mentor'}</strong>,<br/>
            You are being registered as a Senior Mentor on the Websums Enterprise Portal by the CEO.
          </p>
          <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">Your 6-digit email verification code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ff7600; background: #ffffff; padding: 12px 28px; border-radius: 12px; border: 2px dashed #ff7600; box-shadow: 0 4px 12px rgba(255,118,0,0.12);">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
            This OTP verifies that this email address is authentic and active. Valid for 10 minutes.
          </p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
          Websums Software Pvt. Ltd. • All Rights Reserved
        </div>
      </div>
    `
  });
};

const router = express.Router();
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });
const find = (collection, value) => collection.find((item) => item.id === value);
const add = (collection, data, prefix) => { const item = { id: id(prefix), createdAt: new Date().toISOString(), ...data }; collection.push(item); return item; };
const update = (collection, item, body) => Object.assign(item, body, { updatedAt: new Date().toISOString() });
const remove = (collection, item) => collection.splice(collection.indexOf(item), 1);
const query = (collection, req) => collection.filter((item) => Object.entries(req.query).every(([key, value]) => !value || String(item[key]).toLowerCase() === String(value).toLowerCase()));
const passwordOtps = new Map();
const sendPasswordEmail = async (email, otp, role = 'User') => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM_EMAIL) throw new Error('Email service is not configured');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });
  await transporter.sendMail({
    from: `"Websums Portal" <${SMTP_FROM_EMAIL}>`,
    to: email,
    subject: `Websums ${role} Password Reset OTP`,
    text: `Your Websums ${role} password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, please ignore this email.`
  });
};

router.post('/auth/register', async (req, res) => {
  const { name, email, password, role = 'Student', phone, domain, batch } = req.body;
  if (!name || !email || !password) return fail(res, 'name, email and password are required');
  if (role !== 'Student') return fail(res, 'Only Student registration is allowed. Mentors must be added by a CEO.');
  const assignedDomain = domain || 'MERN Stack Development';
  const assignedBatch = batch || 'Batch W-2026-A';
  const user = { id: id('usr'), name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role, phone: phone || '', domain: assignedDomain, batch: assignedBatch };
  store.users.push(user);
  if (role === 'Student') add(store.students, { userId: user.id, name, email: user.email, phone: phone || '', domain: assignedDomain, batch: assignedBatch, college: 'Engineering Institute', status: 'Active', feeDetails: { totalFee: 15000, paidAmount: 0, pendingAmount: 15000, status: 'Unpaid', transactions: [] } }, 'std');
  await persistStore();
  ok(res, { token: signToken(user), user: publicUser(user) }, 201);
});

router.post('/auth/request-password-otp', async (req, res) => {
  const { email, role } = req.body;
  const user = store.users.find((item) => item.email === String(email || '').toLowerCase() && (!role || item.role === role));
  if (!user) return fail(res, `${role || 'Account'} email does not match any registered account`, 404);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  passwordOtps.set(user.id, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  try {
    await sendPasswordEmail(user.email, otp, user.role);
    ok(res, { message: 'OTP sent to the registered email' });
  } catch (err) {
    passwordOtps.delete(user.id);
    console.error('Email send error:', err.message);
    fail(res, 'OTP could not be sent. Email service error: ' + err.message, 503);
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;
    const user = store.users.find((item) => item.email === String(email || '').toLowerCase() && (!role || item.role === role));
    const reset = user && passwordOtps.get(user.id);
    if (!user || !reset || reset.expiresAt < Date.now() || reset.otp !== String(otp || '').trim()) {
      return fail(res, 'Invalid or expired OTP', 400);
    }
    if (!newPassword || String(newPassword).length < 6) return fail(res, 'New password must be at least 6 characters');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    passwordOtps.delete(user.id);
    await persistStore();
    ok(res, { message: 'Password changed successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    fail(res, err.message || 'Failed to reset password', 500);
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  const user = store.users.find((item) => item.email === String(email || '').trim().toLowerCase());
  if (!user || (role && user.role !== role)) return fail(res, 'Invalid email, password or role', 401);

  const cleanInputPass = String(password || '').trim();
  let isHashMatch = await bcrypt.compare(cleanInputPass, user.passwordHash).catch(() => false);

  // For mentors, password is set to their phone number. Allow digits-only comparison for flexibility
  if (!isHashMatch && user.role === 'Mentor' && user.phone) {
    const inputDigits = cleanInputPass.replace(/\D/g, '');
    const userPhoneDigits = String(user.phone).replace(/\D/g, '');
    if (inputDigits.length >= 8 && userPhoneDigits.length >= 8) {
      if (inputDigits === userPhoneDigits || inputDigits === userPhoneDigits.slice(-10) || userPhoneDigits === inputDigits.slice(-10)) {
        isHashMatch = true;
      }
    }
  }

  if (!isHashMatch) {
    return fail(res, 'Invalid email, password or role', 401);
  }

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
router.post('/students', authenticate, authorize('CEO', 'Mentor'), async (req, res) => {
  const normalizedEmail = String(req.body.email || '').toLowerCase().trim();
  let user = store.users.find(u => u.email === normalizedEmail);
  if (!user && normalizedEmail) {
    const rawPhone = String(req.body.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\s+/g, '') || 'student123';
    user = {
      id: id('usr'),
      name: (req.body.name || 'Student').trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(cleanPhone, 10),
      role: 'Student',
      phone: rawPhone,
      domain: req.body.domain || 'MERN Stack Development',
      batch: req.body.batch || 'Batch W-2026-A'
    };
    store.users.push(user);
  }

  const student = add(store.students, {
    ...req.body,
    userId: user ? user.id : req.body.userId || id('usr'),
    email: normalizedEmail,
    status: req.body.status || 'Active',
    feeDetails: {
      totalFee: Number(req.body.totalFee || 0),
      paidAmount: Number(req.body.paidAmount || 0),
      pendingAmount: Math.max(0, Number(req.body.totalFee || 0) - Number(req.body.paidAmount || 0)),
      status: Number(req.body.paidAmount || 0) >= Number(req.body.totalFee || 0) ? 'Paid' : 'Pending',
      transactions: []
    }
  }, 'std');
  await persistStore();
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

// Verify mentor email authenticity (DNS MX check + send OTP)
router.post('/mentors/verify-email-request', authenticate, authorize('CEO'), async (req, res) => {
  const { email, name } = req.body;
  const normalized = String(email || '').trim().toLowerCase();

  if (!normalized) return fail(res, 'Email address is required');

  const check = await verifyEmailOriginality(normalized);
  if (!check.valid) {
    return fail(res, check.message, 400);
  }

  if (store.users.some(u => u.email === normalized)) {
    return fail(res, 'This email address is already registered in the system.', 409);
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  mentorVerificationCodes.set(normalized, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    verified: false
  });

  try {
    await sendMentorVerificationEmail(normalized, otp, name);
    ok(res, {
      message: `Verification OTP sent to ${normalized}. Please check inbox.`,
      domainVerified: true,
      mxServer: check.mx
    });
  } catch (err) {
    console.error('Mentor verification email error:', err.message);
    // If SMTP has network issue in local testing, still provide fallback
    fail(res, 'Could not send verification email. ' + err.message, 503);
  }
});

// Confirm OTP code for mentor email
router.post('/mentors/verify-email-confirm', authenticate, authorize('CEO'), (req, res) => {
  const { email, otp } = req.body;
  const normalized = String(email || '').trim().toLowerCase();
  const entry = mentorVerificationCodes.get(normalized);

  if (!entry) {
    return fail(res, 'No verification request found for this email. Please click "Verify Email" first.', 400);
  }

  if (Date.now() > entry.expiresAt) {
    mentorVerificationCodes.delete(normalized);
    return fail(res, 'Verification code has expired. Please request a new one.', 400);
  }

  if (String(otp || '').trim() !== entry.otp) {
    return fail(res, 'Incorrect verification code. Please check and try again.', 400);
  }

  entry.verified = true;
  const verificationToken = `verified-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  entry.token = verificationToken;

  ok(res, {
    verified: true,
    verificationToken,
    message: 'Email address verified successfully as genuine & original!'
  });
});

router.post('/mentors', authenticate, authorize('CEO'), async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return fail(res, 'name, email and phone are required');

  const normalizedEmail = email.toLowerCase().trim();
  if (store.users.some((user) => user.email === normalizedEmail)) return fail(res, 'Email is already registered', 409);

  // Verify email originality
  const check = await verifyEmailOriginality(normalizedEmail);
  if (!check.valid) {
    return fail(res, check.message, 400);
  }

  // Mentor's mobile number is the login password
  const cleanPhone = String(phone).replace(/\s+/g, '').trim();
  const rawPhone = String(phone).trim();

  const user = {
    id: id('usr'),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(cleanPhone, 10),
    role: 'Mentor',
    phone: rawPhone
  };
  store.users.push(user);

  const mentor = add(store.mentors, {
    ...req.body,
    userId: user.id,
    name: name.trim(),
    email: normalizedEmail,
    phone: rawPhone,
    status: req.body.status || 'Active',
    rating: 5.0,
    totalStudents: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  }, 'mnt');

  mentorVerificationCodes.delete(normalizedEmail);
  await persistStore();

  ok(res, mentor, 201);
});
router.patch('/mentors/:id', authenticate, authorize('CEO'), (req, res) => { const item = find(store.mentors, req.params.id); return item ? ok(res, update(store.mentors, item, req.body)) : fail(res, 'Mentor not found', 404); });
router.delete('/mentors/:id', authenticate, authorize('CEO'), async (req, res) => {
  const mentor = find(store.mentors, req.params.id);
  if (!mentor) return fail(res, 'Mentor not found', 404);
  remove(store.mentors, mentor);
  if (mentor.userId) {
    const user = find(store.users, mentor.userId);
    if (user) remove(store.users, user);
  }
  await persistStore();
  ok(res, { message: 'Mentor deleted successfully' });
});

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
router.patch('/live-classes/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.liveClasses, req.params.id); return item ? ok(res, update(store.liveClasses, item, req.body)) : fail(res, 'Live class not found', 404); });
router.patch('/live-classes/:id/end', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.liveClasses, req.params.id); return item ? ok(res, update(store.liveClasses, item, { status: 'Completed', recordingUrl: req.body.recordingUrl, notesUrl: req.body.notesUrl, notesFileName: req.body.notesFileName, endedAt: new Date().toISOString() })) : fail(res, 'Live class not found', 404); });
router.delete('/live-classes/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.liveClasses, req.params.id); if (!item) return fail(res, 'Live class not found', 404); remove(store.liveClasses, item); return ok(res, { message: 'Live class deleted' }); });

router.get('/lectures', authenticate, (req, res) => ok(res, query(store.lectures, req)));
router.post('/lectures', authenticate, authorize('CEO', 'Mentor'), (req, res) => ok(res, add(store.lectures, { ...req.body, uploadedBy: req.user.id, status: 'Published' }, 'lec'), 201));
router.patch('/lectures/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.lectures, req.params.id); return item ? ok(res, update(store.lectures, item, req.body)) : fail(res, 'Lecture not found', 404); });
router.delete('/lectures/:id', authenticate, authorize('CEO', 'Mentor'), (req, res) => { const item = find(store.lectures, req.params.id); if (!item) return fail(res, 'Lecture not found', 404); remove(store.lectures, item); return ok(res, { message: 'Lecture deleted' }); });

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
