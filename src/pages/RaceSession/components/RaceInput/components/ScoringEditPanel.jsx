import Button from "@/components/Button/Button.jsx";
import PositionChips from "./PositionChips.jsx";
import NumberEntryRow from "./NumberEntryRow.jsx";

const ScoringEditPanel = ({
  inputRef,
  editingRound,
  isResetting,
  numberInput,
  setNumberInput,
  currentPositions,
  onAddNumber,
  onRemovePosition,
  onRemoveFromRound,
  onReset,
  onConfirmReset,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onAddNumber();
  };

  if (isResetting) {
    return (
      <div className="race-input__panel">
        <p className="race-input__hint">
          Runde {editingRound.roundNumber} – neue Positionen eingeben.
        </p>
        <NumberEntryRow
          inputRef={inputRef}
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          onAdd={onAddNumber}
          onKeyDown={handleKeyDown}
        />
        <PositionChips positions={currentPositions} onRemove={onRemovePosition} />
        <Button
          style="success"
          onClick={onConfirmReset}
          disabled={currentPositions.length === 0}
        >
          Wertung bestätigen
        </Button>
      </div>
    );
  }

  return (
    <div className="race-input__panel">
      <p className="race-input__hint">
        Runde {editingRound.roundNumber} – Positionen entfernen oder zurücksetzen.
      </p>
      <PositionChips positions={editingRound.positions} onRemove={onRemoveFromRound} />
      <div className="race-input__edit-actions">
        <Button style="danger" onClick={onReset}>
          Positionen zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default ScoringEditPanel;