import { useState } from "react";
import Chevron from "@/assets/icons/chevron.svg?react";
import "./MultiSelect.css";

function MultiSelect({ label, name, value = [], onChange, options = [] }) {
  const [open, setOpen] = useState(false);

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

  // Dynamische Klassen für das Floating Label ermitteln
  const hasValue = value.length > 0;
  const containerClasses = `multi-field ${open ? "is-open" : ""} ${hasValue ? "has-value" : ""}`;

  return (
    <div className={containerClasses}>
      {label && <label>{label}</label>}

      <div className="multi-box" onClick={() => setOpen(!open)}>
        {/* Platzhalter nur anzeigen, wenn das Feld offen ODER ein Wert da ist (optional, verhindert Überlagerung) */}
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
                    e.stopPropagation(); // Verhindert das Schließen des Dropdowns beim Löschen
                    removeItem(val);
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`option ${value.includes(opt.value) ? "active" : ""}`}
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