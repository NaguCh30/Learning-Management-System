/**
 * routes/notificationRoutes.js
 * In-app push notifications polling and mark-as-read acknowledgement handlers.
 */

const express = require('express');
const router = express.Router();

const {
    getMyNotifications,
    markNotificationAsRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// Alerts log fetch & notification updates
router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markNotificationAsRead);

module.exports = router;