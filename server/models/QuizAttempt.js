const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },

        answers: [
            {
                type: String, //matches option value
            },
        ],

        score: {
            type: Number,
            required: true,
        },

        totalQuestions: {
            type: Number,
            required: true,
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);