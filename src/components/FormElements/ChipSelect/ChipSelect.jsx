import "./ChipSelect.css";

const ChipSelect = ({ label, name, value = [], onChange, options = [] }) => {
  const toggle = (id) => {
    const updated = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange({ target: { name, value: updated } });
  };

  return (
    <div className="cs-field">
      {label && <span className="cs-label">{label}</span>}
      <div className="cs-chips">
        {options.length === 0 ? (
          <span className="cs-empty">Keine Optionen verfügbar</span>
        ) : (
          options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`cs-chip ${value.includes(opt.value) ? "cs-chip--active" : ""}`}
              onClick={() => toggle(opt.value)}
            >
              {opt.label}
              {value.includes(opt.value) && (
                <span className="cs-chip__remove">×</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChipSelect;