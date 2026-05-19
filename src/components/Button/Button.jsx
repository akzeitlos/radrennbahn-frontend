import "./Button.css";

// Reusable Button component with customizable type, click handler, disabled state, and style variant
function Button({ type = "button", onClick, disabled = false, children, style = "primary" }) {
  return (
    <button
      type={type}                           // Button type attribute (e.g. "submit", "button")
      onClick={onClick}                     // Click event handler
      disabled={disabled}                   // Disabled state for the button
      className={`button ${style}-button`}  // CSS classes for base and style variant
    >
      {children}                            
    </button>
  );
}

export default Button;
