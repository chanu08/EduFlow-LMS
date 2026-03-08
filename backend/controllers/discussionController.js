const db = require('../db');

// GET /api/courses/:courseId/discussions
// Public for enrolled users — returns all messages with username + role
exports.getDiscussions = async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await db.query(
            `SELECT
         d.id,
         d.message,
         d.created_at,
         u.username,
         u.role
       FROM discussions d
       JOIN users u ON d.user_id = u.id
       WHERE d.course_id = $1
       ORDER BY d.created_at ASC`,
            [courseId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Discussion fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch discussions.' });
    }
};

// POST /api/courses/:courseId/discussions
// Enrolled students OR the course teacher can post
exports.postDiscussion = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    try {
        // Allow if teacher (any) or enrolled student
        if (userRole === 'student') {
            const enrollCheck = await db.query(
                'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
                [courseId, userId]
            );
            if (enrollCheck.rows.length === 0) {
                return res.status(403).json({ error: 'You must be enrolled to post in this discussion.' });
            }
        }

        const result = await db.query(
            `INSERT INTO discussions (course_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, message, created_at`,
            [courseId, userId, message.trim()]
        );

        // Return with username + role so frontend can render immediately
        const userRes = await db.query('SELECT username, role FROM users WHERE id = $1', [userId]);
        const posted = { ...result.rows[0], ...userRes.rows[0] };
        res.status(201).json(posted);

        // Fan-out notifications (async — don't block response)
        try {
            const courseRes = await db.query(
                `SELECT c.title, c.teacher_id,
                  ARRAY_AGG(DISTINCT e.student_id) AS student_ids
                 FROM courses c
                 LEFT JOIN enrollments e ON e.course_id = c.id
                 WHERE c.id = $1 GROUP BY c.id`,
                [courseId]
            );
            if (courseRes.rows.length > 0) {
                const { title, teacher_id, student_ids } = courseRes.rows[0];
                const link = `/courses/${courseId}/player`;
                const msg = `${posted.username} posted in "${title}": "${message.trim().slice(0, 60)}${message.trim().length > 60 ? '…' : ''}"\``;
                // notify enrolled students (except poster)
                const recipients = new Set([...(student_ids || []), teacher_id]);
                recipients.delete(userId);
                for (const recipientId of recipients) {
                    if (recipientId) {
                        await db.query(
                            'INSERT INTO notifications (user_id, message, link) VALUES ($1, $2, $3)',
                            [recipientId, msg, link]
                        );
                    }
                }
            }
        } catch (notifErr) {
            console.error('Notification fan-out error:', notifErr.message);
        }
    } catch (err) {
        console.error('Discussion post error:', err.message);
        res.status(500).json({ error: 'Failed to post message.' });
    }
};
