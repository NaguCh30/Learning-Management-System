import "./Sidebar.css";

function Sidebar({ isCollapsed }) {
    return (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-top">
                <h2>LMS</h2>
                <div className="sidebar-menu">
                    <div className="active">Dashboard</div>
                    <div>Browsw Courses</div>
                    <div>My Courses</div>
                    <div>Quizzes</div>
                    <div>Notifications</div>
                    <div>Profile</div>
                </div>
            </div>

            <div className="sidebar-bottom">Logout</div>
        </div>
    )
}

export default Sidebar;