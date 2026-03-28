const Notification = require("../models/Notification");

const getMyNotifications =  async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id,
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if(!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if(notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
}