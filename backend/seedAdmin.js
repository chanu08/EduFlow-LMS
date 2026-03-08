const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

(async () => {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await db.query(
            `INSERT INTO users (username, email, password_hash, role)
       VALUES ('admin', 'admin@eduflow.com', $1, 'admin')
       ON CONFLICT (email) DO UPDATE SET role='admin', password_hash=$1`,
            [hash]
        );
        console.log('✅ Admin user ready: admin@eduflow.com / admin123');
        process.exit(0);
    } catch (e) {
        console.error('Failed:', e.message);
        process.exit(1);
    }
})();
