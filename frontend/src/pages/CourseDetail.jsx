import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./CourseDetail.css";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStudent, isTeacher, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      // Check if enrolled (for students)
      if (isStudent) {
        const enrolledRes = await api.get("/courses/enrolled");
        const enrolledStatus = enrolledRes.data.some((c) => c._id === id);
        setIsEnrolled(enrolledStatus);

        if (enrolledStatus) {
          // Fetch student progress for this course
          const progRes = await api.get(`/progress/my/${id}`);
          setProgress(progRes.data);
        }
      } else if (isTeacher && courseRes.data.teacher?._id === user?.id) {
        setIsEnrolled(true); // Teachers have access to their own courses
      }

      // Fetch lessons (will succeed if enrolled or teacher)
      try {
        const lessonsRes = await api.get(`/lessons/course/${id}`);
        setLessons(lessonsRes.data);
      } catch (err) {
        // Safe to ignore if not enrolled (403 expected)
        console.log("Lessons locked or not accessible for this user");
      }

      // Fetch quizzes associated with this course
      try {
        // Students fetch available, teachers can fetch all
        const quizRes = await api.get("/quizzes");
        const courseQuizzes = quizRes.data.filter((q) => q.course === id);
        setQuizzes(courseQuizzes);
      } catch (err) {
        console.error("Failed to load course quizzes:", err);
      }

    } catch (error) {
      toast.error(error.message || "Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!isStudent) {
      toast.error("Only student accounts can enroll in courses.");
      return;
    }
    setEnrolling(true);
    try {
      const res = await api.post(`/courses/${id}/enroll`);
      toast.success(res.data.message || "Enrolled successfully!");
      setIsEnrolled(true);
      await fetchCourseData();
    } catch (err) {
      toast.error(err.message || "Failed to enroll.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card glass-panel flex flex-col items-center justify-center text-center p-8 gap-4">
        <span>⚠️</span>
        <h3>Course Not Found</h3>
        <button className="btn btn-primary" onClick={() => navigate("/courses")}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const isOwnCourse = course.teacher?._id === user?.id || course.teacher === user?.id;

  return (
    <div className="course-detail-page flex flex-col gap-6">
      <div className="detail-header glass-panel flex justify-between items-start gap-4">
        <div className="header-lhs flex flex-col gap-2">
          <h2 className="detail-title">{course.title}</h2>
          <div className="header-meta flex items-center gap-4">
            <span className="course-cat">{course.category || "General"}</span>
            <span className="instructor-badge">
              👨‍🏫 {course.teacher?.name || "Unknown Instructor"}
            </span>
          </div>
        </div>

        <div className="header-rhs">
          {isStudent && !isEnrolled && (
            <button className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? "Enrolling..." : "Enroll In Course"}
            </button>
          )}

          {isStudent && isEnrolled && progress && (
            <div className="progress-card flex flex-col items-end gap-1">
              <span className="progress-tag">You are enrolled</span>
              <span className="percent-label">{progress.progressPercentage}% Completed</span>
            </div>
          )}

          {isTeacher && isOwnCourse && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/teacher/courses/${id}/lessons`)}
            >
              ⚙️ Manage Course
            </button>
          )}
        </div>
      </div>

      <div className="detail-layout grid gap-6">
        <div className="layout-left flex flex-col gap-6">
          <div className="card glass-panel flex flex-col gap-3">
            <h3 className="section-title">Description</h3>
            <p className="detail-description">{course.description}</p>
          </div>

          <div className="card glass-panel flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="section-title">Course Outline ({lessons.length} Lessons)</h3>
              {isEnrolled && lessons.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/lessons/${lessons[0]._id}`, { state: { courseId: id } })}
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  ▶ Start Player
                </button>
              )}
            </div>

            <div className="outline-list flex flex-col gap-2">
              {lessons.length === 0 ? (
                <p style={{ color: "var(--text-muted)", padding: "0.5rem" }}>
                  {isEnrolled
                    ? "This course does not have any lessons uploaded yet."
                    : "Enroll to view the detailed lesson outline."}
                </p>
              ) : (
                lessons.map((lesson, idx) => {
                  const isCompleted = progress?.completedLessons?.includes(lesson._id);
                  return (
                    <div
                      key={lesson._id}
                      className={`lesson-row flex justify-between items-center ${
                        isEnrolled ? "clickable" : "locked"
                      }`}
                      onClick={() =>
                        isEnrolled &&
                        navigate(`/lessons/${lesson._id}`, { state: { courseId: id } })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="lesson-number">#{idx + 1}</span>
                        <span className="lesson-title">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          isCompleted ? (
                            <span className="completed-check" title="Marked Complete">
                              ✅
                            </span>
                          ) : (
                            <span className="bullet-circle"></span>
                          )
                        ) : (
                          <span className="lock-icon">🔒</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="layout-right flex flex-col gap-6">
          {/* Thumbnail preview */}
          {course.thumbnail && (
            <div className="card glass-panel img-card" style={{ padding: "0.5rem" }}>
              <img src={course.thumbnail} alt={course.title} className="detail-thumbnail" />
            </div>
          )}

          {/* Quizzes Sidebar Section */}
          <div className="card glass-panel flex flex-col gap-4">
            <h3 className="section-title">Course Quizzes</h3>
            <div className="flex flex-col gap-2">
              {quizzes.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No quizzes assigned to this course.
                </p>
              ) : (
                quizzes.map((quiz) => (
                  <div key={quiz._id} className="quiz-row flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="quiz-name">{quiz.title}</span>
                      <span className="quiz-q-count text-muted">
                        📚 {quiz.questions?.length || 0} Questions
                      </span>
                    </div>
                    {isEnrolled && isStudent ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/quizzes/${quiz._id}`)}
                        style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                      >
                        Attempt
                      </button>
                    ) : (
                      <span className="lock-icon">🔒</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;