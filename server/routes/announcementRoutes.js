const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.post('/', authenticate, createAnnouncement);

module.exports = router;
