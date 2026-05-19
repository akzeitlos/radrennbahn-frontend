// @/components/FormElements/Textarea/Textarea.jsx
import "./Textarea.css";

const Textarea = ({ name, label, value, onChange, required }) => {
  return (
    <div className="textarea-field">
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" " // <-- Leerzeichen nötig für CSS :placeholder-shown-Trick
      />
      {label && <label htmlFor={name}>{label}</label>}
    </div>
  );
};

export default Textarea;
