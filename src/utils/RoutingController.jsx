import { Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Dashboard from "@/pages/Dashboard/Dashboard.jsx";
import Login from "@/pages/Auth/Login/Login";
import ForgotPassword from "@/pages/Auth/ForgotPassword/ForgotPassword";
import Roles from "@/pages/Roles/Roles";
import Users from "@/pages/Users/Users";
import ResetPassword from "@/pages/Auth/ResetPassword/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import AuthLayout from "@/components/AuthLayout/AuthLayout.jsx";

// Main routing controller component
const RoutingController = ({ token, isAuthenticated }) => {
  let userRoles = [];

  // Decode JWT token to extract user roles
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRoles = decoded.roles || [];
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  // Centralized definition of authentication-related routes
  const authRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
  ];
  return (
    <Routes>
      {isAuthenticated ? (
        <>
          {/* Default route for authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard route for users with the 'backoffice' role */}
          {userRoles.includes("Backoffice") && (
            <>
              <Route
                path="/roles"
                element={
                  <ProtectedRoute>
                    <Roles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {/* Catch-all route redirects to root for authenticated users */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {/* Render auth routes inside the AuthLayout for unauthenticated users */}
          {authRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AuthLayout>{element}</AuthLayout>}
            />
          ))}

          {/* Catch-all route redirects to login for unauthenticated users */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default RoutingController;
