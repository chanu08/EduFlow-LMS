const express = require('express');
const router = express.Router();
const { getStudentAnalytics, getTeacherAnalytics } = require('../controllers/analyticsController');
const { verifyToken, isStudent, isTeacher } = require('../middleware/authenticate');

router.get('/student', verifyToken, isStudent, getStudentAnalytics);
router.get('/teacher', verifyToken, isTeacher, getTeacherAnalytics);

module.exports = router;
