const express = require('express');
const router = express.Router();
const { getNote, saveNote } = require('../controllers/notesController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

router.get('/lesson/:lessonId', verifyToken, isStudent, getNote);
router.put('/lesson/:lessonId', verifyToken, isStudent, saveNote);

module.exports = router;
