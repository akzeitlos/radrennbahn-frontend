import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useRaces(token) {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaces = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/races`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaces(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Rennen");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, [token]);

  const createRace = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/races`,
        {
          date: formData.date,
          raceModeId: formData.raceModeId,
          rounds: formData.rounds,
          scoringInterval: formData.scoringInterval,
          lapdownMode: formData.lapdownMode,
          lapdownPointsWin: formData.lapdownPointsWin,
          lapdownPointsLoss: formData.lapdownPointsLoss,
          pointsFirst: formData.pointsFirst,
          pointsSecond: formData.pointsSecond,
          pointsThird: formData.pointsThird,
          pointsFourth: formData.pointsFourth,
          raceClasses: formData.raceClasses ?? [],
          athletes: formData.athletes ?? [],
          danishScoringRounds: formData.danishScoringRounds ?? [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaces((prev) => [...prev, response.data]);
      return { success: true, race: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateRace = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/races/${id}`,
        {
          date: formData.date,
          raceModeId: formData.raceModeId,
          rounds: formData.rounds,
          scoringInterval: formData.scoringInterval,
          lapdownMode: formData.lapdownMode,
          lapdownPointsWin: formData.lapdownPointsWin,
          lapdownPointsLoss: formData.lapdownPointsLoss,
          pointsFirst: formData.pointsFirst,
          pointsSecond: formData.pointsSecond,
          pointsThird: formData.pointsThird,
          pointsFourth: formData.pointsFourth,
          raceClasses: formData.raceClasses,
          athletes: formData.athletes,
          danishScoringRounds: formData.danishScoringRounds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRaces((prev) =>
        prev.map((r) => (r.id === id ? response.data : r))
      );

      return { success: true, race: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRace = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE_URL}/races/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRaces((prev) => prev.filter((r) => r.id !== id));
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
    races,
    isLoading,
    error,
    createRace,
    updateRace,
    deleteRace,
  };
}

export default useRaces;