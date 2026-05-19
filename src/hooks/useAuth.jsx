import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext.jsx";

function useAuth() {
  // Zugriff auf die setAuthToken-Funktion aus dem globalen Authentifizierungscontext
  const { setAuthToken,fetchUser } = useContext(AuthContext);

  // State zur Anzeige von Ladezuständen und Fehlern
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Basis-URL der API aus den Umgebungsvariablen
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  /**
   * Führt den Login durch und gibt das Ergebnis zurück.
   * Erfolgreich: Token speichern und Erfolg zurückgeben.
   * Fehler: Fehlermeldung setzen und zurückgeben.
   */
  async function login(formData) {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        emailOrUsername: formData.emailOrUsername,
        password: formData.password,
      });
      const token = response.data.token;
      setAuthToken(token); // Token im globalen Context speichern

      await fetchUser(token);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Login fehlgeschlagen";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sendet eine Anfrage zum Zurücksetzen des Passworts.
   * Erwartet die E-Mail des Nutzers.
   */
  async function requestPasswordReset(email) {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/auth/request-reset`, {
        email,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Fehler beim Absenden";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Setzt das Passwort mithilfe eines Reset-Tokens zurück.
   * Führt vorher eine Validierung durch (Passwörter müssen übereinstimmen).
   */
  async function resetPassword(token, password, confirmPassword) {
    setLoading(true);
    setError(null);

    // Validierung: beide Passwörter müssen gleich sein
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      setLoading(false);
      return { success: false };
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || "Link ungültig oder abgelaufen.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  // Rückgabe der Funktionen und Statuswerte für Komponenten
  return { login, requestPasswordReset, resetPassword, loading, error };
}

export default useAuth;
