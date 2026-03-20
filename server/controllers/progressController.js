const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const User = require("../models/User");

const markLessonCompleted = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;

        if(req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can mark lessons" });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId,
        });

        if(!enrollment) {
            res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const lesson = await Lesson.findById(lessonId);
        if(!lesson || lesson.course.toString() !== courseId) {
            return res.status(403).json({ message: "Invalid lesso for this course" });
        }

        let progress = await Progress.findOne({
            student: req.user.id,
            course: courseId,
        });

        if(!progress) {
            progress = await Progress.create({
                student: req.user.id,
                course: courseId,
                completedLessons: [],
            });
        }

        if(!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }

        progress.lastAccessedLesson = lessonId;

        await progress.save();

        res.json({
            message: "Lesson marked as completed",
            progress,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unmarkLessonCompleted = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;

        if(req.user.role !== 'student') {
            return res.status(403).json({ message: "Only students can modify progress" });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId,
        });

        if(!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const progress = await Progress.findOne({
            student: req.user.id,
            course: courseId,
        });

        if(!progress) {
            return res.status(404).json({ message: "Progress not found" });
        }

        progress.completedLessons = progress.completedLessons.filter(
            (id) => id.toString() !== lessonId
        );

        await progress.save();

        res.json({
            message: "Lesson unmarked successfully",
            progress,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyProgress = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        if(req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can view progress" });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId,
        });

        if(!enrollment) {
            return res.status(403).json({ message: "You are not enrolled in this course" });
        }

        const totalLessons = await Lesson.countDocuments({
            course: courseId,
        });

        const progress = await Progress.findOne({
            student: req.user.id,
            course: courseId,
        });

        const completedLessons = progress?.completedLessons || [];
        const completedCount = completedLessons.length;

        const progressPercentage = totalLessons === 0
        ? 0
        : Math.round((completedCount / totalLessons) * 100);

        res.json({
            totalLessons,
            completedCount,
            progressPercentage,
            completedLessons,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseProgress = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        if(req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const course = await Course.findById(courseId);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(req.user.role == "teacher" && course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const totalLessons = await Lesson.countDocuments({ course: courseId });

        const enrollments = await Enrollment.find({
            course: courseId,
        }).populate("student", "name email");

        const results = await Promise.all(
            enrollments.map(async (enroll) => {
                const progress = await Progress.findOne({
                    student: enroll.student._id,
                    course: courseId,
                });

                const completedCount = progress?.completedLessons.length || 0;

                const progressPercentage = totalLessons === 0
                ? 0
                : Math.round((completedCount / totalLessons) * 100);

                return {
                    student: enroll.student,
                    completedCount,
                    progressPercentage,
                };
            })
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherOverview = async (req, res) => {
    try {
        if(req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const teacherId = req.user.role === "admin"
        ? req.query.teacherId
        : req.user.id;

        if(!teacherId) {
            return res.status(400).json({ message: "teacherId id required for admin" });
        }

        const courses = await Course.find({ teacher: teacherId });

        const courseIds = courses.map((c) => c._id);

        const totalCourses = courses.length;

        const enrollments = await Enrollment.find({ course: { $in: courseIds} });

        const totalStudents = enrollments.length;

        const lessonCounts = {};

        for(let course of courses) {
            const count = await Lesson.countDocuments({ course: course._id });
            lessonCounts[course._id] = count;
        }

        let totalProgress = 0;
        for(let enroll of enrollments) {
            const progress = await Progress.findOne({
                student: enroll.student,
                course: enroll.course,
            });

            const completedCount = progress?.completedLessons.length || 0;

            const totalLessons = lessonCounts[enroll.course];

            const percentage = 
            totalLessons === 0
            ? 0
            : (completedCount / totalLessons) * 100;

            totalProgress += percentage;
        }

        const averageProgress = 
        totalStudents === 0
        ? 0
        : Math.round(totalProgress / totalStudents);

        res.json({
            totalCourses,
            totalStudents,
            averageProgress,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherCoursesProgress = async (req, res) => {
    try {
        if(req.user.role !== "teacher" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const teacherId = req.user.role === "admin"
        ? req.query.teacherId
        : req.user.id;

        if(!teacherId) {
            return res.status(400).json({ message: "teacherId is required for admin" });
        }

        const courses = await Course.find({ teacher: teacherId });

        const results = await Promise.all(
            courses.map(async (course) => {
                const enrollments = await Enrollment.find({
                    course: course._id,
                });

                const totalStudents = enrollments.length;

                const totalLessons = await Lesson.countDocuments({ course: course._id });

                let totalProgress = 0;

                for(let enroll of enrollments) {
                    const progress = await Progress.findOne({
                        student: enroll.student,
                        course: course._id,
                    });

                    const completedCount = progress?.completedLessons.length || 0;

                    const percentage = 
                    totalLessons === 0
                    ? 0
                    : (completedCount / totalLessons) * 100;

                    totalProgress += percentage;
                }

                const averageProgress = 
                totalStudents === 0
                ? 0
                : Math.round(totalProgress / totalStudents);

                return {
                    courseId: course._id,
                    title: course.title,
                    totalStudents,
                    averageProgress,
                };
            })
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAdminOverView = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can view this" });
        }

        const teachers = await User.find({ role: "teacher" });
        const totalTeachers = teachers.length;

        const courses = await Course.find();
        const totalCourses = courses.length;

        const courseIds = courses.map((c) => c._id);

        const enrollments = await Enrollment.find({ course: { $in: courseIds } });

        const totalStudents = enrollments.length;

        const lessonCounts = {};
        for(let course of courses) {
            const count = await Lesson.countDocuments({ course: course._id });
            lessonCounts[course._id] = count;
        }

        let totalProgress = 0;

        for(let enroll of enrollments) {
            const progress =  await Progress.findOne({
                student: enroll.student,
                course: enroll.course,
            });

            const completedCount = progress?.completedLessons.length || 0;
            const totalLessons = lessonCounts[enroll.course];

            const percentage = 
            totalLessons === 0
            ? 0
            : (completedCount / totalLessons) * 100;

            totalProgress += percentage;
        }

        const averageProgress = 
        totalStudents === 0
        ? 0
        : Math.round(totalProgress / totalStudents);

        res.json({
            totalTeachers,
            totalCourses,
            totalStudents,
            averageProgress,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAdminTeachersAnalytics = async (req, res) => {
    try {
        if(req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can view this" });
        }

        const teachers = await User.find({ role: "teacher" });
        const results = await Promise.all(
            teachers.map(async (teacher) => {
                const courses = await Course.find({
                    teacher: teacher._id,
                });

                const courseIds = courses.map((c) => c._id);
                const totalCourses = courses.length;

                const enrollments = await Enrollment.find({
                    course: { $in: courseIds },
                });

                const totalStudents = enrollments.length;
                const lessonCounts = {};

                for(let course of courses) {
                    const count = await Lesson.countDocuments({
                        course: course._id,
                    });
                    lessonCounts[course._id] = count;
                }

                let totalProgress = 0;
                for(let enroll of enrollments) {
                    const progress = await Progress.findOne({
                        student: enroll.student,
                        course: enroll.course,
                    });

                    const completedCount = progress?.completedLessons.length || 0;

                    const totalLessons = lessonCounts[enroll.course];

                    const percentage = 
                    totalLessons === 0
                    ? 0
                    : (completedCount / totalLessons) * 100;

                    totalProgress += percentage;
                }

                const averageProgress =
                totalStudents === 0
                ? 0
                : Math.round(totalProgress / totalStudents);

                return {
                    teacherId: teacher._id,
                    name: teacher.name,
                    totalCourses,
                    totalStudents,
                    averageProgress,
                };
            })
        );
        res.json(results);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    markLessonCompleted,
    unmarkLessonCompleted,
    getMyProgress,
    getCourseProgress,
    getTeacherOverview,
    getTeacherCoursesProgress,
    getAdminOverView,
    getAdminTeachersAnalytics,
};