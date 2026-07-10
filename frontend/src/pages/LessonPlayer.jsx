import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./LessonPlayer.css";

function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courseId, setCourseId] = useState(() => {
    const stateId = location.state?.courseId;
    if (stateId) {
      sessionStorage.setItem("activeCourseId", stateId);
      return stateId;
    }
    return sessionStorage.getItem("activeCourseId") || "";
  });

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingProgress, setTogglingProgress] = useState(false);

  const fetchLessonData = async () => {
    if (!courseId) {
      toast.error("Invalid Course context. Returning to catalog.");
      navigate("/courses");
      return;
    }

    try {
      setLoading(true);
      // Fetch lessons for the course
      const lessonsRes = await api.get(`/lessons/course/${courseId}`);
      setLessons(lessonsRes.data);

      const foundLesson = lessonsRes.data.find((l) => l._id === lessonId);
      if (!foundLesson) {
        toast.error("Lesson not found in this course.");
        navigate(`/courses/${courseId}`);
        return;
      }
      setCurrentLesson(foundLesson);

      // Fetch progress
      const progRes = await api.get(`/progress/my/${courseId}`);
      setCompletedLessons(progRes.data.completedLessons || []);
    } catch (err) {
      toast.error("Failed to load lesson context.");
      navigate(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [lessonId, courseId]);

  const currentIndex = lessons.findIndex((l) => l._id === lessonId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  const navigateToIndex = (index) => {
    if (index >= 0 && index < lessons.length) {
      navigate(`/lessons/${lessons[index]._id}`);
    }
  };

  const handleToggleComplete = async () => {
    if (!currentLesson || togglingProgress) return;
    setTogglingProgress(true);

    const isCompleted = completedLessons.includes(currentLesson._id);
    const endpoint = isCompleted ? "/progress/uncomplete" : "/progress/complete";

    try {
      await api.post(endpoint, {
        courseId,
        lessonId: currentLesson._id,
      });

      toast.success(isCompleted ? "Marked as incomplete" : "Lesson completed!");
      
      // Update local complete state
      setCompletedLessons((prev) =>
        isCompleted
          ? prev.filter((id) => id !== currentLesson._id)
          : [...prev, currentLesson._id]
      );
    } catch (err) {
      toast.error("Failed to update progress.");
    } finally {
      setTogglingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentLesson) return null;

  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname.includes("/embed/")) {
          return url;
        }
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      } else if (urlObj.hostname.includes("youtu.be")) {
        const id = urlObj.pathname.substring(1);
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {
      // fallback to regex match
    }
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[2].length === 12 || match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  const isCompleted = completedLessons.includes(currentLesson._id);

  return (
    <div className="lesson-player-page flex flex-col gap-6">
      <div className="player-breadcrumbs">
        <span className="crumb clickable" onClick={() => navigate(`/courses/${courseId}`)}>
          ➔ Back to Course Detail
        </span>
      </div>

      <div className="player-grid grid gap-6">
        {/* Left Column: Lesson Player and markdown contents */}
        <div className="player-main flex flex-col gap-6">
          <div className="card glass-panel flex flex-col gap-4">
            <h2 className="lesson-player-title">{currentLesson.title}</h2>
            
            {currentLesson.videoUrl ? (
              <div className="video-viewport">
                <iframe
                  className="video-iframe"
                  src={getEmbedUrl(currentLesson.videoUrl)}
                  title={currentLesson.title}
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="no-video-placeholder flex flex-col items-center justify-center text-muted">
                <span>🎥</span>
                <p>No video lecture associated with this lesson.</p>
              </div>
            )}

            <div className="player-actions flex justify-between items-center" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-secondary"
                disabled={!hasPrev}
                onClick={() => navigateToIndex(currentIndex - 1)}
              >
                ◀ Previous
              </button>

              <button
                className={`btn ${isCompleted ? "btn-secondary completed-accent" : "btn-primary"}`}
                onClick={handleToggleComplete}
                disabled={togglingProgress}
              >
                {isCompleted ? "✓ Completed" : "Mark as Completed"}
              </button>

              <button
                className="btn btn-secondary"
                disabled={!hasNext}
                onClick={() => navigateToIndex(currentIndex + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>

          <div className="card glass-panel flex flex-col gap-4">
            <h3 className="section-title">Lesson Overview</h3>
            <p className="lesson-content-text">{currentLesson.content}</p>
          </div>
        </div>

        {/* Right Column: Playlist index */}
        <div className="player-sidebar flex flex-col gap-6">
          <div className="card glass-panel flex flex-col gap-4">
            <h3 className="section-title">Course Outline</h3>
            
            <div className="outline-list flex flex-col gap-2">
              {lessons.map((l, idx) => {
                const isActive = l._id === lessonId;
                const isLComplete = completedLessons.includes(l._id);

                return (
                  <div
                    key={l._id}
                    className={`outline-row flex items-center justify-between clickable ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => navigate(`/lessons/${l._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="lesson-number">#{idx + 1}</span>
                      <span className="playlist-title">{l.title}</span>
                    </div>

                    {isLComplete ? <span className="completed-check">✅</span> : <span className="bullet-circle"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPlayer;
