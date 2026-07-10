/**
 * routes/quizRoutes.js
 * Endpoints for quiz publishing, quiz attempts submission, grading retrieval,
 * and teacher/admin score reports directory lookups.
 */

const express = require('express');
const router = express.Router();

const { 
    createQuiz,
    getAvailableQuizzes,
    submitQuizAttempt,
    getAttemptDetails,
    getQuizAttempts,
    getAllTeacherAttempts,
    getAllQuizzesAdmin,
    getAllAttemptsAdmin,
 } = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

// Student test sessions & answers grading
router.post("/", protect, createQuiz);
router.get("/", protect, getAvailableQuizzes);
router.post("/:id/attempt", protect, submitQuizAttempt);
router.get("/attempt/:attemptId", protect, getAttemptDetails);

// Evaluation details summaries for teachers and admins
router.get("/:id/attempts", protect, getQuizAttempts);
router.get("/attempts", protect, getAllTeacherAttempts);
router.get("/admin", protect, getAllQuizzesAdmin);
router.get("/admin/attempts", protect, getAllAttemptsAdmin);

module.exports = router;