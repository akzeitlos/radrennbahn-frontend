import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Chevron from "@/assets/icons/chevron.svg?react";
import { SideNavContext } from "@/context/SideNavContext"; // Adjust the path

import "./NavItem.css";

/**
 * NavItem represents a single item in the sidebar.
 * It can be a direct navigation link or a collapsible parent with subitems.
 */
export default function NavItem({
  to, // Route path if it's a direct navigation link
  end = false, // Whether to match exact path (used for root paths)
  Icon, // Optional icon component (SVG)
  label, // Display label
  children, // Optional subitems if this is a parent item
  subMenuKey,
}) {
  const location = useLocation();
  const {
    isCollapsed,
    setIsCollapsed,
    mobileOpen,
    setMobileOpen,
    openSubMenuKey,
    setOpenSubMenuKey,
  } = useContext(SideNavContext);

  const isDirectlyActive = to && location.pathname === to;

  const hasChildren = !!children;
  const isExpanded = openSubMenuKey === subMenuKey;

  // ✅ Check if any child NavItem's `to` matches the current path
  const childRoutes = React.Children.toArray(children)
    .map((child) => child?.props?.to)
    .filter(Boolean); // Only keep strings

  const isSubRouteActive = childRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  /**
   * Handle click on a parent NavItem:
   * - If sidebar is collapsed, expand it and open this submenu.
   * - If already expanded, just toggle submenu visibility.
   */
  const handleClick = () => {
    if (isCollapsed && hasChildren) {
      setIsCollapsed(false); // Expand sidebar
      setOpenSubMenuKey(subMenuKey); // open this submenu
    } else {
      setOpenSubMenuKey(isExpanded ? null : subMenuKey); // toggle
    }
  };

  function closeMobileMenu() {
    if (mobileOpen) {
      setMobileOpen(false); // Close the mobile menu
      setOpenSubMenuKey(null); // open this submenu
    }
  }

  return (
    <li
      className={`nav-item ${hasChildren ? "has-children" : ""} ${
        isSubRouteActive || isDirectlyActive ? "active" : ""
      }`}
    >
      {to ? (
        // Direct navigation link
        <NavLink
          to={to}
          end={end}
          onClick={closeMobileMenu}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          {Icon && <Icon className="icon" />}
          {!isCollapsed && <span className="link-text">{label}</span>}
        </NavLink>
      ) : (
        // Parent item with submenu
        <button
          type="button"
          className="nav-link nav-parent"
          onClick={handleClick}
        >
          {Icon && <Icon className="icon" />}
          {!isCollapsed && (
            <span className="link-text">
              {label}
              <Chevron className={`chevron ${isExpanded ? "rotated" : ""}`} />
            </span>
          )}
        </button>
      )}

      {/* Render subitems if not collapsed and parent is expanded */}
      {!isCollapsed && hasChildren && isExpanded && (
        <ul className="nav-subitems">{children}</ul>
      )}
    </li>
  );
}
