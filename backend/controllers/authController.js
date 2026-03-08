const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Issue a JWT containing the user's id and role.
 */
function issueToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Validate register body: username, email, password, role (optional).
 */
function validateRegister(body) {
  const { username, email, password } = body;
  const errors = [];
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username is required.');
  }
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters.');
  }
  const role = body.role;
  if (role !== undefined && role !== null && role !== '') {
    if (role !== 'student' && role !== 'teacher') {
      errors.push('Role must be "student" or "teacher".');
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate login body: email, password.
 */
function validateLogin(body) {
  const { email, password } = body;
  const errors = [];
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * POST /auth/register
 * Register a new user. Hashes password with bcrypt, stores in DB, returns JWT.
 * Handles "User already exists" (duplicate email) gracefully.
 */
async function register(req, res) {
  try {
    const validation = validateRegister(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors });
    }

    const { username, email, password } = req.body;
    const role = req.body.role === 'teacher' ? 'teacher' : 'student';
    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username.trim(), email.trim().toLowerCase(), password_hash, role]
    );

    const user = result.rows[0];
    const token = issueToken(user);
    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        message: 'User already exists.',
        detail: 'A user with this email address is already registered.',
      });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed.' });
  }
}

/**
 * POST /auth/login
 * Authenticate by email and password; return JWT with id and role.
 */
async function login(req, res) {
  try {
    const validation = validateLogin(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: 'Validation failed.', errors: validation.errors });
    }

    const { email, password } = req.body;
    const result = await db.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = issueToken(user);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
}

module.exports = {
  register,
  login,
};
