const db = require('../db');

// GET /api/leaderboard/global — top 50 students by combined score
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const result = await db.query(`
      SELECT
        u.id,
        u.username,
        COUNT(DISTINCT e.course_id)                              AS courses_enrolled,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.is_completed)  AS lessons_done,
        ROUND(COALESCE(AVG(qa.best_score), 0))                   AS avg_quiz_score,
        -- composite score: 40% completion rate + 60% quiz avg
        ROUND(
          0.4 * COALESCE(
            100.0 * COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.is_completed)
              / NULLIF(COUNT(DISTINCT l.id), 0), 0
          ) +
          0.6 * COALESCE(AVG(qa.best_score), 0)
        ) AS composite_score
      FROM users u
      LEFT JOIN enrollments   e  ON e.student_id  = u.id
      LEFT JOIN lessons       l  ON l.course_id   = e.course_id
      LEFT JOIN lesson_progress lp ON lp.student_id = u.id AND lp.lesson_id = l.id
      LEFT JOIN quizzes       q  ON q.course_id   = e.course_id
      LEFT JOIN quiz_attempts qa ON qa.student_id  = u.id AND qa.quiz_id = q.id
      WHERE u.role = 'student'
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT e.course_id) > 0
      ORDER BY composite_score DESC, lessons_done DESC
      LIMIT 50
    `);

        res.json(result.rows.map((r, i) => ({
            rank: i + 1,
            id: r.id,
            username: r.username,
            coursesEnrolled: parseInt(r.courses_enrolled),
            lessonsDone: parseInt(r.lessons_done),
            avgQuizScore: parseInt(r.avg_quiz_score),
            compositeScore: parseInt(r.composite_score),
        })));
    } catch (err) {
        console.error('Global leaderboard error:', err.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
};

// GET /api/leaderboard/course/:courseId — per-course ranking
exports.getCourseLeaderboard = async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await db.query(`
      SELECT
        u.id,
        u.username,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.is_completed) AS lessons_done,
        COUNT(DISTINCT l.id)                                          AS total_lessons,
        ROUND(COALESCE(MAX(qa.best_score), 0))                       AS best_score,
        ROUND(
          0.5 * COALESCE(
            100.0 * COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.is_completed)
              / NULLIF(COUNT(DISTINCT l.id), 0), 0
          ) +
          0.5 * COALESCE(MAX(qa.best_score), 0)
        ) AS composite_score
      FROM enrollments e
      JOIN users u ON u.id = e.student_id
      LEFT JOIN lessons l       ON l.course_id = e.course_id
      LEFT JOIN lesson_progress lp ON lp.student_id = u.id AND lp.lesson_id = l.id
      LEFT JOIN quizzes q       ON q.course_id = e.course_id
      LEFT JOIN quiz_attempts qa ON qa.student_id = u.id AND qa.quiz_id = q.id
      WHERE e.course_id = $1
      GROUP BY u.id, u.username
      ORDER BY composite_score DESC, lessons_done DESC
      LIMIT 30
    `, [courseId]);

        res.json(result.rows.map((r, i) => ({
            rank: i + 1,
            id: r.id,
            username: r.username,
            lessonsDone: parseInt(r.lessons_done),
            totalLessons: parseInt(r.total_lessons),
            bestScore: parseInt(r.best_score),
            compositeScore: parseInt(r.composite_score),
        })));
    } catch (err) {
        console.error('Course leaderboard error:', err.message);
        res.status(500).json({ error: 'Failed to fetch course leaderboard.' });
    }
};
