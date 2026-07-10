import { useAuth } from "../context/AuthContext";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-root-wrapper">
      {user.role === "student" && <StudentDashboard />}
      {user.role === "teacher" && <TeacherDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </div>
  );
}

export default Dashboard;