import { useState } from "react";
import Input from "@/components/FormElements/Input/Input.jsx";
import useAuth from "@/hooks/useAuth.jsx"; // Custom hook to handle auth logic
import Button from "@/components/Button/Button.jsx";
import "./ForgotPassword.css";
import "../Auth.css";

/**
 * ForgotPassword provides a form for users to request a password reset.
 * It uses the custom `useAuth` hook to handle the reset logic.
 */
function ForgotPassword() {
  const [email, setEmail] = useState(""); // Stores the user's email input
  const { requestPasswordReset, error } = useAuth(); // Custom hook provides request function and any error
  const [message, setMessage] = useState(null); // Feedback message after submission

  /**
   * Handles form submission by calling the password reset request function.
   * If successful, shows a generic message (security best practice).
   */
  async function handleSubmit(e) {
    e.preventDefault();
    const result = await requestPasswordReset(email);
    if (result.success) {
      setMessage("Wenn ein Konto existiert, wurde eine E-Mail gesendet.");
    }
  }

  return (
    <div className="auth-container">

      {/* Password reset form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          name="email"
          type="text"
          label="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" style="primary" fullWidth="true">
          Passwort zurücksetzen
        </Button>
      </form>

      {/* Feedback messages */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ForgotPassword;
