import { useState, useEffect, useCallback  } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext.jsx";

export function AuthProvider({ children }) {

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // fetchUser mit useCallback memoisieren
  const fetchUser = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Fehler beim Laden des Benutzers:", err);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]); // API_BASE_URL als Abhängigkeit, falls es sich ändert
  
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);


  function setAuthToken(tokenFromApi) {
    localStorage.setItem("token", tokenFromApi);
    setToken(tokenFromApi);
  }

  function removeAuthToken() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setAuthToken,
        removeAuthToken,
        isAuthenticated,
        isLoading,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
