/**
 * server.js
 * Entry point for the LMS Express backend. Sets up connection to MongoDB,
 * registers global middleares, and mounts MVC routers for courses, users,
 * lessons, student progress, quiz sheets, and in-app notifications.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require("./routes/userRoutes")
const connectDB = require("./config/db");
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Set up cross-origin utility rules and body parsing middleware
app.use(cors());
app.use(express.json());

// Main database connector call
connectDB();

// Mount MVC API routes
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});