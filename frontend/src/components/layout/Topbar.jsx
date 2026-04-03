import "./Topbar.css";

function Topbar({ toggleSidebar, isCollapsed }) {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="topbar">
            <div className="topbar-left">
                <button onClick={toggleSidebar}>
                    {isCollapsed ? "☰" : "✖"}
                </button>
                <h3>Welcome, {user?.name}</h3>
            </div>

            <div className="topbar-right">
                <span>🔔</span>
                <span>👤</span>
            </div>

        </div>
    )
}

export default Topbar;