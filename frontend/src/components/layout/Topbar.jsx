import "./Topbar.css";

function Topbar() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="topbar">
            <div className="topbar-left">
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