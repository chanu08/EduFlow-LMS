const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'PLACEHOLDER_SECRET',
});

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) return res.status(400).json({ error: 'courseId required.' });

    try {
        const courseR = await db.query('SELECT id, title, price FROM courses WHERE id = $1', [courseId]);
        if (courseR.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });

        const { price, title } = courseR.rows[0];

        // Free course — just enroll directly
        if (!price || parseInt(price) === 0) {
            return res.status(400).json({ error: 'This course is free. Use the Enroll button.' });
        }

        const order = await razorpay.orders.create({
            amount: parseInt(price), // in paise
            currency: 'INR',
            receipt: `order_${studentId}_${courseId}_${Date.now()}`,
            notes: { courseId: String(courseId), studentId: String(studentId) },
        });

        // Store pending payment
        await db.query(
            'INSERT INTO payments (student_id, course_id, order_id, amount, status) VALUES ($1,$2,$3,$4,$5)',
            [studentId, courseId, order.id, parseInt(price), 'pending']
        );

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER',
            courseTitle: title,
        });
    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(500).json({ error: 'Failed to create payment order.' });
    }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    const studentId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    try {
        // Verify HMAC signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'PLACEHOLDER_SECRET')
            .update(body)
            .digest('hex');

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
        }

        // Mark payment verified
        await db.query(
            `UPDATE payments SET status = 'verified', payment_id = $1
       WHERE order_id = $2 AND student_id = $3`,
            [razorpay_payment_id, razorpay_order_id, studentId]
        );

        // Enroll student
        await db.query(
            `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)
       ON CONFLICT (student_id, course_id) DO NOTHING`,
            [studentId, courseId]
        );

        res.json({ success: true, message: 'Payment verified. You are now enrolled!' });
    } catch (err) {
        console.error('Verify payment error:', err.message);
        res.status(500).json({ error: 'Failed to verify payment.' });
    }
};
