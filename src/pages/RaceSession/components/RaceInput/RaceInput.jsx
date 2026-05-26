import { useState, useRef, useEffect } from "react";
import Button from "@/components/Button/Button.jsx";
import ScoringPanel from "./components/ScoringPanel.jsx";
import ScoringEditPanel from "./components/ScoringEditPanel.jsx";
import FinishPanel from "./components/FinishPanel.jsx";
import LapPanel from "./components/LapPanel.jsx";
import DnfPanel from "./components/DnfPanel.jsx";
import PositionChips from "./components/PositionChips.jsx";
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
  onResetFinalRound,
  onPendingChange,
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

  const isElimination = modeSlug === "elimination";
  const athletes = race.athletes ?? [];
  const totalRounds = race.rounds ?? 0;
  const interval = race.scoringInterval ?? 1;
  const scoringRoundCount = isElimination
    ? 1
    : Math.floor(totalRounds / interval);
  const scoringDone = entries.filter((e) => e.type === "scoring").length;
  const nextScoringRound = scoringDone + 1;
  const isLastScoringRound = nextScoringRound === scoringRoundCount;
  const danishMax = modeSlug === "danish"
    ? (race.danishScoringRounds?.[nextScoringRound - 1]?.pointsDistribution?.length ?? 0)
    : null;
  const isFinaleActive =
    needsFinish.includes(modeSlug) &&
    isLastScoringRound &&
    activeScoringTab === "new";

  // Wie viele Plätze werden in der letzten Wertungsrunde bereits vergeben?
  // Diese Fahrer belegen Platz 1..N, der Zieleinlauf startet daher bei N+1.
  const finishPositionOffset = (() => {
    if (!needsFinish.includes(modeSlug)) return 0;
    if (modeSlug === "points") {
      const basePoints = [
        race.pointsFirst ?? 5,
        race.pointsSecond ?? 3,
        race.pointsThird ?? 2,
        race.pointsFourth ?? 1,
      ];
      return basePoints.length; // = 4
    }
    if (modeSlug === "tempo") return 2;
    if (modeSlug === "danish") {
      const lastRoundIndex = scoringRoundCount - 1;
      const dist = race.danishScoringRounds?.[lastRoundIndex]?.pointsDistribution ?? [];
      return dist.length;
    }
    return 0;
  })();

  const dnfEntries = entries
    .map((e, i) => ({ ...e, index: i }))
    .filter((e) => e.type === "dnf");
  const dnfNumbers = dnfEntries.map((e) => e.athleteNumber);

  const eliminatedNumbers = isElimination
    ? entries
        .filter((e) => e.type === "scoring")
        .map((e) => e.positions[e.positions.length - 1])
        .filter(Boolean)
    : [];

  const activeAthletes = athletes.filter(
    (a) =>
      !dnfNumbers.includes(a.raceNumber) &&
      !eliminatedNumbers.includes(a.raceNumber),
  );
  const allRaceNumbers = activeAthletes.map((a) => a.raceNumber);
  const alreadyPositioned = new Set(currentPositions);
  const alreadyInFinish = new Set(finishPositions);

  const doneRounds = entries
    .map((e, i) => ({ ...e, index: i }))
    .filter((e) => e.type === "scoring");

  const finalDoneRound = doneRounds.find((r) => r.isLast);
  const finishEntry = entries.find((e) => e.type === "finish") ?? null;

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
    if (isElimination && currentPositions.length >= allRaceNumbers.length - 1)
      return flash("Letzter Fahrer ist der Gewinner");
    if (modeSlug === "tempo" && currentPositions.length >= 2)
      return flash("Temporunde: maximal 2 Fahrer eintragen");
    if (modeSlug === "points" && currentPositions.length >= 4)
      return flash("Punkterennen: maximal 4 Fahrer eintragen");
    if (modeSlug === "danish" && danishMax !== null && currentPositions.length >= danishMax)
      return flash(danishMax === 0 ? "Keine Punkte für diese Runde konfiguriert" : `Runde ${nextScoringRound}: maximal ${danishMax} Fahrer`);
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

  // ---- Wertungsrunde / Ausscheidung bestätigen ----
  const confirmScoring = () => {
    if (currentPositions.length === 0)
      return flash("Keine Nummern eingetragen");
    onAddEntry({
      type: "scoring",
      roundNumber: nextScoringRound,
      isLast: isElimination ? false : isLastScoringRound,
      positions: [...currentPositions],
    });

    const finishAlreadySaved = !isElimination && isFinaleActive && finishPositions.length > 0;
    if (finishAlreadySaved) {
      onAddEntry({
        type: "finish",
        positions: [...finishPositions],
        positionOffset: finishPositionOffset,
      });
      setFinishPositions([]);
    }

    setCurrentPositions([]);

    if (isElimination) {
      flash(`Runde ${nextScoringRound}: Ausscheidung gespeichert ✓`, "success");
    } else if (isLastScoringRound && needsFinish.includes(modeSlug)) {
      setActiveScoringTab(nextScoringRound);
      flash(`Finale Runde gespeichert ✓`, "success");
    } else {
      flash(`Wertung ${nextScoringRound} gespeichert ✓`, "success");
    }
  };

  // ---- Reset-Runde bestätigen ----
  const confirmResetRound = () => {
    if (currentPositions.length === 0)
      return flash("Keine Nummern eingetragen");

    const isEditingLastRound = editingRound.isLast ||
      editingRound.roundNumber === scoringRoundCount;

    onUpdateEntry(editingRound.index, {
      type: "scoring",
      roundNumber: editingRound.roundNumber,
      isLast: editingRound.isLast,
      positions: [...currentPositions],
    });
    setCurrentPositions([]);
    setResettingRound(null);

    if (isEditingLastRound && needsFinish.includes(modeSlug)) {
      flash(`Finale Runde gespeichert ✓`, "success");
    } else if (scoringDone < scoringRoundCount) {
      setActiveScoringTab("new");
      flash(`Wertung ${editingRound.roundNumber} gespeichert ✓`, "success");
    } else {
      flash(`Wertung ${editingRound.roundNumber} gespeichert ✓`, "success");
    }
  };

  // ---- Runde zurücksetzen ----
  const resetRound = () => {
    if (editingRound.isLast) {
      onResetFinalRound(editingRound.index);
      setActiveScoringTab("new");
      setCurrentPositions([]);
      setFinishPositions([]);
      setResettingRound(null);
      flash("Finale Runde zurückgesetzt", "success");
      return;
    }

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
    onAddEntry({
      type: "finish",
      positions: [...currentPositions],
      positionOffset: finishPositionOffset,
    });
    setCurrentPositions([]);
    flash("Zieleinlauf gespeichert ✓", "success");
  };

  const confirmFinishEntry = () => {
    onAddEntry({
      type: "finish",
      positions: [...finishPositions],
      positionOffset: finishPositionOffset,
    });
    setFinishPositions([]);
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

  const showScoring = isElimination
    ? true
    : modeSlug !== "scratch" && (scoringDone < scoringRoundCount || !!finalDoneRound);
  const showFinish =
    modeSlug === "scratch" ||
    (!noFinish.includes(modeSlug) && !needsFinish.includes(modeSlug));

  const tabs = [
    showScoring && {
      key: "scoring",
      label: isElimination ? "Ausscheidung" : "Wertung",
    },
    showFinish && { key: "finish", label: "Zieleinlauf" },
    !isElimination && { key: "lap", label: "Überrundung" },
    { key: "dnf", label: "DNF" },
  ].filter(Boolean);

  useEffect(() => {
    if (modeSlug === "scratch" && activePanel === "scoring") {
      setActivePanel("finish");
    }
  }, [modeSlug]);

  useEffect(() => {
    if (!onPendingChange) return;
    if (isElimination) {
      const isPendingPanel = activePanel === "scoring" && activeScoringTab === "new";
      onPendingChange(isPendingPanel ? currentPositions : []);
    } else if (modeSlug === "scratch") {
      const isPendingPanel = activePanel === "finish" && !finishEntry;
      onPendingChange(isPendingPanel ? currentPositions : []);
    } else if (["points", "tempo", "danish"].includes(modeSlug)) {
      const isPendingPanel = activePanel === "scoring" && activeScoringTab === "new" && scoringDone < scoringRoundCount;
      onPendingChange(isPendingPanel ? currentPositions : []);
    }
  }, [currentPositions, activePanel, activeScoringTab, isElimination, modeSlug, finishEntry, scoringDone, scoringRoundCount]);

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
              if (tab.key === "scoring" && !isElimination && scoringDone >= scoringRoundCount && finalDoneRound) {
                setActiveScoringTab(finalDoneRound.roundNumber);
              }
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Reihe 2 – Sub-Tabs */}
      {activePanel === "scoring" && scoringDone > 0 && !isElimination && (
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
              {!isElimination && r.isLast ? "Finale Runde" : `Runde ${r.roundNumber}`}
            </Button>
          ))}
          {(isElimination || scoringDone < scoringRoundCount) && (
            <Button
              style={activeScoringTab === "new" ? "primary-active" : "primary"}
              small
              onClick={() => {
                setActiveScoringTab("new");
                setCurrentPositions([]);
                setNumberInput("");
                setResettingRound(null);
              }}
            >
              {!isElimination && isLastScoringRound ? "Finale Runde" : `Runde ${nextScoringRound}`}
            </Button>
          )}
        </div>
      )}

      {/* ---- Panels ---- */}
      {activePanel === "scoring" && isElimination && scoringDone > 0 && (
        <div className="race-input__panel">
          <PositionChips
            positions={entries.find((e) => e.type === "scoring")?.positions ?? []}
            isElimination={true}
          />
          <p className="race-input__hint">Ausscheidungsrennen abgeschlossen.</p>
        </div>
      )}

      {activePanel === "scoring" && activeScoringTab === "new" && (isElimination ? scoringDone === 0 : scoringDone < scoringRoundCount) && (
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
          finishPositionOffset={finishPositionOffset}
          isElimination={isElimination}
          activeCount={isElimination ? activeAthletes.length : null}
          minPositions={danishMax === 0 ? 0 : 1}
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
            onReset={resetRound}
            onConfirmReset={confirmResetRound}
            needsFinish={editingRound.isLast && needsFinish.includes(modeSlug)}
            finishEntry={finishEntry}
            finishInputRef={finishInputRef}
            finishInput={finishInput}
            setFinishInput={setFinishInput}
            finishPositions={finishPositions}
            onAddFinishNumber={addFinishNumber}
            onRemoveFinishPosition={(idx) =>
              setFinishPositions((prev) => prev.filter((_, i) => i !== idx))
            }
            onConfirmFinish={confirmFinishEntry}
            finishPositionOffset={finishPositionOffset}
          />
        )}

      {activePanel === "finish" && finishEntry && (
        <div className="race-input__panel">
          <PositionChips
            positions={finishEntry.positions}
            startRank={(finishEntry.positionOffset ?? 0) + 1}
          />
          <p className="race-input__hint">Zieleinlauf bestätigt.</p>
        </div>
      )}

      {activePanel === "finish" && !finishEntry && (
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
          finishPositionOffset={finishPositionOffset}
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
