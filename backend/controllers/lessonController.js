const db = require('../db');

// Toggle completion status for a lesson for the logged-in student
exports.toggleLessonCompletion = async (req, res) => {
  const studentId = req.user.id;
  const { lessonId } = req.params;

  try {
    // Ensure the student is enrolled in the course this lesson belongs to
    const accessCheck = await db.query(
      `SELECT l.id
       FROM lessons l
       JOIN enrollments e ON e.course_id = l.course_id
       WHERE l.id = $1 AND e.student_id = $2`,
      [lessonId, studentId]
    );

    if (accessCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to update progress for this lesson.' });
    }

    const existing = await db.query(
      'SELECT id, is_completed FROM lesson_progress WHERE student_id = $1 AND lesson_id = $2',
      [studentId, lessonId]
    );

    let isCompleted;

    if (existing.rows.length === 0) {
      // First click — always mark as COMPLETE (insert with is_completed = TRUE)
      const insertResult = await db.query(
        'INSERT INTO lesson_progress (student_id, lesson_id, is_completed) VALUES ($1, $2, TRUE) RETURNING is_completed',
        [studentId, lessonId]
      );
      isCompleted = insertResult.rows[0].is_completed;
    } else {
      // Subsequent clicks — toggle the existing value
      const updateResult = await db.query(
        'UPDATE lesson_progress SET is_completed = NOT is_completed WHERE id = $1 RETURNING is_completed',
        [existing.rows[0].id]
      );
      isCompleted = updateResult.rows[0].is_completed;
    }

    res.json({ lessonId: Number(lessonId), is_completed: isCompleted });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating lesson progress.' });
  }
};

// Get completed lesson IDs for the logged-in student and a specific course
exports.getCompletedLessonsForCourse = async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;

  try {
    const result = await db.query(
      `SELECT lp.lesson_id
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.student_id = $1 AND l.course_id = $2 AND lp.is_completed = TRUE`,
      [studentId, courseId]
    );

    const completedLessonIds = result.rows.map((row) => row.lesson_id);
    res.json({ completedLessonIds });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching lesson progress.' });
  }
};

