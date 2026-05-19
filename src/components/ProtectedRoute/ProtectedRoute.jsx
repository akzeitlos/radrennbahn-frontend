import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import { useContext } from "react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx"; // oder dein Spinner

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner />; // Zeige Ladeindikator bis Auth-Status bekannt ist
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
