const express = require('express');
const router = express.Router();

const {
    getMyNotifications,
    markNotificationAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.put("./:id/read", protect, markNotificationAsRead);

module.exports = router;