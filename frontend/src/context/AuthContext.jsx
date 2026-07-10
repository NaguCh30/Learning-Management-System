import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentToken) => {
    try {
      const res = await api.get("/users/profile");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem("token", userToken);
      setToken(userToken);
      
      // The profile endpoint returns fuller information like adminType and hodStatus
      // which is decode-sourced, so let's hit profile after setting token.
      api.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      const profileRes = await api.get("/users/profile");
      setUser(profileRes.data.user);
      
      return profileRes.data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post("/users/register", { name, email, password, role });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // Helper flags
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const isHOD = user?.role === "teacher" && user?.adminType === "hod" && user?.hodStatus === "approved";
  const isSuperAdmin = user?.role === "admin" && user?.adminType === "super";

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isStudent,
        isTeacher,
        isAdmin,
        isHOD,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
