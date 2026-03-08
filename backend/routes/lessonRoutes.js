const express = require('express');
const router = express.Router();
const { toggleLessonCompletion, getCompletedLessonsForCourse } = require('../controllers/lessonController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

// Toggle completion for a specific lesson (student only)
router.post('/:lessonId/complete', verifyToken, isStudent, toggleLessonCompletion);

// Get completed lesson IDs for a course for the logged-in student
router.get('/course/:courseId/completed', verifyToken, isStudent, getCompletedLessonsForCourse);

module.exports = router;

