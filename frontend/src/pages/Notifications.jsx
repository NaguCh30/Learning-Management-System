import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state to show read Status
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) {
      toast.error("No unread notifications to mark.");
      return;
    }

    try {
      await Promise.all(unread.map((n) => api.put(`/notifications/${n._id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark all as read.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="notifications-page flex flex-col gap-6">
      <div className="flex justify-between items-center w-full header-row">
        <h2 className="dashboard-title">Notifications</h2>
        {notifications.length > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            ✓ Mark All As Read
          </button>
        )}
      </div>

      <div className="card glass-panel flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="empty-state text-center flex flex-col items-center justify-center gap-2" style={{ padding: "4rem 2rem" }}>
            <span style={{ fontSize: "2.5rem" }}>🔔</span>
            <h3>Inbox Clean!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              You don{"'"}t have any notifications or announcements in your feed currently.
            </p>
          </div>
        ) : (
          <div className="notifications-list flex flex-col gap-2">
            {notifications.map((note) => (
              <div
                key={note._id}
                className={`notification-row flex justify-between items-center ${
                  note.isRead ? "read" : "unread"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="notif-bullet">⚡</span>
                  <div className="flex flex-col gap-1">
                    <p className="notif-text">{note.message}</p>
                    <span className="notif-date text-muted text-xs">
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {!note.isRead && (
                  <button
                    className="btn btn-secondary text-xs mark-btn"
                    onClick={() => handleMarkAsRead(note._id)}
                    style={{ padding: "0.3rem 0.6rem" }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
