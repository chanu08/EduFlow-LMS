const db = require('../db');

// POST /api/courses/:courseId/reviews
// Enrolled students only — submit or update their review
exports.submitReview = async (req, res) => {
    const studentId = req.user.id;
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    try {
        // Ensure student is enrolled in the course
        const enrollmentCheck = await db.query(
            'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
            [courseId, studentId]
        );
        if (enrollmentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You must be enrolled in this course to leave a review.' });
        }

        // Upsert: insert or update on conflict (student already reviewed)
        const result = await db.query(
            `INSERT INTO reviews (course_id, student_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET rating = EXCLUDED.rating,
                     comment = EXCLUDED.comment,
                     created_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [courseId, studentId, ratingNum, comment || null]
        );

        res.status(201).json({ message: 'Review submitted!', review: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while submitting review.' });
    }
};

// GET /api/courses/:courseId/reviews
// Public — fetch all reviews + average rating for a course
exports.getReviewsForCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const result = await db.query(
            `SELECT
         r.id,
         r.rating,
         r.comment,
         r.created_at,
         u.username AS student_name
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
            [courseId]
        );

        const avgResult = await db.query(
            'SELECT ROUND(AVG(rating)::numeric, 1) AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE course_id = $1',
            [courseId]
        );

        res.json({
            reviews: result.rows,
            averageRating: parseFloat(avgResult.rows[0].average_rating) || 0,
            totalReviews: parseInt(avgResult.rows[0].total_reviews, 10),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching reviews.' });
    }
};
