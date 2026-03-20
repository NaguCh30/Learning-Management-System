const express = require('express');
const router = express.Router();

const { createCourse, getMyCourses, updateCourse, deleteCourse, getAllCourses, getCourseById, enrollCourse, getEnrolledCourses } = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post("/", protect, authorizeRoles('teacher'), createCourse);
router.get("/my", protect, authorizeRoles('teacher'), getMyCourses);
router.put("/:id", protect, authorizeRoles('teacher'), updateCourse);
router.delete("/:id", protect, authorizeRoles('teacher'), deleteCourse);
router.get("/enrolled", protect, authorizeRoles('student'), getEnrolledCourses);
router.get("/", protect, getAllCourses);
router.get("/:id", protect, getCourseById);
router.post("/:id/enroll", protect, authorizeRoles('student'), enrollCourse);

module.exports = router;