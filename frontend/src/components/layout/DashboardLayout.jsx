import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="dashboard-layout">
            <Sidebar isCollapsed={isCollapsed} />

            <div className="dashboard-content">
                <Topbar
                    toggleSidebar={() => setIsCollapsed(prev => !prev)}
                    isCollapsed={isCollapsed}
                />

                <div className="main-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout;