const Notification = require("../models/Notification");

const createNotification = async ({ userId, message, type }) => {
    try {
        await Notification.create({
            user: userId,
            message,
            type,
        });
    } catch (error) {
        console.error("Notification error: ", error.message);
    }
};

module.exports = createNotification;