// Import input-specific styles
import "./Input.css";

// Reusable input component with label support
function Input({ label, name, type = "text", required = false, value, onChange }) {
  // Prüfen, ob das Feld Text enthält (wichtig bei kontrollierten Komponenten)
  const isFilled = value && value.toString().length > 0;

  return (
    <div className="input-field">
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={isFilled ? "filled" : ""} // <-- Klasse dynamisch vergeben
      />
      {label && <label htmlFor={name}>{label}</label>}
    </div>
  );
}

export default Input;
