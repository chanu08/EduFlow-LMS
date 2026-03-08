const db = require('../db');

// GET /api/notes/lesson/:lessonId
exports.getNote = async (req, res) => {
    const { lessonId } = req.params;
    const studentId = req.user.id;
    try {
        const result = await db.query(
            'SELECT content, updated_at FROM lesson_notes WHERE student_id = $1 AND lesson_id = $2',
            [studentId, lessonId]
        );
        res.json({ content: result.rows[0]?.content || '', updatedAt: result.rows[0]?.updated_at || null });
    } catch (err) {
        console.error('getNote error:', err.message);
        res.status(500).json({ error: 'Failed to fetch note.' });
    }
};

// PUT /api/notes/lesson/:lessonId
exports.saveNote = async (req, res) => {
    const { lessonId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;
    try {
        const result = await db.query(
            `INSERT INTO lesson_notes (student_id, lesson_id, content, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, lesson_id)
       DO UPDATE SET content = $3, updated_at = NOW()
       RETURNING updated_at`,
            [studentId, lessonId, content || '']
        );
        res.json({ success: true, updatedAt: result.rows[0].updated_at });
    } catch (err) {
        console.error('saveNote error:', err.message);
        res.status(500).json({ error: 'Failed to save note.' });
    }
};
