import Button from "@/components/Button/Button.jsx";
import NumberEntryRow from "./NumberEntryRow.jsx";

const EliminationPanel = ({
  inputRef,
  numberInput,
  setNumberInput,
  eliminatedNr,
  onAdd,
  onClear,
  onConfirm,
  activeCount,
}) => {
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    numberInput.trim() ? onAdd() : onConfirm();
  };

  return (
    <div className="race-input__panel">
      <NumberEntryRow
        inputRef={inputRef}
        value={numberInput}
        onChange={(e) => setNumberInput(e.target.value)}
        onAdd={onAdd}
        onKeyDown={handleKeyDown}
      />

      {eliminatedNr != null && (
        <div className="race-input__positions">
          <div className="race-input__position-chip race-input__position-chip--elim">
            <span className="race-input__pos-rank">OUT</span>
            <span className="race-input__pos-nr">{eliminatedNr}</span>
            <button className="race-input__pos-remove" onClick={onClear}>×</button>
          </div>
        </div>
      )}

      <Button
        style="success"
        onClick={onConfirm}
        disabled={eliminatedNr == null}
      >
        Ausscheidung bestätigen
      </Button>

      {activeCount != null && (
        <p className="race-input__hint">{activeCount} Fahrer noch aktiv</p>
      )}
    </div>
  );
};

export default EliminationPanel;
