import Button from "@/components/Button/Button.jsx";
import PositionChips from "./PositionChips.jsx";
import NumberEntryRow from "./NumberEntryRow.jsx";

const FinishPanel = ({
  inputRef,
  numberInput,
  setNumberInput,
  currentPositions,
  onAddNumber,
  onRemovePosition,
  onConfirm,
  finishPositionOffset = 0,
}) => {
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    numberInput.trim() ? onAddNumber() : onConfirm();
  };

  return (
    <div className="race-input__panel">
      {finishPositionOffset > 0 && (
        <p className="race-input__hint race-input__hint--finish">
          Plätze 1–{finishPositionOffset} bereits durch Wertungsrunde vergeben → weiter ab Platz {finishPositionOffset + 1}
        </p>
      )}
      <NumberEntryRow
        inputRef={inputRef}
        value={numberInput}
        onChange={(e) => setNumberInput(e.target.value)}
        onAdd={onAddNumber}
        onKeyDown={handleKeyDown}
      />
      <PositionChips
        positions={currentPositions}
        onRemove={onRemovePosition}
        startRank={finishPositionOffset + 1}
      />
      <Button
        style="success"
        onClick={onConfirm}
      >
        Zieleinlauf bestätigen
      </Button>
    </div>
  );
};

export default FinishPanel;