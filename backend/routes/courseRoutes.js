const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  enrollInCourse,
  getMyCourses,
  getCourseById,
  getLessonsForCourse,
  createLesson,
} = require('../controllers/courseController');
const { verifyToken, isTeacher, isStudent } = require('../middleware/authenticate');

// Teacher-only: create a new course
router.post('/create', verifyToken, isTeacher, createCourse);

// Teacher-only: create a lesson for a course they own
router.post('/:courseId/lessons', verifyToken, isTeacher, createLesson);

// Student-only: enroll in a course
router.post('/:id/enroll', verifyToken, isStudent, enrollInCourse);

// Student-only: get courses the user is enrolled in
router.get('/my-courses', verifyToken, isStudent, getMyCourses);

// Authenticated: get course details by id
router.get('/:courseId', verifyToken, getCourseById);

// Authenticated: get lessons for a course
router.get('/:courseId/lessons', verifyToken, getLessonsForCourse);

// Public: fetch all courses
router.get('/', getCourses);

module.exports = router;