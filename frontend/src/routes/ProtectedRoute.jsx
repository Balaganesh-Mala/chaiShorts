import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin } = useContext(AuthContext);
  if (!admin) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
