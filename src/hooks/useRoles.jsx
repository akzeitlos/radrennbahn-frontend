import { useState, useEffect } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;

function useRoles(token) {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(response.data);
        setError(null);
      } catch (err) {
        setError("Fehler beim Laden der Rollen");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [token]);

  const createRole = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/roles`,
        {
          name: formData.name,
          description: formData.description === "" ? null : formData.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles((prev) => [...prev, response.data]);
      return { success: true, role: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (id, formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/roles/${id}`,
        {
          name: formData.name,
          description: formData.description === "" ? null : formData.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles((prev) => prev.map((r) => (r.id === id ? response.data : r)));
      return { success: true, role: response.data };
    } catch (err) {
      const message =
        err.response?.data?.error || "Aktualisierung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRole = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Löschen fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
  };
}

export default useRoles;
