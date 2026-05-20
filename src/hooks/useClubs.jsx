import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useClubs(token) {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClubs = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClubs(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Vereine");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [token]);

  const createClub = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/clubs`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClubs((prev) => [...prev, response.data]);
      return { success: true, club: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateClub = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/clubs/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClubs((prev) =>
        prev.map((c) => (c.id === id ? response.data : c))
      );

      return { success: true, club: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClub = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/clubs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClubs((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Löschen fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { clubs, isLoading, error, createClub, updateClub, deleteClub };
}

export default useClubs;