import { useState, useRef, useEffect } from "react";
import Chevron from "@/assets/icons/chevron.svg?react";
import "./MultiSelect.css";

function MultiSelect({ label, name, value = [], onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const multiRef = useRef(null);

  const toggleOption = (optionValue) => {
    let newValues = [];

    if (value.includes(optionValue)) {
      newValues = value.filter((v) => v !== optionValue);
    } else {
      newValues = [...value, optionValue];
    }

    onChange({
      target: {
        name,
        value: newValues,
      },
    });
  };

  const removeItem = (val) => {
    onChange({
      target: {
        name,
        value: value.filter((v) => v !== val),
      },
    });
  };

  // Klick außerhalb schließen
  useEffect(() => {
    const handler = (event) => {
      if (multiRef.current && !multiRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const hasValue = value.length > 0;

  const containerClasses = `
    multi-field
    ${open ? "is-open" : ""}
    ${hasValue ? "has-value" : ""}
  `;

  return (
    <div className={containerClasses} ref={multiRef}>
      {label && <label>{label}</label>}

      <div className="multi-box" onClick={() => setOpen(!open)}>
        {value.length === 0 && open && (
          <span className="placeholder">Bitte wählen</span>
        )}

        <div className="chips">
          {value.map((val) => {
            const item = options.find((o) => o.value === val);

            return (
              <span key={val} className="chip">
                {item?.label}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(val);
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>

        {/* Chevron rechts */}
        <div className="multi-action-zone">
          <Chevron className="chevron-icon" />
        </div>
      </div>

      {open && (
        <div className="dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`option ${
                value.includes(opt.value) ? "active" : ""
              }`}
              onClick={() => toggleOption(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;