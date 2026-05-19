// Import necessary hooks from React
import { createContext } from "react";

/**
 * SideNavContext provides global access to the sidebar's collapsed state
 * across the component tree without needing to prop-drill.
 */
export const SideNavContext = createContext({
  isCollapsed: false, // Whether the sidebar is currently collapsed
  setIsCollapsed: () => {}, // Function to update collapsed state
  mobileOpen: false,
  setMobileOpen: () => {},
  openSubMenuKey: null,
  setOpenSubMenuKey: () => {},
});
