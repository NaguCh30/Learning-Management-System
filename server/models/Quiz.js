const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },

    options: [
        {
            type: String,
            required: true,
        },
    ],

    correctAnswers: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return this.options.includes(value);
            },
            message: "Correct answer must be one of the options",
        },
    },
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        questions: {
            type: [questionSchema],
            validte: {
                validator: function (val) {
                    return val.length > 0;
                },
                message: "Quiz must have atleast one question",
            },
        },

        totalMarks: {
            type: Number,
        },

        timeLimit: {
            type: Number, // minutes
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quiz", quizSchema);