import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/apiClient";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/admin/auth/login", { email, password });
      const { token, admin } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(admin));
      setAdmin(admin); // ✅ Update immediately

      toast.success("Login successful!");
      navigate("/"); // ✅ React-router redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
