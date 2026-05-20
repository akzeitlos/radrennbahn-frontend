import React, { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import RoutingController from "@/utils/RoutingController.jsx";
import SideNav from "@/components/Nav/SideNav/SideNav.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

// CSS
import "./styles/variables.css";
import "./styles/fonts.css";
import "./styles/clearing.css";
import "./App.css";

// Inline definierte AppContent-Komponente
const AppContent = () => {
  const { token, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app-layout">
      {isAuthenticated && <SideNav />}
      <main className="main-content">
        <RoutingController token={token} isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
};

// Root-Komponente
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
