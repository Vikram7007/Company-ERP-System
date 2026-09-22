const jwt = require('jsonwebtoken');
const { store } = require('../utils/store');

const getSecret = () => process.env.JWT_SECRET || 'websums-development-secret';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

  try {
    const payload = jwt.verify(token, getSecret());
    const user = store.users.find((item) => item.id === payload.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission for this action' });
  }
  next();
};

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, getSecret(), { expiresIn: '7d' });

module.exports = { authenticate, authorize, signToken };
