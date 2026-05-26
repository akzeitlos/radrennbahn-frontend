import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useCrudApi(endpoint, token) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    axios
      .get(`${API_BASE_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch(() => setError("Fehler beim Laden"))
      .finally(() => setIsLoading(false));
  }, [token, endpoint]);

  const createItem = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.put(`${API_BASE_URL}/${endpoint}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.error || "Update fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Löschen fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { items, isLoading, error, createItem, updateItem, deleteItem };
}

export default useCrudApi;
