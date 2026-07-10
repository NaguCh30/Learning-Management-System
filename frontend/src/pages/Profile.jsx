import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const { user, isTeacher } = useAuth();
  const [requestingHOD, setRequestingHOD] = useState(false);

  // Since backend doesn't support edit profile endpoints, we show details read-only.
  // We allow teachers to request HOD promotion.
  const handleRequestHOD = async () => {
    setRequestingHOD(true);
    try {
      const res = await api.post("/users/request-hod");
      toast.success(res.data.message || "HOD request submitted successfully!");
      // We can instruct the user that they must log in again to refresh HOD token claims
      toast.success("Please log out and log back in once approved to activate HOD tools.");
    } catch (err) {
      toast.error(err.message || "HOD request failed.");
    } finally {
      setRequestingHOD(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page flex flex-col gap-6">
      <h2 className="dashboard-title">My Profile</h2>

      <div className="card glass-panel profile-card flex flex-col items-center text-center gap-4">
        <div className="profile-avatar flex items-center justify-center">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="profile-name text-primary">{user.name}</h3>
          <span className="profile-email text-muted">{user.email}</span>
        </div>

        <div className="profile-details-grid grid w-full gap-4" style={{ marginTop: "1rem" }}>
          <div className="detail-item flex flex-col items-start gap-1">
            <span className="detail-lbl">User Role</span>
            <span className="detail-val uppercase font-semibold text-accent">{user.role}</span>
          </div>

          <div className="detail-item flex flex-col items-start gap-1">
            <span className="detail-lbl">Account status</span>
            <span className="detail-val status-badge" data-status={user.role === "teacher" ? user.status : "approved"}>
              {user.role === "teacher" ? user.status : "active"}
            </span>
          </div>
        </div>

        {isTeacher && (
          <div className="hod-promotion-section w-full border-t border-light" style={{ marginTop: "1.5rem", paddingTop: "1.5rem" }}>
            <h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>Department Promotion</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Request promotion to Head of Department (HOD) to gain course approval permissions for pending instructors.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleRequestHOD}
              disabled={requestingHOD}
            >
              {requestingHOD ? "Submitting Request..." : "Request HOD Designation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
