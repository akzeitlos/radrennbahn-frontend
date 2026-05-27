/**
 * computeResults – berechnet den aktuellen Zwischenstand aus allen eingetragenen Entries.
 *
 * Eintrag-Typen:
 *   { type: "scoring",  round: N, positions: [nr1, nr2, ...] }   – Wertungsrunde
 *   { type: "finish",   positions: [nr1, nr2, ...] }             – Zieleinlauf
 *   { type: "lapup",    athleteNumber: N }                       – Überrunder (hat Runde gewonnen)
 *   { type: "lapdown",  athleteNumber: N }                       – Überrundeter (hat Runde verloren)
 *   { type: "dnf",      athleteNumber: N }                       – DNF
 *
 * Rückgabe: Array von { athleteNumber, points, laps, dnf, lastScoringPoints, finishPosition }
 * sortiert nach dem modusspezifischen Ranking.
 */
export function computeResults(race, entries) {
  if (!race || !race.athletes?.length) return [];

  const modeSlug = race.raceMode?.slug;
  const athletes = race.athletes;

  // ---- Initialisierung ----
  const state = {};
  for (const a of athletes) {
    state[a.raceNumber] = {
      athleteNumber: a.raceNumber,
      athleteId: a.id,
      name: `${a.firstname} ${a.lastname}`,
      points: 0,
      laps: 0,           // +1 = Überrundung erkämpft, -1 = überrundet worden
      lapPoints: 0,      // Punkte aus Überrundungen (nur lapdownMode=points)
      dnf: false,
      finishPosition: null,
      lastScoringPoints: 0,
      lastScoringRound: 0,
      scoringHistory: [], // Punkte pro Wertungsrunde
      eliminated: false,   // Ausscheidungsrennen
      eliminationOrder: null, // 0 = zuerst ausgeschieden (letzter Platz)
    };
  }

  let eliminationCounter = 0;

  // ---- Anzahl Wertungsrunden bestimmen ----
  const totalRounds = race.rounds || 0;
  const interval = race.scoringInterval || 1;
  const scoringRoundCount = Math.floor(totalRounds / interval);
  const scoringEntries = entries.filter((e) => e.type === "scoring");
  const isLastScoringRound = scoringEntries.length === scoringRoundCount;

  // ---- Entries verarbeiten ----
  for (const entry of entries) {

    // DNF
    if (entry.type === "dnf") {
      if (state[entry.athleteNumber]) {
        state[entry.athleteNumber].dnf = true;
      }
      continue;
    }

    // Überrundung
    if (entry.type === "lapup" || entry.type === "lapdown") {
      const s = state[entry.athleteNumber];
      if (!s) continue;

      if (race.lapdownMode === "points") {
        const pts = entry.type === "lapup"
          ? (race.lapdownPointsWin ?? 0)
          : -(race.lapdownPointsLoss ?? 0);
        s.points += pts;
        s.lapPoints += pts;
      }
      s.laps += entry.type === "lapup" ? 1 : -1;
      continue;
    }

    // Zieleinlauf
    if (entry.type === "finish") {
      const offset = entry.positionOffset ?? 0;
      entry.positions.forEach((nr, idx) => {
        if (state[nr]) state[nr].finishPosition = offset + idx + 1;
      });
      continue;
    }

    // Wertungsrunde
    if (entry.type === "scoring") {
      const isThisLastRound =
        scoringEntries.indexOf(entry) === scoringRoundCount - 1 ||
        entry.isLast;

      const positions = entry.positions;

      if (modeSlug === "points") {
        // Standard-Punkterennen: 1./2./3./4. bekommen Punkte, letzte Runde doppelt
        const basePoints = [
          race.pointsFirst ?? 5,
          race.pointsSecond ?? 3,
          race.pointsThird ?? 2,
          race.pointsFourth ?? 1,
        ];
        positions.forEach((nr, idx) => {
          const s = state[nr];
          if (!s || idx >= basePoints.length) return;
          const pts = isThisLastRound ? basePoints[idx] * 2 : basePoints[idx];
          s.points += pts;
          s.lastScoringPoints = pts;
          s.lastScoringRound = entry.roundNumber;
          s.scoringHistory.push(pts);
        });

      } else if (modeSlug === "danish") {
        // Dänisches Punkterennen: individuelle Verteilung pro Wertungsrunde
        const roundIndex = entry.roundNumber - 1;
        const dist = race.danishScoringRounds?.[roundIndex]?.pointsDistribution ?? [];
        positions.forEach((nr, idx) => {
          const s = state[nr];
          if (!s || idx >= dist.length) return;
          const pts = dist[idx] ?? 0;
          s.points += pts;
          s.lastScoringPoints = pts;
          s.lastScoringRound = entry.roundNumber;
          s.scoringHistory.push(pts);
        });

      } else if (modeSlug === "tempo") {
        // Temporennen: nur 1. und 2. bekommen Punkte
        const tempoPoints = [race.pointsFirst ?? 2, race.pointsSecond ?? 1];
        positions.forEach((nr, idx) => {
          const s = state[nr];
          if (!s || idx >= tempoPoints.length) return;
          s.points += tempoPoints[idx];
          s.lastScoringPoints = tempoPoints[idx];
          s.lastScoringRound = entry.roundNumber;
          s.scoringHistory.push(tempoPoints[idx]);
        });

      } else if (modeSlug === "elimination") {
        // Ausscheidungsrennen: alle eingetragenen Nummern scheiden aus
        // Reihenfolge bestimmt den Platz: zuerst eingetragen = zuletzt ausgeschieden = besser
        positions.forEach((nr) => {
          if (state[nr] && !state[nr].eliminated) {
            state[nr].eliminated = true;
            state[nr].eliminationOrder = eliminationCounter++;
          }
        });
      }
      // scratch: keine Wertung während des Rennens, nur Zieleinlauf zählt
    }
  }

  // ---- Sortierung nach Modus ----
  const allEntries = Object.values(state);

  if (modeSlug === "scratch") {
    // Nach Zieleinlauf sortieren
    return sortByFinish(allEntries);
  }

  if (modeSlug === "elimination") {
    const active = allEntries.filter((s) => !s.eliminated && !s.dnf);
    const elim = allEntries.filter((s) => s.eliminated);
    const dnf = allEntries.filter((s) => s.dnf && !s.eliminated);
    // Höherer eliminationOrder = später ausgeschieden = besserer Platz
    elim.sort((a, b) => b.eliminationOrder - a.eliminationOrder);
    return [...sortByFinish(active), ...elim, ...dnf];
  }

  // Punktemodi: Punkte absteigend; bei Gleichstand letzte Wertung; danach Zieleinlauf
  if (modeSlug === "points" || modeSlug === "danish" || modeSlug === "tempo") {
    const active = allEntries.filter((s) => !s.dnf);
    const dnf = allEntries.filter((s) => s.dnf);

    if (race.lapdownMode === "lapped") {
      // Überrundung: erst Runden-Differenz, dann Punkte
      active.sort((a, b) => {
        if (b.laps !== a.laps) return b.laps - a.laps;
        if (b.points !== a.points) return b.points - a.points;
        if (b.lastScoringRound !== a.lastScoringRound) return b.lastScoringRound - a.lastScoringRound;
        if (b.lastScoringPoints !== a.lastScoringPoints) return b.lastScoringPoints - a.lastScoringPoints;
        return compareFinish(a, b);
      });
    } else {
      // Überrundung in Punkte umgerechnet (bereits im State)
      active.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.lastScoringRound !== a.lastScoringRound) return b.lastScoringRound - a.lastScoringRound;
        if (b.lastScoringPoints !== a.lastScoringPoints) return b.lastScoringPoints - a.lastScoringPoints;
        return compareFinish(a, b);
      });
    }

    return [...active, ...dnf];
  }

  // Fallback
  return allEntries;
}

function sortByFinish(list) {
  return [...list].sort((a, b) => {
    if (a.finishPosition !== null && b.finishPosition !== null)
      return a.finishPosition - b.finishPosition;
    if (a.finishPosition !== null) return -1;
    if (b.finishPosition !== null) return 1;
    return 0;
  });
}

function compareFinish(a, b) {
  if (a.finishPosition !== null && b.finishPosition !== null)
    return a.finishPosition - b.finishPosition;
  if (a.finishPosition !== null) return -1;
  if (b.finishPosition !== null) return 1;
  return 0;
}
