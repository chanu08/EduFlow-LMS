const db = require('../db');

// GET /api/courses/:courseId/sessions — all enrolled users + teacher
exports.getSessionsForCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await db.query(
            `SELECT ls.id, ls.title, ls.scheduled_at, ls.room_name, u.username AS teacher_name
       FROM live_sessions ls
       JOIN users u ON u.id = ls.teacher_id
       WHERE ls.course_id = $1
       ORDER BY ls.scheduled_at ASC`,
            [courseId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Live sessions fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch live sessions.' });
    }
};

// POST /api/courses/:courseId/sessions — teacher only
exports.createSession = async (req, res) => {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { title, scheduledAt } = req.body;

    if (!title || !scheduledAt) {
        return res.status(400).json({ error: 'title and scheduledAt are required.' });
    }

    try {
        // Verify teacher owns the course
        const ownerCheck = await db.query(
            'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
            [courseId, teacherId]
        );
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You do not own this course.' });
        }

        // Generate unique room name
        const roomName = `eduflow-c${courseId}-${Date.now().toString(36)}`;

        const result = await db.query(
            `INSERT INTO live_sessions (course_id, teacher_id, title, scheduled_at, room_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, scheduled_at, room_name`,
            [courseId, teacherId, title, scheduledAt, roomName]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create session error:', err.message);
        res.status(500).json({ error: 'Failed to create live session.' });
    }
};

// DELETE /api/courses/:courseId/sessions/:sessionId — teacher only
exports.deleteSession = async (req, res) => {
    const teacherId = req.user.id;
    const { sessionId } = req.params;
    try {
        await db.query(
            'DELETE FROM live_sessions WHERE id = $1 AND teacher_id = $2',
            [sessionId, teacherId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Delete session error:', err.message);
        res.status(500).json({ error: 'Failed to delete session.' });
    }
};
