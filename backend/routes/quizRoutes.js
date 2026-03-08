const express = require('express');
const router = express.Router();
const {
  createQuizWithQuestions,
  getQuizForStudentByCourse,
  submitQuiz,
} = require('../controllers/quizController');
const { verifyToken, isTeacher, isStudent } = require('../middleware/authenticate');

// Teacher: create a quiz and its questions
router.post('/', verifyToken, isTeacher, createQuizWithQuestions);

// Student: get quiz for a course (no correct answers in payload)
router.get('/course/:courseId', verifyToken, isStudent, getQuizForStudentByCourse);

// Student: submit answers for a quiz
router.post('/:quizId/submit', verifyToken, isStudent, submitQuiz);

module.exports = router;

