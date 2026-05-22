import "./Input.css";

function Input({ label, name, type = "text", required = false, value, onChange, placeholder }) {
  const isFilled = type === "date" || (value && value.toString().length > 0);

  return (
    <div className="input-field">
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={isFilled ? "filled" : ""}
      />
      {label && <label htmlFor={name}>{label}</label>}
    </div>
  );
}

export default Input;