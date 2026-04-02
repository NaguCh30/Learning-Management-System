import { useState, useEffect } from "react";
import "../styles/Auth.css";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Auth() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("login");
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
    const [loading, setLoading] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                }
            );

            const data = await res.json();

            if(!res.ok) {
                toast.error(data.message);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            console.log("Login Success:", data);

            navigate("/dashboard");
        } catch (error) {
            console.log("Error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(registerData),
                }
            );
            const data = await res.json();

            if(!res.ok) {
                toast.error(data.message);
                return;
            }
            toast.success("Registration successful!");
            console.log("Register Success", data);

            setActiveTab("login");
        } catch (error) {
            console.log("Error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div className="auth-left">
                    <h2>Welcome to LMS</h2>
                    <p>
                        Manage your learning, track progress, and stay connectd with your courses.
                    </p>
                </div>

                <div className="auth-right">

                    <div className="auth-toggle">
                        <div
                            className={`toggle-pill ${
                                activeTab === "login" ? "left" : "right"
                            }`}
                        ></div>
                        <button 
                            className={activeTab === "login" ? "active" : ""}
                            onClick={() => setActiveTab("login")}
                        >
                            Login
                        </button>
                        <button 
                            className={activeTab === "register" ? "active" : ""}
                            onClick={() => setActiveTab("register")}
                        >
                            Register
                        </button>
                    </div>

                    <div className="auth-form">
                        {activeTab == "login" ? (
                            <motion.form
                                key="login"
                                onSubmit={handleLoginSubmit}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    value={loginData.email} 
                                    onChange={handleLoginChange} 
                                />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="password" 
                                    value={loginData.password} 
                                    onChange={handleLoginChange} 
                                />
                                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="register"
                                onSubmit={handleRegisterSubmit}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Full Name" 
                                    value={registerData.name} 
                                    onChange={handleRegisterChange} 
                                />

                                <select
                                    name="role"
                                    value={registerData.role}
                                    onChange={handleRegisterChange}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>

                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    value={registerData.email} 
                                    onChange={handleRegisterChange} 
                                />

                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="password" 
                                    value={registerData.password} 
                                    onChange={handleRegisterChange} 
                                />

                                <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
                            </motion.form>
                        )
                        }
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Auth;