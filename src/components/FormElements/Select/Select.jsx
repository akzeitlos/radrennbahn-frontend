import { useState, useRef, useEffect } from "react";
import Chevron from "@/assets/icons/chevron.svg?react";
import "./Select.css";

function Select({ label, name, value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optValue) => {
    onChange({
      target: {
        name,
        value: optValue,
      },
    });
    setOpen(false);
  };

  // Schließen bei Klick außerhalb
  useEffect(() => {
    const handler = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasValue = value !== "" && value !== undefined && value !== null;
  const containerClasses = `select-field ${open ? "is-open" : ""} ${hasValue ? "has-value" : ""}`;

  return (
    <div className={containerClasses} ref={selectRef}>
      {label && <label>{label}</label>}

      <div className="select-box" onClick={() => setOpen(!open)}>
        {selectedOption ? (
          <span>{selectedOption.label}</span>
        ) : (
          open && <span className="placeholder">Bitte wählen</span>
        )}

        {/* Rechter interaktiver Bereich */}
        <div className="select-action-zone">
          {hasValue ? (
            <button
              type="button"
              className="clear-icon-btn"
              onClick={(e) => {
                e.stopPropagation(); // Verhindert, dass sich das Dropdown beim Löschen öffnet
                handleSelect("");
              }}
            >
              ×
            </button>
          ) : (
            <Chevron className="chevron-icon" />
          )}
        </div>
      </div>

      {open && (
        <div className="select-dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`select-option ${value === opt.value ? "active" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;