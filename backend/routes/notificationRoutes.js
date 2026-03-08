const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authenticate');

router.get('/', verifyToken, getNotifications);
router.put('/read', verifyToken, markAllRead);

module.exports = router;
