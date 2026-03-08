const db = require('../db');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [usersR, coursesR, enrollsR, paymentsR] = await Promise.all([
            db.query('SELECT COUNT(*) AS total FROM users'),
            db.query('SELECT COUNT(*) AS total FROM courses'),
            db.query('SELECT COUNT(*) AS total FROM enrollments'),
            db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'verified'`),
        ]);
        res.json({
            totalUsers: parseInt(usersR.rows[0].total, 10),
            totalCourses: parseInt(coursesR.rows[0].total, 10),
            totalEnrollments: parseInt(enrollsR.rows[0].total, 10),
            totalRevenue: parseInt(paymentsR.rows[0].total, 10),
        });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
};

// GET /api/admin/users?search=&page=1&limit=20
exports.getUsers = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await db.query(
            `SELECT id, username, email, role, created_at
       FROM users
       WHERE username ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
            [`%${search}%`, parseInt(limit), offset]
        );
        const countR = await db.query(
            `SELECT COUNT(*) AS total FROM users WHERE username ILIKE $1 OR email ILIKE $1`,
            [`%${search}%`]
        );
        res.json({ users: result.rows, total: parseInt(countR.rows[0].total, 10) });
    } catch (err) {
        console.error('Admin getUsers error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role.' });
    }
    try {
        await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Admin updateUserRole error:', err.message);
        res.status(500).json({ error: 'Failed to update role.' });
    }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account.' });
    }
    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Admin deleteUser error:', err.message);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
};

// GET /api/admin/courses
exports.getCourses = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.id, c.title, c.created_at, u.username AS teacher_name,
              c.price, COUNT(e.id) AS enrollment_count
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id, u.username
       ORDER BY c.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Admin getCourses error:', err.message);
        res.status(500).json({ error: 'Failed to fetch courses.' });
    }
};

// DELETE /api/admin/courses/:id
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM courses WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Admin deleteCourse error:', err.message);
        res.status(500).json({ error: 'Failed to delete course.' });
    }
};
