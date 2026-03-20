const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');

const createCourse = async (req, res) => {
    try {
        const { title, description, category, thumbnail } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        
        if(!description) {
            return res.status(400).json({ message: "Description is required." })
        }

        const course = await Course.create({
            title,
            description,
            category,
            thumbnail,
            teacher: req.user.id,
        });

        res.status(201).json({
            message: "Course created successfully",
            course,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { title, description, category, thumbnail } = req.body;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.thumbnail = thumbnail || course.thumbnail;

        const updatedCourse = await course.save();

        res.json({
            message: "Course updated successfully",
            course: updatedCourse,
        });
    } catch (error){
        res.status(500).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() != req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await course.deleteOne();

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        let query = {};

        if(keyword && keyword.trim() !== "") {
            query.title = {
                $regex: keyword,
                $options: "i",
            };
        }

        const courses = await Course.find(query).populate("teacher", "name email");

        const coursesWithCounts = await Promise.all(
            courses.map(async (course) => {
                const lessonCount = await Lesson.countDocuments({
                    course: course._id,
                });

                const enrollmentCount = await Enrollment.countDocuments({
                    course: course._id,
                });

                return {
                    ...course.toObject(),
                    lessonCount,
                    enrollmentCount,
                };
            })
        );
        
        res.json(coursesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate(
            "teacher",
            "name email"
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const enrollCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const studentId = req.user.id;

        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.teacher.toString() === studentId) {
            return res.status(400).json({
                message: "You cannot enroll in your own course",
            });
        }

        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
        });

        res.status(201).json({
            message: "Enrolled successfully",
            enrollment,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        res.status(500).json({ message: error.message });
    }
};

const getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user.id;
        const enrollmets = await Enrollment.find({ student: studentId })
        .populate({
            path: "course",
            populate: {
                path: "teacher",
                select: "name email",
            },
        });
        const courses = enrollmets.map((enroll) => enroll.course);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
const createLesson = async (req, res) => {
    try {
        const { title, content, videoUrl, courseId, order } = req.body;

        if(!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        if(!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        if(!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        const course = await Course.findById(courseId);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only add lesson to your own courses" });
        }

        let finalOrder;
        if(order === undefined) {
            const lastLesson = await Lesson.findOne({ course: courseId }).sort({ order: -1 });
            finalOrder = lastLesson ? lastLesson.order + 1 : 1;
        } else {
            const lessonCount = await Lesson.countDocuments({ course: courseId });
            if(order > lessonCount + 1) {
                return res.status(400).json({ message: `Order cannot be greater than ${lessonCount + 1}` });
            }

            await Lesson.updateMany(
                {
                    course: courseId,
                    order: { $gte: order },
                },
                {
                    $inc: { order: 1 },
                }
            );

            finalOrder = order;
        }

        const lesson = await Lesson.create({
            title,
            content,
            videoUrl,
            course: courseId,
            finalOrder,
        });

        res.status(201).json({
            message: "Lesson created successfully",
            lesson,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLessonsByCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        let hasAccess = false;

        if(req.user.role === "teacher") {
            if(course.teacher.toString() === req.user.id) {
                hasAccess = true;
            }
        }

        if(req.user.role === "student") {
            const enrollment = await Enrollment.findOne({
                student: req.user.id,
                course: courseId,
            });

            if(enrollment) {
                hasAccess = true;
            }
        }

        if(!hasAccess) {
            return res.status(403).json({ message: "Not authorized to view lessons" });
        }

        const keyword = req.query.keyword;
        let query = { course: courseId };
        if(keyword && keyword.trim() !== "") {
            query.title = {
                $regex: keyword,
                $options: "i",
            };
        }
        const lessons = await Lesson.find(query).sort({ order: 1 });

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reorderLessons = async (req, res) => {
    try {
        const { courseId, lessons } = req.body;

        if(!courseId || !lessons || !Array.isArray(lessons)) {
            return res.status(400).json({ message: "Course ID and Lessons array are required" });
        }

        const course = await Course.findById(courseId);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to re-arrange the lessons" });
        }

        const existingLessons = await Lesson.find({ course: courseId })
        if(existingLessons.length != lessons.length) {
            return res.status(400).json({ message: "Mismatch in lesson count" });
        }

        const existingIds = existingLessons.map((l) => l._id.toString());
        const incomingIds = lessons.map((l) => l.lessonId);

        const allMatch = incomingIds.every((id) => existingIds.includes(id));

        if(!allMatch) {
            return res.status(400).json({ message: "Invalid lesson IDs provided" });
        }

        const orders = lessons.map((l) => l.order);
        const uniqueOrders = new Set(orders);
        if(orders.length !== uniqueOrders.size) {
            return res.status(400).json({ message: "Duplicate order values not allowed" });
        }

        lessons.sort((a, b) => a.order - b.order);
        const normalizedLessons = lessons.map((l, index) => ({
            lessonId: l.lessonId,
            order: index + 1,
        }));

        await Promise.all(
            normalizedLessons.map((l) => {
                Lesson.findByIdAndUpdate(l.lessonId, { order: l.order });
            })
        );

        res.json({ message: "Lessons reordered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const { title, content, videoUrl, order } = req.body;
        const lesson = await Lesson.findById(lessonId);

        if(!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const course = await Course.findById(lesson.course);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own course lessons" });
        }

        if(title) lesson.title = title;
        if(content) lesson.content = content;
        if(videoUrl != undefined) lesson.videoUrl = videoUrl;
        if(order !== undefined) {
            const existingLesson = await Lesson.findOne({
                course: lesson.course,
                order: order,
                _id: { $ne: lessonId },
            });

            if(existingLesson) {
                return res.status(400).json({ message: "Another lesson with this order already exists" });
            }
        }

        await lesson.save();

        res.json({
            message: "Lesson updated successfully",
            lesson,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findById(lessonId);

        if(!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const course = await Course.findById(lesson.course);

        if(!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if(course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own course lessons" });
        }

        const deletedOrder = lesson.order;

        await lesson.deleteOne();

        await Lesson.updateMany(
            {
                course: lesson.course,
                order: { $gt: deletedOrder },
            },
            {
                $inc: { order: -1 },
            }
        );

        res.json({ message: "Lesson deleted and order updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createCourse,
    getMyCourses,
    updateCourse,
    deleteCourse,
    getAllCourses,
    getCourseById,
    enrollCourse,
    getEnrolledCourses,
    createLesson,
    getLessonsByCourse,
    updateLesson,
    deleteLesson,
    reorderLessons,
};