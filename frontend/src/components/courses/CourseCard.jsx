import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./CourseCard.css";

function CourseCard({ course, onEnrollSuccess }) {
  const navigate = useNavigate();
  const { isStudent } = useAuth();

  const handleCardClick = () => {
    navigate(`/courses/${course._id}`);
  };

  const handleEnroll = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/courses/${course._id}/enroll`);
      toast.success(res.data.message || "Enrolled successfully!");
      if (onEnrollSuccess) onEnrollSuccess();
    } catch (err) {
      toast.error(err.message || "Enrolment failed.");
    }
  };

  return (
    <div className="course-card glass-panel flex flex-col justify-between" onClick={handleCardClick}>
      <div className="card-top">
        <div className="card-header flex justify-between items-start">
          <h3 className="course-title">{course.title || "Untitled Course"}</h3>
          <span className="course-cat">{course.category || "General"}</span>
        </div>

        <div className="card-thumbnail">
          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
            alt={course.title}
            className="thumbnail-img"
            onError={(e) => {
              e.target.onerror = null; // Prevent looping
              e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <div className="instructor-info flex flex-col">
          <span className="by text-muted">Created by</span>
          <span className="instructor-name">{course.teacher?.name || "Unknown Instructor"}</span>
          <span className="instructor-email text-muted">{course.teacher?.email}</span>
        </div>

        <div className="stats-row flex justify-between">
          <div className="stat flex flex-col">
            <span className="stat-num">{course.lessonCount || 0}</span>
            <span className="stat-label">Lessons</span>
          </div>
          <div className="stat flex flex-col items-center">
            <span className="stat-num">{course.enrollmentCount || 0}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>

        {isStudent && (
          <div className="enroll-action" style={{ marginTop: "1rem" }}>
            <button className="btn btn-primary w-full" onClick={handleEnroll}>
              Enroll Now ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCard;