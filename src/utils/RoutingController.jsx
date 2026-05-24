import { Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Dashboard from "@/pages/Dashboard/Dashboard.jsx";
import Login from "@/pages/Auth/Login/Login";
import ForgotPassword from "@/pages/Auth/ForgotPassword/ForgotPassword";
import Roles from "@/pages/Roles/Roles";
import Users from "@/pages/Users/Users";
import Athletes from "@/pages/Athletes/Athletes.jsx";
import Profile from "@/pages/Profile/Profile.jsx";
import Clubs from "@/pages/Clubs/Clubs.jsx";
import RaceClasses from "@/pages/RaceClasses/RaceClasses.jsx";
import Races from "@/pages/Races/Races.jsx";
import RaceSession from "@/pages/RaceSession/RaceSession.jsx";
import RaceModes from "@/pages/RaceModes/RaceModes.jsx";
import ResetPassword from "@/pages/Auth/ResetPassword/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import AuthLayout from "@/components/AuthLayout/AuthLayout.jsx";

const RoutingController = ({ token, isAuthenticated }) => {
  let userRoles = [];

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRoles = decoded.roles || [];
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  const authRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
  ];

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/races"
            element={
              <ProtectedRoute>
                <Races />
              </ProtectedRoute>
            }
          />

          <Route
            path="/races/:id/session"
            element={
              <ProtectedRoute>
                <RaceSession />
              </ProtectedRoute>
            }
          />

          {userRoles.includes("admin") && (
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
              <Route
                path="/athletes"
                element={
                  <ProtectedRoute>
                    <Athletes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clubs"
                element={
                  <ProtectedRoute>
                    <Clubs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/race-classes"
                element={
                  <ProtectedRoute>
                    <RaceClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/race-modes"
                element={
                  <ProtectedRoute>
                    <RaceModes />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {authRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AuthLayout>{element}</AuthLayout>}
            />
          ))}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default RoutingController;