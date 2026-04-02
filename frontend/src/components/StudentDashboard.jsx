import { useState } from "react";

function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("important");
    
    return (
        <div>
            <h2>Dashboard</h2>
            <div style={{
                marginBottom: "20px"
            }}>
                <button onClick={() => setActiveTab("important")}>Important</button>
                <button onClick={() => setActiveTab("overview")}>Overview</button>
            </div>

            {activeTab === "important" && (
                <div>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "10px" }}>
                            <h4>Enorlled Courses</h4>
                            <p>0</p>
                        </div>

                        <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "10px" }}>
                            <h4>Completed Lessons</h4>
                            <p>0</p>
                        </div>

                        <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "10px" }}>
                            <h4>Total Progress</h4>
                            <p>0%</p>
                        </div>
                    </div>

                    <div style={{ padding: "20px", background: "#f5f5f5", borderRadius: "10px", marginBottom: "20px" }}>
                        <h3>Continue Learning</h3>
                        <p>You haven't started learning yet</p>
                        <button>Start Learning</button>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <h3>My Courses</h3>

                        <div style={{ padding: "15px", background: "#f5f5f5", borderRadius: "10px" }}>
                            <p>React Course - 70%</p>
                            <p>Node Course - 40%</p>
                            <p>DBMS Course - 20%</p>
                        </div>

                        <button style={{ marginTop: "10px" }}>View All</button>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <h3>Notifications</h3>
                        <div style={{ padding: "15px", background: "#f5f5f5", borderRadius: "10px" }}>
                            <p>Quiz submitted successfully</p>
                            <p>New course available</p>
                            <p>Lesson updated</p>
                            <p>Assignment deadline approaching</p>
                        </div>
                        <button style={{ marginTop: "10px" }}>View All</button>
                    </div>
                </div>
            )}

            {activeTab === "overview" && (
                <div>
                    <p>Overview Section (Charts later)</p>
                </div>
            )}
        </div>
    )
}

export default StudentDashboard;