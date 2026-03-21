const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const { request } = require("express");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(400).json({ message: "User already exist with given email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userRole = 'student';
        if(role === 'teacher') {
            userRole = 'teacher'
        }

        let userStatus = 'approved';
        if(userRole === 'teacher') {
            userStatus = 'pending';
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            status: userStatus,
        });

        res.status(201).json({
            message: "User rigistered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            res.status(400).json({ message: "Invalid password" });
        }

        if(user.role === 'teacher' && user.status !== 'approved') {
            return res.status(403).json({ message: "Teacher account not approved yet" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                status: user.status,
                adminType: user.adminType,
                hodStatus: user.hodStatus,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d',
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingTeachers = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === "admin" && req.user.adminType === "super";
        const isHOD = req.user.role === "teacher" && req.user.adminType === "hod" && req.user.hodStatus === "approved"; 

        if(!isSuperAdmin && !isHOD) {
            return res.status(403).json({ message: "Not authorized to view pending tachers" });
        }

        const teachers = await User.find({
            role: "teacher",
            status: "pending",
        }).select("-password");

        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTeacherStatus = async (req, res) => {
    try {
        
        const isSuperAdmin = req.user.role === 'admin' && req.user.adminType === 'super';
        const isHOD = req.user.role === 'teacher' && req.user.adminType === 'hod' && req.user.hodStatus === 'approved';

        if(!isSuperAdmin && !isHOD) {
            return res.status(403).json({ message: "Only Admin or HOD can approve teachers" });
        }

        const { userId } = req.params;
        const { status } = req.body;

        if(!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
            });
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(user.role != 'teacher') {
            return res.status(400).json({ message: "User is not a teacher" });
        }

        if(user.status === status) {
            return res.status(400).json({ message: `Teacher already ${status}` });
        }

        if(user.status !== 'pending') {
            return res.status(400).json({ message: "Teacher is not in pending state" });
        }

        user.status = status;
        await user.save();

        res.json({
            message: `Teacher ${status} successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const requestHOD = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(user.role != 'teacher') {
            return res.status(403).json({ message: "Only teachers can request HOD role" });
        }

        if(user.adminType === 'hod') {
            return res.status(400).json({ message: "Already a HOD or request pending" });
        }

        user.adminType = 'hod';
        user.hodStatus = 'pending';

        await user.save();

        res.json({ message: "HOD request submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateHODStatus = async (req, res) => {
    try {
        if(req.user.role !== 'admin' || req.user.adminType !== 'super') {
            return res.status(403).json({ message: "Only super admin can approve HOD" });
        }

        const { userId } = req.params;
        const { status } = req.body;

        if(!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(user.role !== 'teacher' || user.adminType != 'hod') {
            return res.status(400).json({ message: "User is not requesting HOD role" });
        }

        if(user.hodStatus === status) {
            return res.status(400).json({ message: `HOD already ${status}` });
        }

        user.hodStatus = status;
        await user.save();

        res.json({ message: `HOD ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingHODs = async (req, res) => {
    try {
        if(req.user.role !== 'admin' || req.user.adminType !== 'super') {
            return res.status(403).json({ message: "Only Admin can view HOD requests" });
        }

        const hods = await User.find({
            adminType: "hod",
            hodStatus: "pending",
        }).select("-password");

        res.json(hods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const searchQuery = {
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
            ],
        };

        let roleFilter = {};
        if(req.user.role === "student") {
            roleFilter.role = "teacher";
        } else if (req.user.role === "teacher") {
            roleFilter.role = "student";
        } else if (req.user.role === "admin") {
            // admin sees all
        }

        const users = await User.find({
            ...searchQuery,
            ...roleFilter,
        }).select("name email role status");

        res.json(users);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const requesterRole = req.user.role;

        if(requesterRole === "student" && user.role !== "teacher") {
            return res.status(403).json({ message: "Students can only view teachers" });
        }

        if(requesterRole == "teacher" && user.role != "student") {
            return res.status(403).json({ message: "Teachers can only view students" });
        }

        let response = {
            user,
        }

        if(requesterRole === "student" && user.role === "teacher") {
            const courses = await Course.find({
                teacher: user._id,
            }).select("title description");

            response.courses = courses;
        }

        if(requesterRole === "teacher" && user.role === "student") {
            const enrollments = await Enrollment.find({
                student: user._id,
            });

            const results = await Promise.all(
                enrollments.map(async (enroll) => {
                    const totalLessons = await Lesson.countDocuments({
                        course: enroll.course,
                    });

                    const progress = await Progress.findOne({
                        student: user._id,
                        course: enroll.course,
                    });

                    const completedCount = progress?.completedLessons.length || 0;
                    const percentage =
                    totalLessons === 0
                    ? 0
                    : Math.round((completedCount / totalLessons) * 100);

                    return {
                        courseId: enroll.course,
                        progressPercentage: percentage,
                    };
                })
            );
            
            response.progress = results;
        }

        if(requesterRole === "admin") {
            if(user.role === "teacher") {
                const courses = await Course.find({ teacher: user._id });
                response.courses = courses;
            }

            if(user.role === "student") {
                const enrollments = await Enrollment.find({ student: user._id });
                response.enrollments = enrollments;
            }
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTeacherByAdmin = async (req, res) => {
    try {
        if(req.user.role !== "admin" || req.user.adminType !== "super") {
            return res.status(403).json({ message: "Only super admin can create teachers" });
        }

        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "teacher",
            status: "approved",
        });

        res.status(201).json({
            message: "Teacher created successfully",
            teacher,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleHOD = async (req, res) => {
    try {
        if(req.user.role !== "admin" || req.user.adminType !== "super") {
            return res.status(403).json({ message: "Only admin can manage HOD" });
        }

        const { userId } = req.params;
        const user = await User.findById(userId);

        if(!user || user.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found with given ID" });
        }

        if(user.adminType === "hod") {
            user.adminType = undefined;
            user.hodStatus = null;
        } else {
            user.adminType = "hod";
            user.hodStatus = "approved";
        }
        await user.save();

        res.json({
            message: "HOD status updated",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        if(req.user.role !== "admin" || req.user.adminType !== "super") {
            return res.status(403).json({ message: "Only admin can delete users" });
        }

        const { userId } = req.params;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(user._id.toString() === req.user.id) {
            return res.status(400).json({ message: "You cannot delete yourself" });
        }

        await Course.deleteMany({ teacher: userId });
        await Enrollment.deleteMany({ student: userId });
        await Progress.deleteMany({ student: userId });
        await Quiz.deleteMany({ createdBy: userId });
        await QuizAttempt.deleteMany({ student: userId });

        await user.deleteOne();

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getPendingTeachers,
    updateTeacherStatus,
    requestHOD,
    updateHODStatus,
    getPendingHODs,
    searchUsers,
    getUserProfile,
    createTeacherByAdmin,
    toggleHOD,
    deleteUser,
};