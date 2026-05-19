import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function useUsers(token) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Benutzer");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect ruft fetchUsers einmal beim Mount auf (und wenn token sich ändert)
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const createUser = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          salutation: formData.salutation,
          title: formData.title,
          firstname: formData.firstname,
          lastname: formData.lastname,
          roles: formData.roles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => [...prev, response.data]);
      return { success: true, user: response.data };
    } catch (err) {
      const message = err.response?.data?.error || "Erstellung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id, formData) => {
    setIsLoading(true);
    setError(null);

    // Baue Payload dynamisch
    const payload = {
      email: formData.email,
      username: formData.username,
      salutation: formData.salutation,
      title: formData.title,
      firstname: formData.firstname,
      lastname: formData.lastname,
      roles: formData.roles,
    };

    // Passwort nur mitschicken, wenn gesetzt
    if (formData.password?.length > 0) {
      payload.password = formData.password;
    }
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${id}`,
          payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u.id === id ? response.data : u)));
      return { success: true, user: response.data };
    } catch (err) {
      const message =
        err.response?.data?.error || "Aktualisierung fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
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
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,
  };
}

export default useUsers;
