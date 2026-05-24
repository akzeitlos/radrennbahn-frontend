import Button from "@/components/Button/Button.jsx";
import Input from "@/components/FormElements/Input/Input.jsx";

const DnfPanel = ({ inputRef, dnfTarget, setDnfTarget, onDnf, dnfEntries, onRemoveDnf }) => (
  <div className="race-input__panel">
    <p className="race-input__hint">Startnummer des ausgeschiedenen Fahrers.</p>
    {dnfEntries.length > 0 && (
      <div className="race-input__dnf-list">
        <span className="race-input__dnf-label">DNF:</span>
        {dnfEntries.map((entry) => (
          <span key={entry.athleteNumber} className="race-input__dnf-chip">
            {entry.athleteNumber}
            <button
              className="race-input__dnf-remove"
              onClick={() => onRemoveDnf(entry.index)}
              title="DNF entfernen"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    )}
    <div className="race-input__entry-row">
      <Input
        ref={inputRef}
        name="dnfTarget"
        type="number"
        placeholder="Startnr."
        value={dnfTarget}
        onChange={(e) => setDnfTarget(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onDnf(); }}
      />
      <Button style="danger" onClick={onDnf}>DNF</Button>
    </div>
  </div>
);

export default DnfPanel;