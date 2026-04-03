import { useState } from "react";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import "../components/layout/DashboardLayout.css";

function Dashboard() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="dashboard-layout">
            <Sidebar isCollapsed={isCollapsed}/>

            <div className="dashboard-content">
                <Topbar toggleSidebar={() => setIsCollapsed(prev => !prev)} isCollapsed={isCollapsed}/>

                <div className="main-content">
                    {user?.role === "student" && <StudentDashboard />}
                    {user?.role === "teacher" && <p>Teacher Dashboard</p>}
                    {user?.role === "admin" && <p>Admin Dashboard</p>}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;