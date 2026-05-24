import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Needed for navigation and reading URL parameters

// Reusable UI components
import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

// Custom authentication hook
import useAuth from "@/hooks/useAuth.jsx";

// Styles
import "./ResetPassword.css";
import "../Auth.css";

/**
 * ResetPassword component handles the process of updating a user's password.
 * It is accessed via a secure token from a password reset email.
 */
function ResetPassword() {
  const [params] = useSearchParams(); // Access URL query parameters
  const navigate = useNavigate(); // React Router navigation

  const token = params.get("token"); // Get the reset token from the URL

  // Form state for password and password confirmation
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Access resetPassword function and error message from the auth hook
  const { resetPassword, error } = useAuth();

  // Optional message for feedback (success case)
  const [message, setMessage] = useState(null);

  /**
   * Handles form submission:
   * - Prevent default behavior
   * - Call resetPassword with token, new password, and confirmation
   * - Show success message and redirect to login after short delay
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const result = await resetPassword(token, password, confirm);

    if (result.success) {
      setMessage("Password was successfully reset.");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    }
  }

  return (
    <div className="auth-container">

      {/* Password reset form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          name="password"
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          name="confirm"
          type="password"
          label="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" style="primary" fullWidth="true">
          Reset Password
        </Button>
      </form>

      {/* Success or error messages */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ResetPassword;
