import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === "/admin/users") return "users";
    if (location.pathname === "/admin/approvals") return "approvals";
    return "overview";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.pathname === "/admin/users") {
      setActiveTab("users");
    } else if (location.pathname === "/admin/approvals") {
      setActiveTab("approvals");
    } else if (location.pathname === "/dashboard") {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  // Data states
  const [users, setUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [pendingHods, setPendingHods] = useState([]);
  const [overview, setOverview] = useState(null);
  const [teacherAnalytics, setTeacherAnalytics] = useState([]);

  // Create teacher state
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch overview statistics
      const overviewRes = await api.get("/progress/admin/overview");
      setOverview(overviewRes.data);

      // Fetch teacher analytics (rates, number of courses, registered students)
      const analyticsRes = await api.get("/progress/admin/teachers");
      setTeacherAnalytics(analyticsRes.data);

      // Fetch user lists
      const usersRes = await api.get("/users/all");
      setUsers(usersRes.data);

      // Fetch approvals data
      const ptRes = await api.get("/users/pending-teachers");
      setPendingTeachers(ptRes.data);

      const phRes = await api.get("/users/pending-hods");
      setPendingHods(phRes.data);

    } catch (err) {
      console.error("Failed to load admin metrics:", err);
      toast.error("Error loading administration data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateTeacherStatus = async (userId, newStatus) => {
    try {
      await api.put(`/users/approve-teacher/${userId}`, { status: newStatus });
      toast.success(`Teacher account ${newStatus}!`);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to update teacher registration status.");
    }
  };

  const handleUpdateHODStatus = async (userId, approve) => {
    try {
      await api.put(`/users/approve-hod/${userId}`, { approve });
      toast.success(approve ? "HOD permissions approved!" : "HOD request dismissed.");
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to update HOD role status.");
    }
  };

  const handleToggleHOD = async (userId) => {
    try {
      const res = await api.put(`/users/admin/toggle-hod/${userId}`);
      toast.success(res.data.message || "HOD role toggled successfully.");
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to toggle HOD role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;

    try {
      await api.delete(`/users/admin/delete-user/${userId}`);
      toast.success("User account deleted successfully.");
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to delete user account.");
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      toast.error("Please fill in all instructor credentials.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/users/admin/create-teacher", newTeacher);
      toast.success("Instructor account created successfully with approved access!");
      setNewTeacher({ name: "", email: "", password: "" });
      setActiveTab("users");
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to register instructor.");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard flex flex-col gap-6">
      <div className="dashboard-header flex justify-between items-center w-full header-row">
        <h2 className="dashboard-title">System Administration</h2>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Insights & Ratings
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Directory
          </button>
          <button
            className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`}
            onClick={() => setActiveTab("approvals")}
          >
            Approvals Queue ({pendingTeachers.length + pendingHods.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Provision Teacher
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {overview && (
            <div className="cards grid gap-6">
              <div className="card flex flex-col justify-center">
                <span className="card-label">Active Instructors</span>
                <span className="card-value">{overview.totalTeachers}</span>
              </div>
              <div className="card flex flex-col justify-center">
                <span className="card-label">Total Catalog Courses</span>
                <span className="card-value">{overview.totalCourses}</span>
              </div>
              <div className="card flex flex-col justify-center">
                <span className="card-label">Total Enrolled Students</span>
                <span className="card-value">{overview.totalStudents}</span>
              </div>
              <div className="card flex flex-col justify-center">
                <span className="card-label">Aggregate Student Success</span>
                <span className="card-value text-accent">{overview.averageProgress}%</span>
              </div>
            </div>
          )}

          {/* Teacher Performance Analytics Grid */}
          <div className="card glass-panel flex flex-col gap-4" style={{ marginTop: "1rem" }}>
            <h3 className="section-title">Instructor Metrics Breakdown</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Instructor Name</th>
                    <th>Courses Published</th>
                    <th>Students Enrolled</th>
                    <th>Average Class Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No instructor analytics registered yet.</td>
                    </tr>
                  ) : (
                    teacherAnalytics.map((teacher) => (
                      <tr key={teacher.teacherId}>
                        <td className="font-semibold text-primary">{teacher.name}</td>
                        <td>{teacher.totalCourses} courses</td>
                        <td>{teacher.totalStudents} students</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar-container w-24">
                              <div className="progress-bar-fill" style={{ width: `${teacher.averageProgress}%` }}></div>
                            </div>
                            <span className="font-semibold">{teacher.averageProgress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="card glass-panel flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h3 className="section-title">Directory Accounts ({filteredUsers.length})</h3>
            <input
              type="text"
              placeholder="Filter by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input"
              style={{ maxWidth: "300px" }}
            />
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>System Role</th>
                  <th>Status / Permissions</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No directory profiles matched your filters.</td>
                  </tr>
                ) : (
                  filteredUsers.map((userRow) => (
                    <tr key={userRow._id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{userRow.name}</span>
                          <span className="text-muted text-xs">{userRow.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cell-role-badge" data-role={userRow.role}>
                          {userRow.role}
                        </span>
                      </td>
                      <td>
                        {userRow.role === "teacher" && (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="status-indicator-tag" data-status={userRow.status}>
                              Account: {userRow.status}
                            </span>
                            <span className="status-indicator-tag" data-hod={userRow.isHOD?.toString()}>
                              {userRow.isHOD ? "🎓 Head of Dept (HOD)" : "Faculty staff"}
                            </span>
                          </div>
                        )}
                        {userRow.role !== "teacher" && <span className="text-muted">-</span>}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {userRow.role === "teacher" && (
                            <button
                              className="btn btn-secondary text-xs"
                              onClick={() => handleToggleHOD(userRow._id)}
                              style={{ padding: "0.25rem 0.5rem" }}
                            >
                              Toggle HOD
                            </button>
                          )}
                          <button
                            className="btn btn-danger text-xs"
                            onClick={() => handleDeleteUser(userRow._id)}
                            style={{ padding: "0.25rem 0.6rem" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "approvals" && (
        <div className="flex flex-col gap-6">
          {/* Pending Teachers Section */}
          <div className="card glass-panel flex flex-col gap-4">
            <h3 className="section-title">Pending Teacher Registrations ({pendingTeachers.length})</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Instructor Details</th>
                    <th>Email Address</th>
                    <th className="text-right">Registration Approvals</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTeachers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted" style={{ padding: "1.5rem" }}>
                        No pending instructor requests.
                      </td>
                    </tr>
                  ) : (
                    pendingTeachers.map((item) => (
                      <tr key={item._id}>
                        <td className="font-semibold text-primary">{item.name}</td>
                        <td>{item.email}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateTeacherStatus(item._id, "approved")}
                              style={{ padding: "0.38rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleUpdateTeacherStatus(item._id, "rejected")}
                              style={{ padding: "0.38rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending HOD Requests Section */}
          <div className="card glass-panel flex flex-col gap-4">
            <h3 className="section-title">Pending HOD Promotions ({pendingHods.length})</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Email Address</th>
                    <th className="text-right">HOD Board Review</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHods.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted" style={{ padding: "1.5rem" }}>
                        No pending HOD requests.
                      </td>
                    </tr>
                  ) : (
                    pendingHods.map((item) => (
                      <tr key={item._id}>
                        <td className="font-semibold text-primary">{item.name}</td>
                        <td>{item.email}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateHODStatus(item._id, true)}
                              style={{ padding: "0.38rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              Approve Promotion
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleUpdateHODStatus(item._id, false)}
                              style={{ padding: "0.38rem 0.75rem", fontSize: "0.8rem" }}
                            >
                              Dismiss Promotion
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "create" && (
        <div className="card glass-panel max-w-lg mx-auto flex flex-col gap-4 w-full" style={{ padding: "2rem" }}>
          <h3 className="section-title">Register Approved Instructor</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Create an instructor account directly. Accounts registered here bypass the approval queue and can initialize courses immediately.
          </p>

          <form onSubmit={handleCreateTeacher} className="flex flex-col gap-3">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Prof. Alan Turing"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="turing@princeton.edu"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, email: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher((prev) => ({ ...prev, password: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={creating}>
              {creating ? "Creating..." : "Provision Instructor Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
