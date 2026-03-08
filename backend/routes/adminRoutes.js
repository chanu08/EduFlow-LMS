const express = require('express');
const router = express.Router();
const {
    getStats, getUsers, updateUserRole, deleteUser, getCourses, deleteCourse
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authenticate');

router.use(verifyToken, isAdmin); // all routes require admin

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/courses', getCourses);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
