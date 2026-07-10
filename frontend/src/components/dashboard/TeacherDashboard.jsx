import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [courseProgressData, setCourseProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Course details modal trigger states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
  });
  const [savingCourse, setSavingCourse] = useState(false);

  const fetchTeacherData = async () => {
    if (user?.status !== "approved") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch teacher courses
      const courseRes = await api.get("/courses/my");
      setCourses(courseRes.data);

      // Fetch teacher overview metrics
      const overviewRes = await api.get("/progress/teacher/overview");
      setAnalytics(overviewRes.data);

      // Fetch teacher course progress analytics
      const progressRes = await api.get("/progress/teacher/courses");
      setCourseProgressData(
        progressRes.data.map((item) => ({
          name: item.title.substring(0, 12) + (item.title.length > 12 ? "..." : ""),
          "Avg Progress": item.averageProgress || 0,
          "Students": item.totalStudents || 0,
        }))
      );

    } catch (err) {
      toast.error("Failed to load teacher analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.description) {
      toast.error("Title and Description are required.");
      return;
    }

    setSavingCourse(true);
    try {
      await api.post("/courses", newCourse);
      toast.success("Course created successfully!");
      setShowCreateModal(false);
      setNewCourse({ title: "", description: "", category: "", thumbnail: "" });
      await fetchTeacherData();
    } catch (err) {
      toast.error(err.message || "Failed to create course.");
    } finally {
      setSavingCourse(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  // Pending approval screen
  if (user?.status === "pending") {
    return (
      <div className="card glass-panel flex flex-col items-center justify-center text-center p-8 gap-4 max-w-lg mx-auto" style={{ marginTop: "4rem" }}>
        <span style={{ fontSize: "3rem" }}>⏳</span>
        <h3>Verification Pending</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Your instructor registration is pending approval by the Academic Head of Department (HOD) or System Administrators. 
          You will have access to course tools and curriculum builder as soon as your account status updates.
        </p>
      </div>
    );
  }

  // Rejected screen
  if (user?.status === "rejected") {
    return (
      <div className="card glass-panel flex flex-col items-center justify-center text-center p-8 gap-4 max-w-lg mx-auto" style={{ marginTop: "4rem" }}>
        <span style={{ fontSize: "3rem" }}>❌</span>
        <h3 style={{ color: "var(--accent)" }}>Approval Rejected</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Your profile request has been rejected. Please reach out to administration at admin@lmsnexus.edu for clarification.
        </p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard flex flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="dashboard-title">Instructor Studio</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          ➕ Create Course
        </button>
      </div>

      {analytics && (
        <div className="cards grid gap-6">
          <div className="card flex flex-col justify-center">
            <span className="card-label">Courses Designed</span>
            <span className="card-value">{analytics.totalCourses}</span>
          </div>
          <div className="card flex flex-col justify-center">
            <span className="card-label">Total Enrolled Students</span>
            <span className="card-value">{analytics.totalStudents}</span>
          </div>
          <div className="card flex flex-col justify-center">
            <span className="card-label">Average Class Success</span>
            <span className="card-value text-accent">{analytics.averageProgress}%</span>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {courseProgressData.length > 0 && (
        <div className="card glass-panel" style={{ height: "320px", marginTop: "1rem" }}>
          <h3 className="section-title" style={{ marginBottom: "1.5rem" }}>Course Performance Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={courseProgressData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="Avg Progress" fill="var(--accent)" name="Avg Progress (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Students" fill="#f59e0b" name="Students Registered" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course List & Management Grid */}
      <div className="card glass-panel flex flex-col gap-4">
        <h3 className="section-title">Program Syllabus</h3>
        <div className="flex flex-col gap-2 syllabus-list">
          {courses.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "1rem" }}>You haven't built any courses yet. Click "Create Course" to start.</p>
          ) : (
            courses.map((c) => (
              <div
                key={c._id}
                className="syllabus-row flex justify-between items-center clickable"
                onClick={() => navigate(`/courses/${c._id}`)}
              >
                <div className="flex flex-col">
                  <span className="syllabus-title">{c.title}</span>
                  <span className="syllabus-meta text-muted">
                    📚 Category: {c.category || "General"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/courses/${c._id}/lessons`);
                    }}
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
                  >
                    📝 Lessons
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/courses/${c._id}/add-quiz`);
                    }}
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
                  >
                    ❓ Add Quiz
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Course Modal Dialog */}
      {showCreateModal && (
        <div className="modal-overlay flex items-center justify-center">
          <div className="modal-box card glass-panel flex flex-col gap-4">
            <h3 className="modal-title">Define New Curriculum</h3>
            
            <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Git and Version Control"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse((p) => ({ ...p, title: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Design, Humanities"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse((p) => ({ ...p, category: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/thumbnail.png"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse((p) => ({ ...p, thumbnail: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Description</label>
                <textarea
                  rows="4"
                  placeholder="Outline the course objectives and learning outcomes..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse((p) => ({ ...p, description: e.target.value }))}
                  className="form-input"
                  style={{ resize: "none" }}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingCourse}>
                  {savingCourse ? "Saving..." : "Verify & Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
