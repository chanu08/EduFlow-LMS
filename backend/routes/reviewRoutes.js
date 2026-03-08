const express = require('express');
const router = express.Router();
const { submitReview, getReviewsForCourse } = require('../controllers/reviewController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

// GET /api/courses/:courseId/reviews  — public, anyone can read reviews
router.get('/:courseId/reviews', getReviewsForCourse);

// POST /api/courses/:courseId/reviews — enrolled students only
router.post('/:courseId/reviews', verifyToken, isStudent, submitReview);

module.exports = router;
