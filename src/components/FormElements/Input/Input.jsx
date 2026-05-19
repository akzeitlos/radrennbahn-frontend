// Import input-specific styles
import "./Input.css";

// Reusable input component with label support
function Input({ label, name, type = "text", required = false, value, onChange }) {
  return (
    <div className="input-field">
      <input
        type={type}          // Input type (e.g. text, password)
        name={name}          // Name used for form submission
        required={required}  // HTML5 required validation
        value={value}        // Controlled value from parent component
        onChange={onChange}  // Callback to handle input changes
      />
      {label && <label htmlFor={name}>{label}</label>} {/* Render label if provided */}
    </div>
  );
}

export default Input;
