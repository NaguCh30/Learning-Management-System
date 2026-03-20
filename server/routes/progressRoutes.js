const express = require('express');
const router = express.Router();

const { markLessonCompleted, 
    unmarkLessonCompleted, 
    getMyProgress, 
    getCourseProgress, 
    getTeacherOverview, 
    getTeacherCoursesProgress,
    getAdminOverView,
    getAdminTeachersAnalytics } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

router.post("/complete", protect, markLessonCompleted);
router.post("/uncomplete", protect, unmarkLessonCompleted);
router.get("/my/:courseId", protect, getMyProgress);
router.get("/course/:courseId", protect, getCourseProgress);
router.get("/teacher/overview", protect, getTeacherOverview);
router.get("/teacher/courses", protect, getTeacherCoursesProgress);
router.get("/admin/overview", protect, getAdminOverView);
router.get("/admin/teachers", protect, getAdminTeachersAnalytics);

module.exports = router;