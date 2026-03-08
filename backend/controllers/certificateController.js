const db = require('../db');

// GET /api/courses/:courseId/certificate
// Returns cert data if student has completed 100% of lessons, else 403
exports.getCertificate = async (req, res) => {
    const studentId = req.user.id;
    const { courseId } = req.params;

    try {
        // 1. Verify enrollment
        const enrollCheck = await db.query(
            'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (enrollCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You are not enrolled in this course.' });
        }

        // 2. Count total lessons in course
        const totalResult = await db.query(
            'SELECT COUNT(*) AS total FROM lessons WHERE course_id = $1',
            [courseId]
        );
        const total = parseInt(totalResult.rows[0].total, 10);

        if (total === 0) {
            return res.status(403).json({ error: 'This course has no lessons yet.' });
        }

        // 3. Count completed lessons by this student in this course
        const completedResult = await db.query(
            `SELECT COUNT(*) AS completed
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.student_id = $1 AND l.course_id = $2 AND lp.is_completed = TRUE`,
            [studentId, courseId]
        );
        const completed = parseInt(completedResult.rows[0].completed, 10);

        if (completed < total) {
            return res.status(403).json({
                error: `You have only completed ${completed} of ${total} lessons. Finish all lessons to earn your certificate.`,
                completed,
                total,
            });
        }

        // 4. Fetch student name and course title
        const detailsResult = await db.query(
            `SELECT u.username AS student_name, c.title AS course_title
       FROM users u, courses c
       WHERE u.id = $1 AND c.id = $2`,
            [studentId, courseId]
        );
        const { student_name, course_title } = detailsResult.rows[0];

        return res.json({
            eligible: true,
            studentName: student_name,
            courseTitle: course_title,
            completedAt: new Date().toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Certificate error:', err.message);
        res.status(500).json({ error: 'Server error while checking certificate eligibility.' });
    }
};
