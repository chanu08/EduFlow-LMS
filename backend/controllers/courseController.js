const db = require('../db');
const emailService = require('../services/emailService');

exports.createCourse = async (req, res) => {
  const { title, description, thumbnail_url } = req.body;
  const teacher_id = req.user.id; // We get this from the token!

  try {
    const newCourse = await db.query(
      'INSERT INTO courses (title, description, teacher_id, thumbnail_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, teacher_id, thumbnail_url]
    );
    res.status(201).json({ message: "Course created!", course: newCourse.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error while creating course." });
  }
};

// --- GET ALL COURSES (Public, with optional ?search= param) ---
exports.getCourses = async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      result = await db.query(
        `SELECT courses.*, users.username AS teacher_name
         FROM courses
         JOIN users ON courses.teacher_id = users.id
         WHERE courses.title ILIKE $1 OR courses.description ILIKE $1
         ORDER BY courses.id DESC`,
        [term]
      );
    } else {
      result = await db.query(
        `SELECT courses.*, users.username AS teacher_name
         FROM courses
         JOIN users ON courses.teacher_id = users.id
         ORDER BY courses.id DESC`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching courses.' });
  }
};

// --- ENROLL IN A COURSE (Student only) ---
exports.enrollInCourse = async (req, res) => {
  const studentId = req.user.id;
  const courseId = req.params.id;

  try {
    // Prevent duplicate enrollment
    const existing = await db.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    const result = await db.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [studentId, courseId]
    );

    res.status(201).json({ message: 'Enrolled successfully!', enrollment: result.rows[0] });

    // Send enrollment welcome email (async — don't block response)
    try {
      const studentR = await db.query('SELECT username, email FROM users WHERE id=$1', [studentId]);
      const courseR = await db.query('SELECT title FROM courses WHERE id=$1', [courseId]);
      if (studentR.rows[0] && courseR.rows[0]) {
        emailService.sendEnrollmentEmail(studentR.rows[0].email, {
          studentName: studentR.rows[0].username,
          courseTitle: courseR.rows[0].title,
        }).catch(e => console.error('Enrollment email error:', e.message));
      }
    } catch { /* silent */ }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while enrolling in course.' });
  }
};

// --- GET COURSES FOR LOGGED-IN STUDENT ---
exports.getMyCourses = async (req, res) => {
  const studentId = req.user.id;

  try {
    const result = await db.query(
      `SELECT 
         courses.*,
         users.username AS teacher_name
       FROM enrollments
       JOIN courses ON enrollments.course_id = courses.id
       JOIN users ON courses.teacher_id = users.id
       WHERE enrollments.student_id = $1`,
      [studentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching enrolled courses.' });
  }
};

// --- GET SINGLE COURSE (by ID) ---
exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await db.query(
      'SELECT courses.*, users.username as teacher_name FROM courses JOIN users ON courses.teacher_id = users.id WHERE courses.id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching course.' });
  }
};

// --- GET LESSONS FOR A COURSE (only enrolled students or owning teacher) ---
exports.getLessonsForCourse = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let allowed = false;

    if (role === 'teacher') {
      // Teacher must own the course
      const courseCheck = await db.query(
        'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
        [courseId, userId]
      );
      allowed = courseCheck.rows.length > 0;
    } else if (role === 'student') {
      // Student must be enrolled in the course
      const enrollmentCheck = await db.query(
        'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
        [courseId, userId]
      );
      allowed = enrollmentCheck.rows.length > 0;
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to view lessons for this course.' });
    }

    const result = await db.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_number ASC, id ASC',
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching lessons.' });
  }
};

// --- CREATE LESSON FOR A COURSE (Teacher only, must own course) ---
exports.createLesson = async (req, res) => {
  const { courseId } = req.params;
  const { title, video_url, content_text } = req.body;
  const teacherId = req.user.id;

  try {
    // Ensure the logged-in teacher owns this course
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, teacherId]
    );

    if (courseCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to manage lessons for this course.' });
    }

    // Determine order_number: next after current max
    const orderResult = await db.query(
      'SELECT COALESCE(MAX(order_number), 0) + 1 AS next_order FROM lessons WHERE course_id = $1',
      [courseId]
    );

    const nextOrder = orderResult.rows[0].next_order;

    const insertResult = await db.query(
      `INSERT INTO lessons (course_id, title, video_url, content_text, order_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseId, title, video_url || null, content_text, nextOrder]
    );

    res.status(201).json({
      message: 'Lesson created successfully.',
      lesson: insertResult.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating lesson.' });
  }
};