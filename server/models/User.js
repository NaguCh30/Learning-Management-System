const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ['student', 'teacher', 'admin'],
            default: 'student',
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved',
        },

        profilePic: {
            type: String,
        },

        bio: {
            type: String,
        },

        adminType: {
            type: String,
            enum: ['super', 'hod', null],
            default: null,
        },

        hodStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);