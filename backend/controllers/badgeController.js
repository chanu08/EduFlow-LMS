const db = require('../db');

/**
 * Check if a student has earned any new badges and award them.
 * Returns array of newly awarded badge slugs.
 */
exports.checkAndAwardBadges = async (studentId) => {
    const awarded = [];

    try {
        // Get existing badge slugs the student has
        const existing = await db.query(
            'SELECT b.slug FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = $1',
            [studentId]
        );
        const existingSlugs = new Set(existing.rows.map(r => r.slug));

        const award = async (slug) => {
            if (existingSlugs.has(slug)) return;
            const badge = await db.query('SELECT id FROM badges WHERE slug = $1', [slug]);
            if (badge.rows.length === 0) return;
            await db.query(
                'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [studentId, badge.rows[0].id]
            );
            existingSlugs.add(slug);
            awarded.push(slug);
        };

        // ── Badge: first_step (enrolled in any course)
        const enrollments = await db.query(
            'SELECT COUNT(*) AS c FROM enrollments WHERE student_id = $1', [studentId]
        );
        if (parseInt(enrollments.rows[0].c) >= 1) await award('first_step');
        if (parseInt(enrollments.rows[0].c) >= 3) await award('dedicated');

        // ── Badge: graduate (completed 100% of any course)
        const grads = await db.query(`
      SELECT e.course_id
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = $1
        AND (
          SELECT COUNT(*) FROM lesson_progress lp
          JOIN lessons l ON l.id = lp.lesson_id
          WHERE lp.student_id = $1 AND l.course_id = e.course_id AND lp.is_completed
        ) = (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id)
        AND (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id) > 0
    `, [studentId]);
        if (grads.rows.length > 0) await award('graduate');

        // ── Badge: half_way (50% completion of any course)
        const halfWay = await db.query(`
      SELECT e.course_id
      FROM enrollments e
      WHERE e.student_id = $1
        AND (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id) > 0
        AND (
          SELECT COUNT(*) FROM lesson_progress lp
          JOIN lessons l ON l.id = lp.lesson_id
          WHERE lp.student_id = $1 AND l.course_id = e.course_id AND lp.is_completed
        ) * 2 >= (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id)
    `, [studentId]);
        if (halfWay.rows.length > 0) await award('half_way');

        // ── Badge: quiz_master (scored 100 on any quiz)
        const perfectQuiz = await db.query(
            'SELECT 1 FROM quiz_attempts WHERE student_id = $1 AND best_score = 100 LIMIT 1', [studentId]
        );
        if (perfectQuiz.rows.length > 0) await award('quiz_master');

        // ── Badge: speed_learner (5 lessons completed today)
        const todayLessons = await db.query(
            `SELECT COUNT(*) AS c FROM lesson_progress
       WHERE student_id = $1 AND is_completed AND updated_at::date = CURRENT_DATE`,
            [studentId]
        );
        if (parseInt(todayLessons.rows[0].c) >= 5) await award('speed_learner');

        // ── Badge: discusser (5+ discussion messages)
        const msgs = await db.query(
            'SELECT COUNT(*) AS c FROM discussions WHERE user_id = $1', [studentId]
        );
        if (parseInt(msgs.rows[0].c) >= 5) await award('discusser');

    } catch (err) {
        console.error('Badge check error:', err.message);
    }

    return awarded;
};

// GET /api/badges/mine — get current user's earned badges
exports.getMyBadges = async (req, res) => {
    try {
        const result = await db.query(`
      SELECT b.slug, b.name, b.description, b.icon, b.color, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.earned_at DESC
    `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('getMyBadges error:', err.message);
        res.status(500).json({ error: 'Failed to fetch badges.' });
    }
};

// GET /api/badges/all — all badge definitions (for profile "to earn" section)
exports.getAllBadges = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM badges ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch badge list.' });
    }
};
