import { createContext } from "react";

/**
 * AuthContext provides authentication state and functions.
 */
export const AuthContext = createContext({
  token: null,
  user: null,
  setUser: () => {},
  setAuthToken: () => {},
  removeAuthToken: () => {},
  isAuthenticated: false,
  isLoading: true,
  fetchUser: () => {},
});
