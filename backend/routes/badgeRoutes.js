const express = require('express');
const router = express.Router();
const { getMyBadges, getAllBadges } = require('../controllers/badgeController');
const { verifyToken } = require('../middleware/authenticate');

router.get('/mine', verifyToken, getMyBadges);
router.get('/all', verifyToken, getAllBadges);

module.exports = router;
