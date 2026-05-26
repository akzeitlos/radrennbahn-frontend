import { useRef } from "react";
import Button from "@/components/Button/Button.jsx";
import Input from "@/components/FormElements/Input/Input.jsx";
import PositionChips from "./PositionChips.jsx";
import NumberEntryRow from "./NumberEntryRow.jsx";

const ScoringPanel = ({
  inputRef,
  finishInputRef,
  numberInput,
  setNumberInput,
  currentPositions,
  onAddNumber,
  onRemovePosition,
  onConfirm,
  isLastScoringRound,
  isFinaleActive,
  finishInput,
  setFinishInput,
  finishPositions,
  onAddFinishNumber,
  onRemoveFinishPosition,
  scoringDone,
  scoringRoundCount,
  nextScoringRound,
  finishPositionOffset = 0,
  isElimination = false,
  activeCount = null,
  minPositions = 1,
}) => {
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    numberInput.trim() ? onAddNumber() : onConfirm();
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

      <PositionChips positions={currentPositions} onRemove={onRemovePosition} isElimination={isElimination} />

      {isFinaleActive && (
        <div className="race-input__finale-finish">
          <p className="race-input__hint race-input__hint--finish">
            Zieleinlauf ab Platz {finishPositionOffset + 1} (optional)
          </p>
          <NumberEntryRow
            inputRef={finishInputRef}
            value={finishInput}
            onChange={(e) => setFinishInput(e.target.value)}
            onAdd={onAddFinishNumber}
            onKeyDown={(e) => { if (e.key === "Enter") { finishInput.trim() ? onAddFinishNumber() : onConfirm(); } }}
          />
          <PositionChips
            positions={finishPositions}
            onRemove={onRemoveFinishPosition}
            startRank={finishPositionOffset + 1}
          />
        </div>
      )}

      <Button
        style="success"
        onClick={onConfirm}
        disabled={isElimination
          ? activeCount == null || currentPositions.length < activeCount - 1
          : currentPositions.length < minPositions}
      >
        {isElimination
          ? "Ausscheidung bestätigen"
          : isLastScoringRound
          ? "Finale Wertung bestätigen"
          : "Wertung bestätigen"}
      </Button>

      <p className="race-input__hint">
        {isElimination
          ? activeCount != null ? `${activeCount - currentPositions.length} Fahrer noch aktiv` : ""
          : scoringDone >= scoringRoundCount
          ? "Alle Wertungsrunden abgeschlossen."
          : `Wertungsrunde ${nextScoringRound} von ${scoringRoundCount}${isLastScoringRound ? " — doppelte Punkte!" : ""}`}
      </p>
    </div>
  );
};

export default ScoringPanel;