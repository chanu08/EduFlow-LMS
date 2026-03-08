const jwt = require('jsonwebtoken');

// Bouncer 1: Check if the token is valid
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access Denied. No token provided.' });

  try {
    const cleanToken = token.replace('Bearer ', '');
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

// Bouncer 2: Check if the user is a teacher
exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access Denied. Only teachers can do this.' });
  }
  next();
};

// Bouncer 3: Check if the user is a student
exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access Denied. Only students can do this.' });
  }
  next();
};

// Bouncer 4: Check if the user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied. Admins only.' });
  }
  next();
};
