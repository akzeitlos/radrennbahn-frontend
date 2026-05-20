import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useRaceClasses(token) {
  const [raceClasses, setRaceClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaceClasses = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/race-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaceClasses(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Rennklassen");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaceClasses();
  }, [token]);

  const createRaceClass = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/race-classes`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaceClasses((prev) => [...prev, response.data]);
      return { success: true, raceClass: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRaceClass = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/race-classes/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaceClasses((prev) =>
        prev.map((r) => (r.id === id ? response.data : r))
      );

      return { success: true, raceClass: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRaceClass = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/race-classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaceClasses((prev) => prev.filter((r) => r.id !== id));
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
    raceClasses,
    isLoading,
    error,
    createRaceClass,
    updateRaceClass,
    deleteRaceClass,
  };
}

export default useRaceClasses;