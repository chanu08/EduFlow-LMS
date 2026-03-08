const express = require('express');
const router = express.Router();
const { getDiscussions, postDiscussion } = require('../controllers/discussionController');
const { verifyToken } = require('../middleware/authenticate');

// GET /api/courses/:courseId/discussions — any authenticated user can read
router.get('/:courseId/discussions', verifyToken, getDiscussions);

// POST /api/courses/:courseId/discussions — enrolled students or teachers
router.post('/:courseId/discussions', verifyToken, postDiscussion);

module.exports = router;
