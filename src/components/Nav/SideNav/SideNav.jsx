import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import { SideNavContext } from "@/context/SideNavContext"; // Adjust the path
import NavItem from "@/components/Nav/NavItem/NavItem";

// Import SVG icons as React components
import Dashboard from "@/assets/icons/dashboard.svg?react";
import Athletes from "@/assets/icons/athletes.svg?react";
import Logout from "@/assets/icons/logout.svg?react";
import Profile from "@/assets/icons/profile.svg?react";
import Users from "@/assets/icons/users.svg?react";
import Chevron from "@/assets/icons/chevron.svg?react";

// Icons
import Hamburger from "@/assets/icons/bars.svg?react"; // <-- create or add 3 bars icon SVG
import CloseIcon from "@/assets/icons/close.svg?react"; // <-- add close icon SVG for mobile

// Import styles
import "./SideNav.css";

export default function SideNav() {
  const navigate = useNavigate();
  const { removeAuthToken, user } = useContext(AuthContext); // Access logout logic from auth context

  const [isCollapsed, setIsCollapsed] = useState(false); // State for collapsed sidebar
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenuKey, setOpenSubMenuKey] = useState(null);
  // Logout logic: remove token and redirect to login
  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
    setMobileOpen(false); // close mobile sidebar on logout
  };

  // Toggle sidebar collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close mobile sidebar on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);
  return (
    <SideNavContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        mobileOpen,
        setMobileOpen,
        openSubMenuKey,
        setOpenSubMenuKey,
      }}
    >
      {/* Hamburger menu visible only on mobile */}
      <button
        className="hamburger-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar menu"
      >
        <Hamburger />
      </button>

      <aside
        className={`side-nav ${isCollapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Close button only on mobile */}
        <button
          className="mobile-close-button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar menu"
        >
          <CloseIcon />
        </button>
        {/* === Top Section: Main Navigation === */}
        <div className="nav-top">
          <ul className="nav-links">
            {/* Main nav links */}
            <NavItem to="/" end Icon={Dashboard} label="Dashboard" />

            <NavItem
              Icon={Athletes}
              label="Sportler"
              subMenuKey="athletes"
            >
              <NavItem to="/athletes" label="Athleten" />

              <NavItem to="/clubs" label="Vereine" />

              <NavItem to="/race-classes" label="Rennklassen" />
            </NavItem>
          </ul>
        </div>

        {/* === Bottom Section: Settings, Profile, Logout === */}
        <div className="nav-bottom">
          <ul className="nav-links">
            {user?.roles.includes("admin") && (
              <NavItem Icon={Users} label="Nutzerverwaltung" subMenuKey="users">
                <NavItem to="/users" label="Nutzer" />
                <NavItem to="/roles" label="Nutzergruppen" />
              </NavItem>
            )}
            <NavItem to="/profile" Icon={Profile} label="Profile" />

            {/* Logout button styled like a nav item */}
            <li className="logout-button nav-item">
              <button className="nav-link" onClick={handleLogout}>
                <Logout className="icon" />
                {!isCollapsed && <span className="link-text">Logout</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Collapse toggle button (desktop only) */}
        {!mobileOpen && (
          <button
            className="collapse-toggle"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Chevron
              alt="Toggle"
              className={`chevron-icon ${isCollapsed ? "" : "rotated"}`}
            />
          </button>
        )}
      </aside>
    </SideNavContext.Provider>
  );
}
