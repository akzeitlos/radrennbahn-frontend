import { useState, useContext, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext.jsx";
import useRaces from "@/hooks/useRaces.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import Modal from "@/components/Modal/Modal.jsx";
import Button from "@/components/Button/Button.jsx";
import CloseIcon from "@/assets/icons/close.svg?react";
import SaveIcon from "@/assets/icons/save.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";

import RaceInput from "./components/RaceInput/RaceInput.jsx";
import RaceResults from "./components/RaceResults/RaceResults.jsx";
import { computeResults } from "./utils/computeResults.js";

import "./RaceSession.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RaceSession = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const { races, isLoading, completeRace } = useRaces(token);
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [pendingPositions, setPendingPositions] = useState([]);
  const [saveState, setSaveState] = useState("saved");
  const [isDirty, setIsDirty] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const race = races.find((r) => r.id === Number(id));

  useEffect(() => {
    if (!race || sessionLoaded) return;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/races/${id}/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedEntries = res.data.race?.raceEntries ?? [];
        if (savedEntries.length > 0) {
          setEntries(
            savedEntries.map((e) => ({
              type: e.type,
              roundNumber: e.roundNumber ?? undefined,
              isLast: e.isLast ?? false,
              positions: e.positions ?? undefined,
              athleteNumber: e.athleteNumber ?? undefined,
            })),
          );
        }
      } catch {
        // Keine gespeicherte Session — kein Problem
      } finally {
        setSessionLoaded(true);
      }
    };

    load();
  }, [race, sessionLoaded, id, token]);

  const addEntry = useCallback((entry) => {
    setEntries((prev) => [...prev, entry]);
    setSaveState("idle");
    setIsDirty(true);
  }, []);

  const removeEntry = useCallback((index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setSaveState("idle");
    setIsDirty(true);
  }, []);

  const updateEntry = useCallback((index, entry) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? entry : e)));
    setSaveState("idle");
    setIsDirty(true);
  }, []);

  const resetFinalRound = useCallback((scoringIndex) => {
    setEntries((prev) =>
      prev.filter((e, i) => i !== scoringIndex && e.type !== "finish"),
    );
    setSaveState("idle");
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (pendingPositions.length > 0) setSaveState((s) => s === "saved" ? "idle" : s);
  }, [pendingPositions]);

  const handleSave = async () => {
    if (!race) return;
    setSaveState("saving");

    const results = computeResults(race, entries);
    let pos = 1;
    const resultsWithPosition = results.map((r) => ({
      ...r,
      finalPosition: r.dnf || r.eliminated ? null : pos++,
    }));

    try {
      await axios.put(
        `${API_BASE_URL}/races/${id}/results`,
        { results: resultsWithPosition, entries },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSaveState("saved");
      setIsDirty(false);
    } catch {
      setSaveState("error");
    }
  };

  const handleComplete = async () => {
    await handleSave();
    await completeRace(Number(id), true);
    navigate("/races");
  };

  const handleEnd = () => {
    if (saveState !== "saved" && entries.length > 0) {
      setShowEndModal(true);
      return;
    }
    navigate("/races");
  };

  if (isLoading || !sessionLoaded) return <LoadingSpinner />;
  if (!race)
    return <p className="race-session__not-found">Rennen nicht gefunden.</p>;

  const modeSlug = race.raceMode?.slug;

  const liveEntries = (() => {
    if (pendingPositions.length === 0) return entries;
    if (modeSlug === "elimination") {
      return [...entries, {
        type: "scoring",
        roundNumber: entries.filter((e) => e.type === "scoring").length + 1,
        isLast: false,
        positions: pendingPositions,
      }];
    }
    if (modeSlug === "scratch" && !entries.some((e) => e.type === "finish")) {
      return [...entries, { type: "finish", positions: pendingPositions, positionOffset: 0 }];
    }
    if (["points", "tempo", "danish"].includes(modeSlug)) {
      const scoringDone = entries.filter((e) => e.type === "scoring").length;
      const totalRounds = race.rounds ?? 0;
      const interval = race.scoringInterval ?? 1;
      const scoringRoundCount = Math.floor(totalRounds / interval);
      const nextRound = scoringDone + 1;
      const isLastRound = nextRound === scoringRoundCount;
      return [...entries, {
        type: "scoring",
        roundNumber: nextRound,
        isLast: isLastRound,
        positions: pendingPositions,
      }];
    }
    return entries;
  })();

  const results = computeResults(race, liveEntries);

  const athletes = race.athletes ?? [];
  const scoringCount = entries.filter((e) => e.type === "scoring").length;
  const scoringRoundCount = modeSlug === "elimination"
    ? 1
    : Math.floor((race.rounds ?? 0) / (race.scoringInterval ?? 1));
  const isFinal =
    modeSlug === "elimination"
      ? scoringCount >= 1
      : modeSlug === "scratch"
      ? entries.some((e) => e.type === "finish")
      : scoringRoundCount > 0 && scoringCount >= scoringRoundCount;

  return (
    <div className="race-session">
      <div className="race-session__header">
        <h1 className="race-session__title">
          {race.raceMode?.title}
          <span className="race-session__meta">
            {race.raceClasses?.map((rc) => rc.name).join(", ")}
          </span>
        </h1>

        <div className="race-session__actions">
          <Button
            saveState={isDirty ? "idle" : saveState}
            onClick={handleSave}
            disabled={entries.length === 0}
          >
            Speichern
          </Button>
          {race.isCompleted ? (
            <Button style="success" disabled cssStyle={{ opacity: 1, cursor: "default" }}>
              <CheckIcon className="icon" /> Rennen abgeschlossen
            </Button>
          ) : isFinal && (
            <Button style="success" onClick={() => setShowCompleteModal(true)}>
              <CheckIcon className="icon" /> Rennen abschließen
            </Button>
          )}
          <Button style="secondary" onClick={handleEnd}>
            <CloseIcon className="icon" /> Beenden
          </Button>
        </div>
      </div>

      <RaceInput
        race={race}
        modeSlug={modeSlug}
        entries={entries}
        onAddEntry={addEntry}
        onRemoveEntry={removeEntry}
        onUpdateEntry={updateEntry}
        onResetFinalRound={resetFinalRound}
        onPendingChange={setPendingPositions}
      />

      <RaceResults
        race={race}
        modeSlug={modeSlug}
        results={results}
        entries={entries}
      />

      {showEndModal && (
        <Modal
          title="Rennen beenden"
          message="Nicht gespeicherte Ergebnisse gehen verloren. Trotzdem beenden?"
          confirmLabel="Beenden"
          cancelLabel="Zurück"
          danger
          onConfirm={() => navigate("/races")}
          onCancel={() => setShowEndModal(false)}
        />
      )}

      {showCompleteModal && (
        <Modal
          title="Rennen abschließen"
          message="Das Rennen wird als abgeschlossen markiert. Die Ergebnisse werden gespeichert und du kommst zurück zur Übersicht."
          confirmLabel="Abschließen"
          cancelLabel="Zurück"
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteModal(false)}
        />
      )}
    </div>
  );
};

export default RaceSession;
