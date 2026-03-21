const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const QuizAttempt = require("../models/QuizAttempt");

const createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, questions } = req.body;

        if(req.user.role !== "teacher" || req.user.status !== "approved") {
            return res.status(403).json({ message: "Only approved teachers can create quizzes" });
        }

        if(!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: "Title and at least one question are required" });
        }

        if(courseId && courseId !== "null") {
            const course = await Course.findById(courseId);

            if(!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            if(course.teacher.toString() !== req.user.id) {
                return res.status(403).json({ message: "You can only add quizzes to your own courses" });
            }

            for(let q of questions) {
                if(!q.questionText || !q.options || q.options.length < 2) {
                    return res.status(400).json({ message: "Each question must have text and atleast 2 options" });
                }

                if(!q.options.includes(q.correctAnswer)) {
                    return res.status(400).json({ message: "Correct answer must be one of the options" });
                }
            }

            const quiz = await Quiz.create({
                title,
                description,
                course: courseId || null,
                createdBy: req.user.id,
                questions,
            });

            res.status(201).json({
                message: "Quiz created successfully",
                quiz,
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAvailableQuizzes = async (req, res) => {
    try {
        if(req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can access quizes" });
        }

        const enrollments = await Enrollment.find({ student: req.user.id });
        const enrolledCourseIds = enrollments.map((e) => e.course);

        const quizes = await Quiz.find({
            $or: [
                { course: { $in: enrolledCourseIds } },
                { course: null },
            ],
        }).select("-questions.correctAnswer")

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitQuizAttempt = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { answers } = req.body;

        if(req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can attempt quizzes" });
        }

        const quiz = await Quiz.findById(quizId);

        if(!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if(quiz.course) {
            const enrollment = await Enrollment.findOne({
                student: req.user.id,
                course: quiz.course,
            });

            if(!enrollment) {
                return res.status(403).json({ message: "You are not enrolled in this course" });
            }
        }

        if(!answers || answerslength !== quiz.questions.length) {
            return res.status(400).json({ message: "You must answer all the questions before submitting" });
        }

        let score = 0;

        quiz.questions.forEach((q, index) => {
            if(answers[index] == q.correctAnswer) {
                score++;
            }
        });

        const attempt = await QuizAttempt.create({
            student: req.user.id,
            quiz: quizId,
            answers,
            score,
            totalQuestions: quiz.questions.length,
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);

        res.json({
            message: "Quiz submitted successfully",
            score,
            totalQuestions: quiz.questions.length,
            percentage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttemptDetails = async (req, res) => {
    try {
        const attemptId = req.params.attemptId;
        const attempt = await QuizAttempt.findById(attemptId).populate("quiz");

        if(!attempt) {
            return res.status(404).json({ message: "Results are unable to fetch. Attempt not found" });
        }

        if(req.user.role === "student" && attempt.student.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not the student who attempted the quiz I think!" });
        }

        const quiz = attempt.quiz;

        const results = quiz.questions.map((q, index) => {
            const studentAnswer = attempt.answers[index];
            const isCorrect = studentAnswer === q.correctAnswer;

            return {
                questionText: q.questionText,
                oprions: q.options,
                correctAnswer: q.correctAnswer,
                studentAnswer,
                isCorrect,
            };
        });

        res.json({
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
            results,
        });

    } catch (error) {

    }
};

const getQuizAttempts = async (req, res) => {
    try {
        const quizId = req.params.id;

        if(req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can view attempts" });
        }

        const quiz = await Quiz.findById(quizId);

        if(!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if(quiz.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized person to see this result" });
        }

        const attempts = await QuizAttempt.find({
            quiz: quizId,
        }).sort({ createdAt: -1 }).populate("student", "name email");

        const results = attempts.map((a) => ({
            student: a.student,
            score: a.score,
            totalQuestions: a.totalQuestions,
            percentage: Math.round((a.score / a.totalQuestions) * 100),
            submittedAt: a.createdAt,
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllTeacherAttempts = async (req, res) => {
    try {
        const { keyword } = req.query;

        if(req.user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can access this" });
        }

        const quizzes = await Quiz.find({
            createdBy: req.user.id,
        });

        const quizIds = quizzes.map((q) => q._id);

        let attempts = await QuizAttempt.find({
            quiz: { $in: quizIds },
        }).sort({ createdAt: -1 }).populate("student", "name email").populate("quiz", "title");

        if(keyword) {
            const lower = keyword.toLowerCase();

            attempts = attempts.filter((a) => {
                const name = a.student.name.toLowerCase();
                const email = a.student.email.toLowerCase();

                return name.includes(lower) || email.includes(lower);
            });
        }

        const results = attempts.map((a) => ({
            student: a.student,
            quiz: a.quiz,
            score: a.score,
            totalQuestions: a.totalQuestions,
            percentage: Math.round((a.score / a.totalQuestions) * 100),
            submittedAt: a.createdAt,
        }));

        res.json(results);
    } catch (error) {

    }
};

const getAllQuizzesAdmin = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can access this" });
        }

        const quizzes = await Quiz.find()
        .populate("createdBy", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllAttemptsAdmin = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can access this" });
        }

        const attempts = await QuizAttempt.find()
        .populate("student", "name email")
        .populate({
            path: "quiz",
            select: "title createdBy",
            populate: {
                path: "createdBy",
                select: "name email",
            },
        })
        .sort({ createdAt: -1 });

        const results = attempts.map((a) => ({
            student: a.student,
            quiz: a.quiz.title,
            teacher: a.quiz.createdBy,
            score: a.score,
            totalQuestions: a.totalQuestions,
            percentage: Math.round((a.score / a.totalQuestions) * 100),
            submittedAt: a.createdAt,
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getAvailableQuizzes,
    submitQuizAttempt,
    getAttemptDetails,
    getQuizAttempts,
    getAllTeacherAttempts, 
    getAllQuizzesAdmin,
    getAllAttemptsAdmin,
}