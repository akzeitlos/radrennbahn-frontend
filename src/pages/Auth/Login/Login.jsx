import { useState,useEffect,useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

// Custom auth hook to handle login API requests
import useAuth from "@/hooks/useAuth.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";


// Reusable UI components
import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

// Styles specific to login and shared auth pages
import "./Login.css";
import "../Auth.css";

/**
 * Login component handles user authentication.
 * It provides input fields for email/username and password,
 * and uses the custom useAuth hook for login logic.
 */
function Login() {
  const navigate = useNavigate();

  // Access login function and possible error from the auth hook
  const { login, error } = useAuth();
  const { isAuthenticated } = useContext(AuthContext);

  // Local state to manage form inputs
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  /**
   * Handle form submission
   * - Prevent default browser behavior
   * - Call login from useAuth with form data
   * - Navigate to home page on success
   */
  async function handleLogin(e) {
    e.preventDefault();
    await login(formData);
    // Navigation passiert im useEffect bei Änderung von isAuthenticated

  }
  /**
   * Handle input changes and update local form state
   */
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Jetzt funktioniert's sicher
    }
  }, [isAuthenticated,navigate]);

  return (
    <div className="auth-container">

      {/* Login form */}
      <form className="auth-form" onSubmit={handleLogin}>
        <Input
          name="emailOrUsername"
          type="text"
          label="E-Mail or Username"
          value={formData.emailOrUsername}
          onChange={handleInputChange}
          required
        />

        <Input
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        {/* Submit login button */}
        <Button type="submit" style="primary" fullWidth="true">
          Login
        </Button>

        {/* Link to password reset page */}
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot password?
        </Link>

        {/* Error display if login fails */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
