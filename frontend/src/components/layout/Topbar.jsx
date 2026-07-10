import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Topbar.css";

function Topbar({ toggleSidebar, isCollapsed }) {
  const { user, isHOD } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      // Find count of notifications where read status is false
      const unreadList = res.data.filter((n) => !n.isRead);
      setUnreadCount(unreadList.length);
    } catch (err) {
      console.error("Failed to load notifications count:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getRoleBadgeClass = () => {
    if (!user) return "";
    if (user.role === "admin") return "badge-admin";
    if (isHOD) return "badge-hod";
    if (user.role === "teacher") return "badge-teacher";
    return "badge-student";
  };

  const getRoleText = () => {
    if (!user) return "";
    if (user.role === "admin") return user.adminType === "super" ? "Super Admin" : "Admin";
    if (isHOD) return "HOD";
    if (user.role === "teacher") return "Teacher";
    return "Student";
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </button>
        <span className="welcome-msg">
          Welcome back, <strong className="user-name">{user?.name}</strong>
        </span>
        {user && <span className={`role-badge ${getRoleBadgeClass()}`}>{getRoleText()}</span>}
      </div>

      <div className="topbar-right">
        <button className="action-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        
        <div className="notification-bell-container" onClick={() => navigate("/notifications")} title="Notifications">
          <button className="action-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>

        <div className="user-avatar-wrapper" onClick={() => navigate("/profile")} title="View Profile">
          <div className="user-avatar">
            {user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;