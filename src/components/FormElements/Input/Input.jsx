import { forwardRef } from "react";
import "./Input.css";

const Input = forwardRef(function Input(
  { label, name, type = "text", required = false, value, onChange, onKeyDown, placeholder, colSpan },
  ref
) {
  const isFilled = type === "date" || !!placeholder || (value && value.toString().length > 0);
  return (
    <div className="input-field" style={colSpan === 2 ? { gridColumn: "span 2" } : undefined}>
      <input
        ref={ref}
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={isFilled ? "filled" : ""}
      />
      {label && <label htmlFor={name}>{label}</label>}
    </div>
  );
});

export default Input;