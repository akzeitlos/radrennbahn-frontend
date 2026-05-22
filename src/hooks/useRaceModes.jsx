import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useRaceModes(token) {
  const [raceModes, setRaceModes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaceModes = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/race-modes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaceModes(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Rennmodi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaceModes();
  }, [token]);

  const createRaceMode = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/race-modes`,
        {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaceModes((prev) => [...prev, response.data]);
      return { success: true, raceMode: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRaceMode = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/race-modes/${id}`,
        {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaceModes((prev) =>
        prev.map((m) => (m.id === id ? response.data : m))
      );

      return { success: true, raceMode: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRaceMode = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/race-modes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaceModes((prev) => prev.filter((m) => m.id !== id));
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
    raceModes,
    isLoading,
    error,
    createRaceMode,
    updateRaceMode,
    deleteRaceMode,
  };
}

export default useRaceModes;