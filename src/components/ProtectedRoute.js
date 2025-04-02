import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
const ProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Chưa đăng nhập");

        const response = await axios.get(`${API_URL}/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsAdmin(true);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <p>Đang kiểm tra quyền truy cập...</p>;
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
