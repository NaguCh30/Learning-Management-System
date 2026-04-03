import { useState } from "react";
import "./StudentDashboard.css";

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("important");
    
    return (
        <div className="student-dashboard">
            <h2 className="dashboard-title">Dashboard</h2>
            <div className="tabs">
                <button 
                className={activeTab === "important" ? "active" : ""}
                onClick={() => setActiveTab("important")}>Important</button>

                <button 
                className={activeTab === "overview" ? "active" : ""}
                onClick={() => setActiveTab("overview")}>Overview</button>
            </div>

            {activeTab === "important" && (
                <>
                    <div className="cards">
                        <div className="card">
                            <h4>Enorlled Courses</h4>
                            <p>0</p>
                        </div>

                        <div className="card">
                            <h4>Completed Lessons</h4>
                            <p>0</p>
                        </div>

                        <div className="card">
                            <h4>Total Progress</h4>
                            <p>0%</p>
                        </div>
                    </div>

                    <div className="section-card">
                        <h3>Continue Learning</h3>
                        <p>You haven't started learning yet</p>
                        <button>Start Learning</button>
                    </div>

                    <div className="section">
                        <h3>My Courses</h3>

                        <div className="section-card">
                            <p>React Course - 70%</p>
                            <p>Node Course - 40%</p>
                            <p>DBMS Course - 20%</p>
                        </div>

                        <button className="view-btn">View All</button>
                    </div>

                    <div className="section">
                        <h3>Notifications</h3>
                        <div className="section-card">
                            <p>Quiz submitted successfully</p>
                            <p>New course available</p>
                            <p>Lesson updated</p>
                            <p>Assignment deadline approaching</p>
                        </div>
                        <button className="view-btn">View All</button>
                    </div>
                </>
            )}

            {activeTab === "overview" && (
                <div className="section-card">
                    <p>Charts coming later...</p>
                </div>
            )}
        </div>
    )
}

export default StudentDashboard;