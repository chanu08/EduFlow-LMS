const express = require('express');
const router = express.Router();
const { getCertificate } = require('../controllers/certificateController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

// GET /api/courses/:courseId/certificate
router.get('/:courseId/certificate', verifyToken, isStudent, getCertificate);

module.exports = router;
