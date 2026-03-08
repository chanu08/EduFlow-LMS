const db = require('../db');

// GET /api/notifications — returns unread count + recent 20 notifications
exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(
            `SELECT id, message, link, is_read, created_at
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );
        const unreadCount = result.rows.filter(n => !n.is_read).length;
        res.json({ notifications: result.rows, unreadCount });
    } catch (err) {
        console.error('Notification fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
};

// PUT /api/notifications/read — mark all as read
exports.markAllRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Mark read error:', err.message);
        res.status(500).json({ error: 'Failed to mark notifications as read.' });
    }
};
