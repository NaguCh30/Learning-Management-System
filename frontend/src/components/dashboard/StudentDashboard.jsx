import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../../services/api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("important");
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);

  const COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444"];
  const navigate = useNavigate();

  const totalProgress = chartData.reduce((acc, item) => acc + item.progress, 0);
  const avgProgress =
    chartData.length === 0
      ? 0
      : Math.round(totalProgress / chartData.length);

  const pieData = [
    { name: "Completed Progress", value: avgProgress },
    { name: "Remaining Progress", value: 100 - avgProgress },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch enrolled courses
      const enrolledRes = await api.get("/courses/enrolled");
      const enrolledCourses = enrolledRes.data;
      setCourses(enrolledCourses);

      // Fetch notifications
      const notifRes = await api.get("/notifications");
      setNotifications(notifRes.data);

      if (enrolledCourses.length > 0) {
        // Fetch first course progress for the "Resume learning" card
        const firstCourseId = enrolledCourses[0]._id;
        const progressRes = await api.get(`/progress/my/${firstCourseId}`);
        setProgress({ ...progressRes.data, course: enrolledCourses[0] });

        // Retrieve aggregate analytics across all enrolled courses
        let totalCompleted = 0;
        let completedCoursesCount = 0;
        const results = await Promise.all(
          enrolledCourses.map(async (course) => {
            const courseProgRes = await api.get(`/progress/my/${course._id}`);
            const completed = courseProgRes.data.completedCount || 0;
            const total = courseProgRes.data.totalLessons || 0;
            totalCompleted += completed;

            if (total > 0 && completed === total) {
              completedCoursesCount++;
            }

            return {
              name: course.title.substring(0, 15) + (course.title.length > 15 ? "..." : ""),
              progress: courseProgRes.data.progressPercentage || 0,
            };
          })
        );
        setChartData(results);
        setTotalCompletedLessons(totalCompleted);
        setCompletedCourses(completedCoursesCount);
      }
    } catch (err) {
      console.error("Failed to load student dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header flex justify-between items-center w-full">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "important" ? "active" : ""}`}
            onClick={() => setActiveTab("important")}
          >
            Insights & Tasks
          </button>
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Analytics Overview
          </button>
        </div>
      </div>

      {activeTab === "important" && (
        <>
          {loading ? (
            <div className="cards grid gap-6">
              <div className="card skeleton" style={{ height: "120px" }}></div>
              <div className="card skeleton" style={{ height: "120px" }}></div>
              <div className="card skeleton" style={{ height: "120px" }}></div>
            </div>
          ) : (
            <div className="cards grid gap-6">
              <div className="card flex flex-col justify-center">
                <span className="card-label">Enrolled Courses</span>
                <span className="card-value">{courses.length}</span>
              </div>

              <div className="card flex flex-col justify-center">
                <span className="card-label">Completed Items</span>
                <span className="card-value" style={{ fontSize: "1.5rem" }}>
                  🏆 {completedCourses} Courses / 📖 {totalCompletedLessons} Lessons
                </span>
              </div>

              <div className="card flex flex-col justify-center">
                <span className="card-label">Average Progress</span>
                <span className="card-value text-accent">{avgProgress}%</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 dashboard-sections" style={{ marginTop: "1.5rem" }}>
            {/* Resume Course Card */}
            <div className="card glass-panel flex flex-col gap-4">
              <h3 className="section-title">Resume Learning</h3>
              {progress ? (
                <div className="flex flex-col gap-2">
                  <h4 style={{ color: "var(--accent)" }}>{progress.course.title}</h4>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress.progressPercentage}%` }}></div>
                  </div>
                  <span className="progress-text">{progress.progressPercentage}% Completed</span>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => navigate(`/courses/${progress.course._id}`)}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Resume Course
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2" style={{ padding: "1rem" }}>
                  <p style={{ color: "var(--text-secondary)" }}>You have not enrolled or started any coursework yet.</p>
                  <button className="btn btn-primary" onClick={() => navigate("/courses")}>
                    Browse Course Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Enrolled Courses Mini-List */}
            <div className="card glass-panel flex flex-col gap-4">
              <h3 className="section-title">Enrolled Courses</h3>
              <div className="flex flex-col gap-2">
                {courses.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No enrolled courses found.</p>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <div
                      key={course._id}
                      className="enrollment-row flex justify-between items-center"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      <span className="row-title">{course.title}</span>
                      <span className="row-arrow">➔</span>
                    </div>
                  ))
                )}
              </div>
              {courses.length > 3 && (
                <button className="btn btn-secondary w-full" onClick={() => navigate("/my-courses")}>
                  View All Enrollments
                </button>
              )}
            </div>
          </div>

          {/* Notifications Mini-View */}
          <div className="card glass-panel flex flex-col gap-4" style={{ marginTop: "1.5rem" }}>
            <div className="flex justify-between items-center">
              <h3 className="section-title">Recent Notifications</h3>
              <button className="btn btn-secondary" onClick={() => navigate("/notifications")} style={{ padding: "0.4rem 0.8rem" }}>
                Inbox
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {notifications.length === 0 ? (
                <p style={{ color: "var(--text-muted)", padding: "0.5rem" }}>All caught up! No notifications.</p>
              ) : (
                notifications.slice(0, 3).map((note) => (
                  <div key={note._id} className={`notification-item ${note.isRead ? "read" : "unread"}`}>
                    <span className="notif-bullet">⚡</span>
                    <span className="notif-msg">{note.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "overview" && (
        <div className="analytics-tab grid gap-6" style={{ marginTop: "1.5rem" }}>
          <div className="card glass-panel" style={{ height: "360px" }}>
            <h3 className="section-title" style={{ marginBottom: "1.5rem" }}>Enrolled Course progress</h3>
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">No progress analytics to show.</div>
            ) : (
              <ResponsiveContainer width="100%" height={265}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="progress" fill="var(--accent)" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card glass-panel flex flex-col" style={{ height: "360px" }}>
            <h3 className="section-title" style={{ marginBottom: "1.5rem" }}>Average Completion Percentage</h3>
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted">No details to show.</div>
            ) : (
              <ResponsiveContainer width="100%" height={265}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={65}
                    paddingAngle={4}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    animationDuration={800}
                  >
                    <Cell fill="var(--accent)" />
                    <Cell fill="var(--border)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;