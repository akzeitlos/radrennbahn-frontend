import { useState, useRef, useEffect } from "react";
import Button from "@/components/Button/Button.jsx";
import ScoringPanel from "./components/ScoringPanel.jsx";
import ScoringEditPanel from "./components/ScoringEditPanel.jsx";
import FinishPanel from "./components/FinishPanel.jsx";
import LapPanel from "./components/LapPanel.jsx";
import DnfPanel from "./components/DnfPanel.jsx";
import "./RaceInput.css";

const needsFinish = ["points", "tempo", "danish"];
const noFinish = ["elimination"];

const RaceInput = ({
  race,
  modeSlug,
  entries,
  onAddEntry,
  onRemoveEntry,
  onUpdateEntry,
}) => {
  const [activePanel, setActivePanel] = useState("scoring");
  const [activeScoringTab, setActiveScoringTab] = useState("new");
  const [numberInput, setNumberInput] = useState("");
  const [currentPositions, setCurrentPositions] = useState([]);
  const [finishPositions, setFinishPositions] = useState([]);
  const [finishInput, setFinishInput] = useState("");
  const [lapTarget, setLapTarget] = useState("");
  const [dnfTarget, setDnfTarget] = useState("");
  const [message, setMessage] = useState(null);
  const [resettingRound, setResettingRound] = useState(null);
  const inputRef = useRef(null);
  const finishInputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activePanel, currentPositions, activeScoringTab]);

  const athletes = race.athletes ?? [];
  const totalRounds = race.rounds ?? 0;
  const interval = race.scoringInterval ?? 1;
  const scoringRoundCount = Math.floor(totalRounds / interval);
  const scoringDone = entries.filter((e) => e.type === "scoring").length;
  const nextScoringRound = scoringDone + 1;
  const isLastScoringRound = nextScoringRound === scoringRoundCount;
  const isFinaleActive =
    needsFinish.includes(modeSlug) &&
    isLastScoringRound &&
    activeScoringTab === "new";

  const dnfEntries = entries
    .map((e, i) => ({ ...e, index: i }))
    .filter((e) => e.type === "dnf");
  const dnfNumbers = dnfEntries.map((e) => e.athleteNumber);

  const activeAthletes = athletes.filter(
    (a) => !dnfNumbers.includes(a.raceNumber),
  );
  const allRaceNumbers = activeAthletes.map((a) => a.raceNumber);
  const alreadyPositioned = new Set(currentPositions);
  const alreadyInFinish = new Set(finishPositions);

  const doneRounds = entries
    .map((e, i) => ({ ...e, index: i }))
    .filter((e) => e.type === "scoring");

  const editingRound =
    activeScoringTab !== "new"
      ? doneRounds.find((r) => r.roundNumber === activeScoringTab)
      : null;

  const flash = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2500);
  };

  // ---- Nummer hinzufügen ----
  const addNumber = () => {
    const nr = parseInt(numberInput.trim(), 10);
    if (isNaN(nr)) return flash("Ungültige Nummer");
    if (!allRaceNumbers.includes(nr)) return flash(`Nr. ${nr} nicht im Rennen`);
    if (alreadyPositioned.has(nr))
      return flash(`Nr. ${nr} bereits eingetragen`);
    setCurrentPositions((prev) => [...prev, nr]);
    setNumberInput("");
  };

  const addFinishNumber = () => {
    const nr = parseInt(finishInput.trim(), 10);
    if (isNaN(nr)) return flash("Ungültige Nummer");
    if (!allRaceNumbers.includes(nr)) return flash(`Nr. ${nr} nicht im Rennen`);
    if (alreadyInFinish.has(nr)) return flash(`Nr. ${nr} bereits eingetragen`);
    setFinishPositions((prev) => [...prev, nr]);
    setFinishInput("");
    finishInputRef.current?.focus();
  };

  // ---- Wertungsrunde bestätigen ----
  const confirmScoring = () => {
    if (currentPositions.length === 0)
      return flash("Keine Nummern eingetragen");
    onAddEntry({
      type: "scoring",
      roundNumber: nextScoringRound,
      isLast: isLastScoringRound,
      positions: [...currentPositions],
    });
    if (isFinaleActive && finishPositions.length > 0) {
      onAddEntry({ type: "finish", positions: [...finishPositions] });
      setFinishPositions([]);
    }
    setCurrentPositions([]);
    flash(`Wertung ${nextScoringRound} gespeichert ✓`, "success");
  };

  // ---- Reset-Runde bestätigen ----
  const confirmResetRound = () => {
    if (currentPositions.length === 0)
      return flash("Keine Nummern eingetragen");
    onUpdateEntry(editingRound.index, {
      type: "scoring",
      roundNumber: editingRound.roundNumber,
      isLast: editingRound.isLast,
      positions: [...currentPositions],
    });
    setCurrentPositions([]);
    setResettingRound(null);

    if (scoringDone < scoringRoundCount) {
      setActiveScoringTab("new");
    }

    flash(`Wertung ${editingRound.roundNumber} gespeichert ✓`, "success");
  };

  // ---- Einzelne Position aus erledigter Runde entfernen ----
  const removeFromEditRound = (idx) => {
    if (!editingRound) return;
    const updated = [...editingRound.positions];
    updated.splice(idx, 1);
    onUpdateEntry(editingRound.index, {
      type: "scoring",
      roundNumber: editingRound.roundNumber,
      isLast: editingRound.isLast,
      positions: updated,
    });
    if (updated.length === 0) {
      setResettingRound(editingRound.roundNumber);
      setCurrentPositions([]);
    }
  };

  // ---- Runde zurücksetzen ----
  const resetRound = () => {
    onUpdateEntry(editingRound.index, {
      type: "scoring",
      roundNumber: editingRound.roundNumber,
      isLast: editingRound.isLast,
      positions: [],
    });
    setResettingRound(editingRound.roundNumber);
    setCurrentPositions([]);
    flash(`Runde ${editingRound.roundNumber} zurückgesetzt`, "success");
  };

  // ---- Zieleinlauf ----
  const confirmFinish = () => {
    if (currentPositions.length === 0)
      return flash("Keine Nummern eingetragen");
    onAddEntry({ type: "finish", positions: [...currentPositions] });
    setCurrentPositions([]);
    flash("Zieleinlauf gespeichert ✓", "success");
  };

  // ---- Überrundung ----
  const handleLap = (type) => {
    const nr = parseInt(lapTarget.trim(), 10);
    if (isNaN(nr)) return flash("Ungültige Nummer");
    if (!allRaceNumbers.includes(nr)) return flash(`Nr. ${nr} nicht im Rennen`);
    onAddEntry({ type, athleteNumber: nr });
    setLapTarget("");
    flash(
      type === "lapup"
        ? `Nr. ${nr}: +1 Runde (überrundet) ✓`
        : `Nr. ${nr}: –1 Runde (wurde überrundet) ✓`,
      "success",
    );
  };

  // ---- DNF ----
  const handleDnf = () => {
    const nr = parseInt(dnfTarget.trim(), 10);
    if (isNaN(nr)) return flash("Ungültige Nummer");
    if (!allRaceNumbers.includes(nr)) return flash(`Nr. ${nr} nicht im Rennen`);
    if (dnfNumbers.includes(nr)) return flash(`Nr. ${nr} bereits DNF`);
    onAddEntry({ type: "dnf", athleteNumber: nr });
    setDnfTarget("");
    flash(`Nr. ${nr}: DNF gesetzt ✓`, "success");
  };

  const showScoring = modeSlug !== "scratch" && scoringDone < scoringRoundCount;
  const showFinish =
    modeSlug === "scratch" ||
    (!noFinish.includes(modeSlug) && !needsFinish.includes(modeSlug));

  const tabs = [
    showScoring && {
      key: "scoring",
      label: isLastScoringRound
        ? `Wertung ${nextScoringRound} (Finale)`
        : `Wertung ${nextScoringRound}`,
    },
    showFinish && { key: "finish", label: "Zieleinlauf" },
    { key: "lap", label: "Überrundung" },
    { key: "dnf", label: "DNF" },
  ].filter(Boolean);

  useEffect(() => {
    if (modeSlug === "scratch" && activePanel === "scoring") {
      setActivePanel("finish");
    }
  }, [modeSlug]);

  return (
    <div className="race-input card">
      {/* Reihe 1 – Haupt-Tabs */}
      <div className="race-input__tabs">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            style={activePanel === tab.key ? "primary-active" : "primary"}
            small
            onClick={() => {
              setActivePanel(tab.key);
              setCurrentPositions([]);
              setNumberInput("");
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Reihe 2 – Sub-Tabs */}
      {activePanel === "scoring" && scoringDone > 0 && (
        <div className="race-input__tabs race-input__tabs--sub">
          {doneRounds.map((r) => (
            <Button
              key={r.roundNumber}
              style={
                activeScoringTab === r.roundNumber ? "primary-active" : "primary"
              }
              small
              onClick={() => {
                setActiveScoringTab(r.roundNumber);
                setCurrentPositions([]);
                setNumberInput("");
                setResettingRound(null);
              }}
            >
              Runde {r.roundNumber}
            </Button>
          ))}
          <Button
            style={activeScoringTab === "new" ? "primary" : "secondary"}
            small
            onClick={() => {
              setActiveScoringTab("new");
              setCurrentPositions([]);
              setNumberInput("");
              setResettingRound(null);
            }}
          >
            Runde {nextScoringRound}
          </Button>
        </div>
      )}

      {/* ---- Panels ---- */}
      {activePanel === "scoring" && activeScoringTab === "new" && (
        <ScoringPanel
          inputRef={inputRef}
          finishInputRef={finishInputRef}
          numberInput={numberInput}
          setNumberInput={setNumberInput}
          currentPositions={currentPositions}
          onAddNumber={addNumber}
          onRemovePosition={(idx) =>
            setCurrentPositions((prev) => prev.filter((_, i) => i !== idx))
          }
          onConfirm={confirmScoring}
          isLastScoringRound={isLastScoringRound}
          isFinaleActive={isFinaleActive}
          finishInput={finishInput}
          setFinishInput={setFinishInput}
          finishPositions={finishPositions}
          onAddFinishNumber={addFinishNumber}
          onRemoveFinishPosition={(idx) =>
            setFinishPositions((prev) => prev.filter((_, i) => i !== idx))
          }
          scoringDone={scoringDone}
          scoringRoundCount={scoringRoundCount}
          nextScoringRound={nextScoringRound}
        />
      )}

      {activePanel === "scoring" &&
        activeScoringTab !== "new" &&
        editingRound && (
          <ScoringEditPanel
            inputRef={inputRef}
            editingRound={editingRound}
            isResetting={resettingRound === editingRound.roundNumber}
            numberInput={numberInput}
            setNumberInput={setNumberInput}
            currentPositions={currentPositions}
            onAddNumber={addNumber}
            onRemovePosition={(idx) =>
              setCurrentPositions((prev) => prev.filter((_, i) => i !== idx))
            }
            onRemoveFromRound={removeFromEditRound}
            onReset={resetRound}
            onConfirmReset={confirmResetRound}
          />
        )}

      {activePanel === "finish" && (
        <FinishPanel
          inputRef={inputRef}
          numberInput={numberInput}
          setNumberInput={setNumberInput}
          currentPositions={currentPositions}
          onAddNumber={addNumber}
          onRemovePosition={(idx) =>
            setCurrentPositions((prev) => prev.filter((_, i) => i !== idx))
          }
          onConfirm={confirmFinish}
        />
      )}

      {activePanel === "lap" && (
        <LapPanel
          inputRef={inputRef}
          lapTarget={lapTarget}
          setLapTarget={setLapTarget}
          onLap={handleLap}
        />
      )}

      {activePanel === "dnf" && (
        <DnfPanel
          inputRef={inputRef}
          dnfTarget={dnfTarget}
          setDnfTarget={setDnfTarget}
          onDnf={handleDnf}
          dnfEntries={dnfEntries}
          onRemoveDnf={onRemoveEntry}
        />
      )}

      {/* Flash-Meldung */}
      {message && (
        <div className={`race-input__flash race-input__flash--${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default RaceInput;
