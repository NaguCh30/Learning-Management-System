import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "./ManageLessons.css";

function ManageLessons() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New lesson creation inputs
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    videoUrl: "",
    order: "",
  });
  const [creating, setCreating] = useState(false);

  const fetchLessonsData = async () => {
    try {
      setLoading(true);
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      const lessonsRes = await api.get(`/lessons/course/${id}`);
      setLessons(lessonsRes.data);
    } catch (err) {
      toast.error("Failed to load page data.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonsData();
  }, [id]);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.content) {
      toast.error("Title and Content are required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        title: newLesson.title,
        content: newLesson.content,
        videoUrl: newLesson.videoUrl || undefined,
        courseId: id,
      };
      if (newLesson.order) payload.order = parseInt(newLesson.order);

      await api.post("/lessons", payload);
      toast.success("Lesson created successfully!");
      setNewLesson({ title: "", content: "", videoUrl: "", order: "" });
      await fetchLessonsData();
    } catch (err) {
      toast.error(err.message || "Failed to create lesson.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success("Lesson deleted successfully!");
      await fetchLessonsData();
    } catch (err) {
      toast.error(err.message || "Failed to delete lesson.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="manage-lessons-page flex flex-col gap-6">
      <div className="breadcrumbs">
        <span className="crumb clickable" onClick={() => navigate(`/courses/${id}`)}>
          ➔ Back to Course Detail
        </span>
      </div>

      <div className="header-row">
        <h2 className="dashboard-title">Manage Lessons</h2>
        <p className="text-secondary">Course: <strong style={{ color: "var(--accent)" }}>{course.title}</strong></p>
      </div>

      <div className="grid gap-6 split-layout">
        {/* Left Column: Lesson builder list */}
        <div className="card glass-panel flex flex-col gap-4">
          <h3 className="section-title">Program Lessons Outline ({lessons.length})</h3>
          
          <div className="lessons-edit-list flex flex-col gap-2">
            {lessons.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "1rem" }}>
                No lessons uploaded for this curriculum yet. Use the composer form to add one.
              </p>
            ) : (
              lessons.map((lesson) => (
                <div key={lesson._id} className="syllabus-row flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="syllabus-title">#{lesson.order} - {lesson.title}</span>
                    <span className="syllabus-meta text-muted truncate" style={{ maxWidth: "300px" }}>
                      {lesson.content.substring(0, 70)}...
                    </span>
                  </div>

                  <button
                    className="btn btn-danger text-xs"
                    onClick={() => handleDeleteLesson(lesson._id)}
                    style={{ padding: "0.35rem 0.7rem" }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Composers inputs */}
        <div className="card glass-panel flex flex-col gap-4">
          <h3 className="section-title">Compose Lesson</h3>
          
          <form onSubmit={handleCreateLesson} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">Lesson Title</label>
              <input
                type="text"
                placeholder="e.g. Introduction to State management"
                value={newLesson.title}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, title: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Video URL (link to YouTube/MP4)</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, videoUrl: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order Index (optional)</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={newLesson.order}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, order: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Markdown/Contents</label>
              <textarea
                rows="6"
                placeholder="Type the detailed lesson description guide..."
                value={newLesson.content}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, content: e.target.value }))}
                className="form-input"
                style={{ resize: "none" }}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }} disabled={creating}>
              {creating ? "Saving Lesson..." : "Publish Lesson ➔"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageLessons;
