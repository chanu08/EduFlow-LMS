const express = require('express');
const router = express.Router();
const { getMyCourses } = require('../controllers/courseController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

// Logged-in student: get all enrolled courses
router.get('/my-courses', verifyToken, isStudent, getMyCourses);

module.exports = router;

