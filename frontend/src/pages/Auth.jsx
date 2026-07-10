import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

function Auth() {
  const navigate = useNavigate();
  const { login, register, token } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.role
      );
      toast.success("Registration successful! You can now log in.");
      setActiveTab("login");
      // Pre-fill login email
      setLoginData((prev) => ({ ...prev, email: registerData.email }));
    } catch (error) {
      toast.error(error.message || "Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Welcome to LMS Nexus</h2>
          <p>
            Explore diverse courses, test your skills with interactive quizzes, play lessons, 
            and track your learning progress all in one unified portal.
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-toggle">
            <div className={`toggle-pill ${activeTab === "login" ? "left" : "right"}`}></div>
            <button
              className={activeTab === "login" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={activeTab === "register" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          <div className="auth-form">
            {activeTab === "login" ? (
              <motion.form
                key="login"
                onSubmit={handleLoginSubmit}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                onSubmit={handleRegisterSubmit}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <select
                    className="form-select"
                    name="role"
                    value={registerData.role}
                    onChange={handleRegisterChange}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                <div className="form-group">
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    className="form-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;