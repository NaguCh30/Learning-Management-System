const express = require('express');
const router = express.Router();

const { createLesson, getLessonsByCourse, updateLesson, deleteLesson, reorderLessons } = require("../controllers/courseController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("teacher"), createLesson);
router.get("/course/:courseId", protect, getLessonsByCourse);
router.put("/:lessonId", protect, authorizeRoles('teacher'), updateLesson);
router.delete("/:lessonId", protect, authorizeRoles("teacher"), deleteLesson);
router.put("/reorder", protect, authorizeRoles("teacher"), reorderLessons);

module.exports = router;