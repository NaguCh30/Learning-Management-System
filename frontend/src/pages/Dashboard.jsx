import StudentDashboard from "../components/StudentDashboard";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Topbar />

                <div style={{ flex: 1, padding: "20px" }}>
                    {user?.role === "student" && <StudentDashboard />}
                    {user?.role === "teacher" && <p>Teacher Dashboard</p>}
                    {user?.role === "admin" && <p>Admin Dashboard</p>}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;