const db = require('../db');

// Teacher: create a quiz and its questions for a course they own
exports.createQuizWithQuestions = async (req, res) => {
  const teacherId = req.user.id;
  const { courseId, title, questions } = req.body;

  if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'courseId, title, and questions are required.' });
  }

  try {
    const courseCheck = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND teacher_id = $2',
      [courseId, teacherId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not allowed to create quizzes for this course.' });
    }

    await db.query('BEGIN');

    const quizResult = await db.query(
      'INSERT INTO quizzes (course_id, title) VALUES ($1, $2) RETURNING id, title',
      [courseId, title]
    );

    const quizId = quizResult.rows[0].id;

    for (const q of questions) {
      const { question_text, options, correct_option_index } = q;
      if (!question_text || !Array.isArray(options) || options.length === 0 || typeof correct_option_index !== 'number') {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Each question must have question_text, options array, and correct_option_index.' });
      }
      await db.query(
        'INSERT INTO questions (quiz_id, question_text, options, correct_option_index) VALUES ($1, $2, $3, $4)',
        [quizId, question_text, JSON.stringify(options), correct_option_index]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Quiz created successfully.', quiz: { id: quizId, title } });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => { });
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating quiz.' });
  }
};

// Student: get quiz for a course (without correct answers) + best previous score
exports.getQuizForStudentByCourse = async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;

  try {
    const enrollmentCheck = await db.query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not allowed to access quizzes for this course.' });
    }

    const quizResult = await db.query(
      'SELECT id, title FROM quizzes WHERE course_id = $1 ORDER BY id LIMIT 1',
      [courseId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'No quiz found for this course.' });
    }

    const quiz = quizResult.rows[0];

    const questionsResult = await db.query(
      'SELECT id, question_text, options FROM questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quiz.id]
    );

    // Fetch best previous attempt for this student + quiz
    const attemptResult = await db.query(
      'SELECT best_score, attempt_count FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2',
      [studentId, quiz.id]
    );
    const attempt = attemptResult.rows[0] || null;

    res.json({
      quizId: quiz.id,
      title: quiz.title,
      questions: questionsResult.rows,
      bestScore: attempt ? attempt.best_score : null,
      attemptCount: attempt ? attempt.attempt_count : 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching quiz.' });
  }
};

// Student: submit quiz answers, get score, persist best score
exports.submitQuiz = async (req, res) => {
  const studentId = req.user.id;
  const { quizId } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array.' });
  }

  try {
    const enrollmentCheck = await db.query(
      `SELECT e.id FROM quizzes q
       JOIN courses c ON q.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
       WHERE q.id = $1 AND e.student_id = $2`,
      [quizId, studentId]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not allowed to submit this quiz.' });
    }

    const questionsResult = await db.query(
      'SELECT id, correct_option_index FROM questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quizId]
    );

    const questions = questionsResult.rows;
    if (questions.length === 0) {
      return res.status(400).json({ error: 'Quiz has no questions.' });
    }

    let correctCount = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (typeof userAnswer === 'number' && userAnswer === q.correct_option_index) {
        correctCount += 1;
      }
    });

    const totalQuestions = questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    // Upsert quiz_attempts — keep best score, increment attempt_count
    await db.query(
      `INSERT INTO quiz_attempts (student_id, quiz_id, score_percent, best_score, attempt_count)
       VALUES ($1, $2, $3, $3, 1)
       ON CONFLICT (student_id, quiz_id) DO UPDATE SET
         score_percent = EXCLUDED.score_percent,
         best_score    = GREATEST(quiz_attempts.best_score, EXCLUDED.score_percent),
         attempt_count = quiz_attempts.attempt_count + 1,
         attempted_at  = NOW()`,
      [studentId, quizId, scorePercent]
    );

    // Fetch updated best score
    const updatedAttempt = await db.query(
      'SELECT best_score, attempt_count FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2',
      [studentId, quizId]
    );
    const { best_score, attempt_count } = updatedAttempt.rows[0];

    res.json({
      quizId: Number(quizId),
      totalQuestions,
      correctAnswers: correctCount,
      scorePercent,
      bestScore: best_score,
      attemptCount: attempt_count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while submitting quiz.' });
  }
};
