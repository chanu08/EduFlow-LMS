const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSessionsForCourse, createSession, deleteSession } = require('../controllers/liveSessionController');
const { verifyToken, isTeacher } = require('../middleware/authenticate');

router.get('/:courseId/sessions', verifyToken, getSessionsForCourse);
router.post('/:courseId/sessions', verifyToken, isTeacher, createSession);
router.delete('/:courseId/sessions/:sessionId', verifyToken, isTeacher, deleteSession);

module.exports = router;
