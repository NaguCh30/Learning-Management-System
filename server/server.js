const express = require('express');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require("./routes/userRoutes")
const connectDB = require("./config/db");
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/", (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});