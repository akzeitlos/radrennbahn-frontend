import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext.jsx";
import { SideNavContext } from "@/context/SideNavContext";
import NavItem from "@/components/Nav/NavItem/NavItem";

// Import SVG icons as React components
import Dashboard from "@/assets/icons/dashboard.svg?react";
import Athletes from "@/assets/icons/athletes.svg?react";
import Logout from "@/assets/icons/logout.svg?react";
import Profile from "@/assets/icons/profile.svg?react";
import Users from "@/assets/icons/users.svg?react";
import Chevron from "@/assets/icons/chevron.svg?react";
import Races from "@/assets/icons/races.svg?react";

// Icons
import Hamburger from "@/assets/icons/bars.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";

// Import styles
import "./SideNav.css";

export default function SideNav() {
  const navigate = useNavigate();
  const { removeAuthToken, user } = useContext(AuthContext);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenuKey, setOpenSubMenuKey] = useState(null);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/login");
    setMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 980 && mobileOpen) {
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
        <button
          className="mobile-close-button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar menu"
        >
          <CloseIcon />
        </button>

        <div className="nav-top">
          <ul className="nav-links">
            <NavItem to="/" end Icon={Dashboard} label="Dashboard" />

            <NavItem Icon={Athletes} label="Sportler" subMenuKey="athletes">
              <NavItem to="/athletes" label="Athleten" />
              <NavItem to="/clubs" label="Vereine" />
            </NavItem>

            <NavItem Icon={Races} label="Rennen" subMenuKey="races" activePaths={["/races", "/race-modes", "/race-classes", "/archive"]}>
              <NavItem to="/races" label="Rennen" />
              <NavItem to="/archive" label="Renn-Archiv" />
              {user?.roles.includes("admin") && (
                <>
                  <NavItem to="/race-modes" label="Rennmodi" />
                  <NavItem to="/race-classes" label="Rennklassen" />
                </>
              )}
            </NavItem>
          </ul>
        </div>

        <div className="nav-bottom">
          <ul className="nav-links">
            {user?.roles.includes("admin") && (
              <NavItem Icon={Users} label="Nutzerverwaltung" subMenuKey="users">
                <NavItem to="/users" label="Nutzer" />
                <NavItem to="/roles" label="Nutzergruppen" />
              </NavItem>
            )}
            <NavItem to="/profile" Icon={Profile} label="Profile" />

            <li className="logout-button nav-item">
              <button className="nav-link" onClick={handleLogout}>
                <Logout className="icon" />
                {!isCollapsed && <span className="link-text">Logout</span>}
              </button>
            </li>
          </ul>
        </div>

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
