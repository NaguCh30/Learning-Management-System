const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "teacher_approved",
                "teacher_rejected",
                'hod_approved',
                'hod_rejected',
                'quiz_submitted',
                'course_created',
                'admin_action',
            ],
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Notification", notificationSchema);