const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/authenticate');

// POST /api/ai/ask — authenticated users only (student or teacher)
router.post('/ask', verifyToken, askAI);

module.exports = router;
