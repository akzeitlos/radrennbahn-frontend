import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useAthletes(token) {
  const [athletes, setAthletes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAthletes = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/athletes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAthletes(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Athleten");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [token]);

  const createAthlete = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/athletes`,
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          raceNumber: formData.raceNumber,
          gender: formData.gender,
          clubId: formData.clubId,
          raceClasses: formData.raceClasses,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAthletes((prev) => [...prev, response.data]);
      return { success: true, athlete: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAthlete = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/athletes/${id}`,
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          raceNumber: formData.raceNumber,
          gender: formData.gender,
          clubId: formData.clubId,
          raceClasses: formData.raceClasses,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAthletes((prev) =>
        prev.map((a) => (a.id === id ? response.data : a))
      );

      return { success: true, athlete: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAthlete = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/athletes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAthletes((prev) => prev.filter((a) => a.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Löschen fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Rennhistorie eines Athleten laden
  const fetchAthleteRaceHistory = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/athletes/${id}/race-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, races: response.data };
    } catch (err) {
      return { success: false, races: [] };
    }
  };

  return {
    athletes,
    isLoading,
    error,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    fetchAthleteRaceHistory,
  };
}

export default useAthletes;
