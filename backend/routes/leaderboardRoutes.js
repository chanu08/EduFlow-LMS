const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getCourseLeaderboard } = require('../controllers/leaderboardController');
const { verifyToken } = require('../middleware/authenticate');

router.get('/global', verifyToken, getGlobalLeaderboard);
router.get('/course/:courseId', verifyToken, getCourseLeaderboard);

module.exports = router;
