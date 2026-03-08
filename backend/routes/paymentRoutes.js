const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyToken, isStudent } = require('../middleware/authenticate');

router.post('/create-order', verifyToken, isStudent, createOrder);
router.post('/verify', verifyToken, isStudent, verifyPayment);

module.exports = router;
