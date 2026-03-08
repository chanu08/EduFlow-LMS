const db = require('./db');

async function migrate() {
  // Badge definitions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS badges (
      id          SERIAL PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      icon        TEXT NOT NULL,
      color       TEXT DEFAULT 'indigo'
    )
  `);

  // User-badge junction (tracks who earned what)
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id   INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      earned_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, badge_id)
    )
  `);

  // Lesson notes (one per student per lesson)
  await db.query(`
    CREATE TABLE IF NOT EXISTS lesson_notes (
      id         SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id  INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      content    TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (student_id, lesson_id)
    )
  `);

  // Category column on courses
  await db.query(`
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'
  `);

  // Seed badge definitions
  await db.query(`
    INSERT INTO badges (slug, name, description, icon, color) VALUES
      ('first_step',    'First Step',      'Enrolled in your first course',                 '🚀','indigo'),
      ('quiz_master',   'Quiz Master',     'Scored 100% on a quiz',                         '🧠','violet'),
      ('half_way',      'Half Way There',  'Completed 50% of a course',                     '⚡','blue'),
      ('graduate',      'Graduate',        'Completed an entire course',                    '🎓','green'),
      ('speed_learner', 'Speed Learner',   'Completed 5 lessons in a single day',           '⚡','yellow'),
      ('dedicated',     'Dedicated',       'Enrolled in 3 or more courses',                 '📚','pink'),
      ('top_student',   'Top Student',     'Reached top 3 on the global leaderboard',       '🏆','amber'),
      ('discusser',     'Discussion Star', 'Posted 5+ messages in course discussions',      '💬','teal')
    ON CONFLICT (slug) DO NOTHING
  `);

  console.log('✅ badges, user_badges, lesson_notes tables + category column created');
  process.exit(0);
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
