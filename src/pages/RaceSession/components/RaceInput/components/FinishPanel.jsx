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
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onAddNumber();
  };

  return (
    <div className="race-input__panel">
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
        onClick={onConfirm}
        disabled={currentPositions.length === 0}
      >
        Zieleinlauf bestätigen
      </Button>
    </div>
  );
};

export default FinishPanel;