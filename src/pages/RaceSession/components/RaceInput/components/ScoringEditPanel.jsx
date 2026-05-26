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
  onReset,
  onConfirmReset,
  needsFinish = false,
  finishEntry = null,
  finishInputRef,
  finishInput,
  setFinishInput,
  finishPositions = [],
  onAddFinishNumber,
  onRemoveFinishPosition,
  onConfirmFinish,
  finishPositionOffset = 0,
}) => {
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    numberInput.trim() ? onAddNumber() : onConfirmReset();
  };

  const roundLabel = editingRound.isLast ? "Finale Runde" : `Runde ${editingRound.roundNumber}`;

  if (isResetting) {
    return (
      <div className="race-input__panel">
        <p className="race-input__hint">
          {roundLabel} – neue Positionen eingeben.
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
        {roundLabel} – Positionen entfernen oder zurücksetzen.
      </p>
      <PositionChips positions={editingRound.positions} />

      {needsFinish && (
        <div className="race-input__finale-finish">
          <p className="race-input__hint race-input__hint--finish">
            Zieleinlauf ab Platz {finishPositionOffset + 1}
            {!finishEntry && " eingeben"}
          </p>
          {finishEntry ? (
            finishEntry.positions.length > 0 ? (
              <PositionChips
                positions={finishEntry.positions}
                startRank={finishPositionOffset + 1}
              />
            ) : (
              <p className="race-input__hint">Keine Einträge vorhanden.</p>
            )
          ) : (
            <>
              <NumberEntryRow
                inputRef={finishInputRef}
                value={finishInput}
                onChange={(e) => setFinishInput(e.target.value)}
                onAdd={onAddFinishNumber}
                onKeyDown={(e) => { if (e.key === "Enter") { finishInput.trim() ? onAddFinishNumber() : onConfirmFinish(); } }}
              />
              <PositionChips
                positions={finishPositions}
                onRemove={onRemoveFinishPosition}
                startRank={finishPositionOffset + 1}
              />
              <Button
                style="success"
                onClick={onConfirmFinish}
              >
                Zieleinlauf bestätigen
              </Button>
            </>
          )}
        </div>
      )}

      <div className="race-input__edit-actions">
        <Button style="danger" onClick={onReset}>
          Positionen zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default ScoringEditPanel;