import { useState } from "react";
import "./About.css";

function About() {
  const [activeTab, setActiveTab] = useState("guide");

  return (
    <div className="about-page flex flex-col gap-6">
      <div className="header-row">
        <h2 className="dashboard-title">About LMS Nexus</h2>
        <p className="text-secondary">Explore features overview, usage guides, and project genesis details.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="tabs flex gap-3" style={{ marginBottom: "0.5rem" }}>
        <button
          className={`tab-btn ${activeTab === "guide" ? "active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          Application Guide
        </button>
        <button
          className={`tab-btn ${activeTab === "creator" ? "active" : ""}`}
          onClick={() => setActiveTab("creator")}
        >
          About The Creator
        </button>
      </div>

      {/* Content Container */}
      <div className="about-content">
        {activeTab === "guide" && (
          <div className="guide-tab card glass-panel flex flex-col gap-5">
            <div className="guide-section">
              <h3 className="section-title text-accent">What is LMS Nexus?</h3>
              <p className="about-text" style={{ marginTop: "0.5rem" }}>
                LMS Nexus is a role-based Learning Management System designed to connect student academic progress directly with instructor curriculum tooling. The app bridges student-lecturer collaboration seamlessly inside a single, unified interface.
              </p>
            </div>

            <hr className="divider" />

            <div className="guide-section">
              <h3 className="section-title">System Role Permissions</h3>
              <div className="roles-grid grid gap-4" style={{ marginTop: "1rem" }}>
                
                {/* Students Column */}
                <div className="role-guide-card">
                  <div className="role-header flex items-center gap-2">
                    <span className="role-icon student">🎓</span>
                    <h4>Students</h4>
                  </div>
                  <ul>
                    <li>Search the course catalog.</li>
                    <li>Enroll in courses.</li>
                    <li>Study lessons and track completion.</li>
                    <li>Take quizzes.</li>
                    <li>Review detail attempt reports.</li>
                  </ul>
                </div>

                {/* Teachers Column */}
                <div className="role-guide-card">
                  <div className="role-header flex items-center gap-2">
                    <span className="role-icon teacher">✏️</span>
                    <h4>Teachers</h4>
                  </div>
                  <ul>
                    <li>Publish new courses.</li>
                    <li>Add/Delete course lessons.</li>
                    <li>Design multiple-choice quizzes.</li>
                    <li>View course dashboard stats.</li>
                    <li>Request HOD promotion.</li>
                  </ul>
                </div>

                {/* HOD Column */}
                <div className="role-guide-card">
                  <div className="role-header flex items-center gap-2">
                    <span className="role-icon hod">🔑</span>
                    <h4>HODs</h4>
                  </div>
                  <ul>
                    <li>Approve pending teacher signups.</li>
                    <li>Reject pending teacher signups.</li>
                    <li>All teacher access levels.</li>
                  </ul>
                </div>

                {/* Admins Column */}
                <div className="role-guide-card">
                  <div className="role-header flex items-center gap-2">
                    <span className="role-icon admin">🛡️</span>
                    <h4>Super Admins</h4>
                  </div>
                  <ul>
                    <li>Track rosters & delete users.</li>
                    <li>Register teachers directly.</li>
                    <li>Approve HOD status promotions.</li>
                    <li>View admin analytics charts.</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "creator" && (
          <div className="creator-tab card glass-panel flex flex-col gap-5">
            <div className="creator-profile flex items-center gap-6 flex-wrap">
              <div className="creator-avatar-container">
                <div className="creator-avatar-bubble">NC</div>
              </div>
              <div className="creator-details flex-1">
                <h3 className="creator-name">Nagu Chavala</h3>
                <p className="creator-bio" style={{ marginTop: "0.75rem" }}>
                  I designed and implemented LMS Nexus as a personal project to explore and master end-to-end full-stack architectures. This application represents a significant learning milestone, combining JWT role authorizations, MongoDB cascade handlers, Rechart analytics modules, and structural HSL variable transitions into a unified product.
                </p>
              </div>
            </div>

            <hr className="divider" />

            <div className="creator-socials flex flex-col gap-3">
              <h4 style={{ color: "var(--text-primary)", fontWeight: "600" }}>Get in Touch</h4>
              
              <div className="socials-links-grid grid gap-3">
                {/* Email Link */}
                <a href="mailto:naguch010@gmail.com" className="social-pill flex items-center gap-3">
                  <span className="social-icon">✉️</span>
                  <div className="flex flex-col">
                    <span className="social-label">Email</span>
                    <span className="social-value">naguch010@gmail.com</span>
                  </div>
                </a>

                {/* LinkedIn Link */}
                <a href="https://www.linkedin.com/in/nagu-chavala-ln/" target="_blank" rel="noopener noreferrer" className="social-pill flex items-center gap-3">
                  <span className="social-icon">💼</span>
                  <div className="flex flex-col">
                    <span className="social-label">LinkedIn</span>
                    <span className="social-value">nagu-chavala-ln</span>
                  </div>
                </a>

                {/* GitHub Link */}
                <a href="https://github.com/NaguCh30" target="_blank" rel="noopener noreferrer" className="social-pill flex items-center gap-3">
                  <span className="social-icon">💻</span>
                  <div className="flex flex-col">
                    <span className="social-label">GitHub</span>
                    <span className="social-value">NaguCh30</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default About;
