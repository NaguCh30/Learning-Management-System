/**
 * routes/userRoutes.js
 * Configures authentication routers (login/register) and handles administrator actions 
 * (search directories, role promotions, HOD toggling, teacher registrations, user deletions).
 */

const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/userController');
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
    res.send("User route working");
});

router.get("/student", protect, authorizeRoles("student"), (req, res) => {
    res.send("Student route accessed");
})

router.get("/teacher", protect, authorizeRoles("teacher"), (req, res) => {
    res.send("Teacher route accessed");
})

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.send("Admin route accessed");
})

// Retrieve all system users (Admin restricted)
router.get("/all", protect, authorizeRoles('admin'), getAllUsers);

// Retrieve newly registered teachers awaiting status validation
router.get("/pending-teachers", protect, authorizeRoles('admin', 'teacher'), getPendingTeachers);

// Validate a teacher signature (approving/rejecting their profile access)
router.put("/approve-teacher/:userId", protect, authorizeRoles('admin', 'teacher'), updateTeacherStatus);

// Retrieve teachers applying for Head of Department (HOD) roles
router.get("/pending-hods", protect, authorizeRoles('admin'), getPendingHODs);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-hoc", protect, authorizeRoles('teacher'), requestHOD) // note: kept route as is to prevent frontend breaking
router.post("/request-hod", protect, authorizeRoles('teacher'), requestHOD)
router.put("/approve-hod/:userId", protect, authorizeRoles('admin'), updateHODStatus);
router.get("/search", protect, searchUsers);
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user,
    });
});
router.get("/:id", protect, getUserProfile);
router.post("/admin/create-teacher", protect, createTeacherByAdmin);
router.put("/admin/toggle-hod/:userId", protect, toggleHOD);
router.delete("/admin/delete-user/:userId", protect, deleteUser);

module.exports = router;