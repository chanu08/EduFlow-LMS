const db = require('../db');

// GET /api/analytics/student
exports.getStudentAnalytics = async (req, res) => {
    const studentId = req.user.id;
    try {
        const totalLessonsResult = await db.query(
            `SELECT COUNT(l.id) AS total FROM lessons l
             JOIN enrollments e ON e.course_id = l.course_id WHERE e.student_id = $1`,
            [studentId]
        );
        const completedLessonsResult = await db.query(
            `SELECT COUNT(lp.id) AS completed FROM lesson_progress lp
             WHERE lp.student_id = $1 AND lp.is_completed = TRUE`,
            [studentId]
        );
        const total = parseInt(totalLessonsResult.rows[0].total, 10) || 0;
        const completed = parseInt(completedLessonsResult.rows[0].completed, 10) || 0;
        const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        const perCourseResult = await db.query(
            `SELECT c.title AS course_title,
              COUNT(l.id) AS total_lessons,
              COUNT(lp.id) FILTER (WHERE lp.is_completed = TRUE) AS completed_lessons
             FROM enrollments e
             JOIN courses c ON c.id = e.course_id
             LEFT JOIN lessons l ON l.course_id = c.id
             LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1
             WHERE e.student_id = $1
             GROUP BY c.id, c.title ORDER BY c.title`,
            [studentId]
        );
        const courseBreakdown = perCourseResult.rows.map((r) => ({
            course: r.course_title.length > 18 ? r.course_title.slice(0, 18) + '…' : r.course_title,
            completed: parseInt(r.completed_lessons, 10),
            total: parseInt(r.total_lessons, 10),
        }));

        res.json({ completionPercent, completedLessons: completed, totalLessons: total, courseBreakdown });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
};

// GET /api/analytics/teacher
// Returns per-course stats for the logged-in teacher: enrolled count, avg completion %, avg quiz score
exports.getTeacherAnalytics = async (req, res) => {
    const teacherId = req.user.id;
    try {
        const result = await db.query(
            `SELECT
               c.id,
               c.title,
               COUNT(DISTINCT e.student_id) AS enrolled_count,
               COALESCE(ROUND(AVG(
                 CASE WHEN lt.total_lessons > 0
                 THEN (100.0 * lt.completed_lessons / lt.total_lessons)
                 ELSE 0 END
               )), 0) AS avg_completion_pct,
               COALESCE(ROUND(AVG(qa.best_score)), 0) AS avg_quiz_score
             FROM courses c
             LEFT JOIN enrollments e ON e.course_id = c.id
             LEFT JOIN quizzes q ON q.course_id = c.id
             LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
             LEFT JOIN (
               SELECT e2.course_id, e2.student_id,
                 COUNT(l.id) AS total_lessons,
                 COUNT(lp.id) FILTER (WHERE lp.is_completed = TRUE) AS completed_lessons
               FROM enrollments e2
               JOIN lessons l ON l.course_id = e2.course_id
               LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e2.student_id
               GROUP BY e2.course_id, e2.student_id
             ) lt ON lt.course_id = c.id AND lt.student_id = e.student_id
             WHERE c.teacher_id = $1
             GROUP BY c.id, c.title
             ORDER BY enrolled_count DESC`,
            [teacherId]
        );

        res.json(result.rows.map(r => ({
            id: r.id,
            title: r.title,
            enrolledCount: parseInt(r.enrolled_count, 10),
            avgCompletionPct: parseInt(r.avg_completion_pct, 10),
            avgQuizScore: parseInt(r.avg_quiz_score, 10),
        })));
    } catch (err) {
        console.error('Teacher analytics error:', err.message);
        res.status(500).json({ error: 'Failed to fetch teacher analytics.' });
    }
};
