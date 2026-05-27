import { useState, useMemo, Fragment } from "react";
import RaceResultsFilterBar from "./components/RaceResultsFilterBar.jsx";
import RaceResultsPdfExport from "./components/RaceResultsPdfExport.jsx";
import Button from "@/components/Button/Button.jsx";
import Male from "@/assets/icons/male.svg?react";
import Female from "@/assets/icons/female.svg?react";
import "./RaceResults.css";

const MEDAL = ["🥇", "🥈", "🥉"];

// ── Kleine Badge-Komponenten ───────────────────────────────────────────────

const GenderBadge = ({ gender }) => {
  if (!gender) return <span className="rr-dash">—</span>;
  const isMale = gender === "m" || gender === "male" || gender === "männlich";
  return (
    <span className={`rr-gender-badge ${isMale ? "rr-gender-badge--m" : "rr-gender-badge--f"}`}>
      {isMale ? <><Male className="icon" /> m</> : <><Female className="icon" /> w</>}
    </span>
  );
};

const RaceClassBadges = ({ raceClasses }) => {
  if (!raceClasses?.length) return <span className="rr-dash">—</span>;
  return (
    <div className="rr-class-badges">
      {raceClasses.map((rc) => (
        <span key={rc.id} className="rr-class-badge">{rc.title ?? rc.name}</span>
      ))}
    </div>
  );
};

// ── Filter-Funktion ────────────────────────────────────────────────────────

const applyFilters = (results, athletes, filters) => {
  return results.filter((r) => {
    const athlete = athletes?.find((a) => a.raceNumber === r.athleteNumber);

    if (filters.gender) {
      const g = (athlete?.gender ?? "").toLowerCase();
      const isMale   = g === "m" || g === "male"   || g === "männlich";
      const isFemale = g === "f" || g === "female" || g === "weiblich" || g === "w";
      if (filters.gender === "m" && !isMale)   return false;
      if (filters.gender === "f" && !isFemale) return false;
    }

    if (filters.raceClassIds.length > 0) {
      const athleteClassIds = athlete?.raceClasses?.map((rc) => rc.id) ?? [];
      if (!filters.raceClassIds.some((id) => athleteClassIds.includes(id))) return false;
    }

    return true;
  });
};

// ── Haupt-Komponente ───────────────────────────────────────────────────────

const RaceResults = ({ race, modeSlug, results, entries }) => {
  const lapdownMode      = race.lapdownMode;
  const showLaps         = lapdownMode === "lapped" || lapdownMode === "points";
  const showPoints       = ["points", "danish", "tempo"].includes(modeSlug);
  const isPointsMode     = showPoints;
  const athletes         = race.athletes ?? [];

  const scoringCount      = entries.filter((e) => e.type === "scoring").length;
  const totalRounds       = race.rounds ?? 0;
  const interval          = race.scoringInterval ?? 1;
  const scoringRoundCount = modeSlug === "elimination"
    ? Math.max(0, athletes.length - 1)
    : Math.floor(totalRounds / interval);

  const isFinal =
    modeSlug === "elimination"
      ? results.length > 0 && results.filter((r) => !r.dnf && !r.eliminated).length <= 1
      : modeSlug === "scratch"
      ? entries.some((e) => e.type === "finish")
      : scoringRoundCount > 0 && scoringCount >= scoringRoundCount;

  const raceClasses = useMemo(() => {
    const map = new Map();
    athletes.forEach((a) =>
      a.raceClasses?.forEach((rc) => { if (!map.has(rc.id)) map.set(rc.id, rc); })
    );
    return Array.from(map.values());
  }, [athletes]);

  const [filters, setFilters] = useState({ gender: "", raceClassIds: [] });
  const isFilterActive = filters.gender || filters.raceClassIds.length > 0;
  const handleResetFilters = () => setFilters({ gender: "", raceClassIds: [] });

  const [expandedRows, setExpandedRows] = useState(new Set());
  const toggleRow = (nr) => setExpandedRows((prev) => {
    const next = new Set(prev);
    next.has(nr) ? next.delete(nr) : next.add(nr);
    return next;
  });

  const filteredResults = useMemo(
    () => applyFilters(results, athletes, filters),
    [results, athletes, filters]
  );

  const rankMap = useMemo(() => {
    if (modeSlug === "elimination") {
      // Alle nicht-DNF-Fahrer bekommen einen Platz (aktive + ausgeschiedene, in Reihenfolge)
      const map = new Map();
      filteredResults.filter((r) => !r.dnf).forEach((r, i) => {
        map.set(r.athleteNumber, i + 1);
      });
      return map;
    }
    const isTied = (a, b) => {
      if (modeSlug === "scratch") return a.finishPosition === b.finishPosition;
      if (isPointsMode) {
        if (lapdownMode === "lapped" && a.laps !== b.laps) return false;
        if (a.points !== b.points) return false;
        if (a.lastScoringPoints !== b.lastScoringPoints) return false;
        return a.finishPosition === b.finishPosition;
      }
      return false;
    };
    const active = filteredResults.filter((r) => !r.dnf && !r.eliminated);
    const map = new Map();
    active.forEach((r, i) => {
      const rank = i === 0 || !isTied(r, active[i - 1])
        ? i + 1
        : map.get(active[i - 1].athleteNumber);
      map.set(r.athleteNumber, rank);
    });
    return map;
  }, [filteredResults, modeSlug, isPointsMode, lapdownMode]);

  return (
    <>
    <div className="race-results card">
      {/* Header-Zeile */}
      <div className="race-results__header-row">
        <h2 className="race-results__title">{isFinal ? "Endstand" : "Zwischenstand"}</h2>
        <div className="race-results__header-actions">
          {modeSlug !== "scratch" && modeSlug !== "elimination" && (
            <span className="race-results__counter">
              Wertungen: {scoringCount} / {scoringRoundCount}
            </span>
          )}
        </div>
      </div>

      {/* Tabelle */}
      {filteredResults.length === 0 ? (
        <p className="race-results__empty">
          {results.length === 0 ? "Noch keine Einträge." : "Keine Ergebnisse für diesen Filter."}
        </p>
      ) : (
        <div className="race-results__table-wrap">
          <table className="race-results__table">
            <thead>
              <tr>
                <th className="race-results__col-rank">#</th>
                <th className="race-results__col-nr">Nr.</th>
                <th className="race-results__col-name">Name</th>
                <th className="race-results__col-gender">Geschl.</th>
                <th className="race-results__col-classes">Klasse(n)</th>
                <th className="race-results__col-club">Verein</th>
                {showPoints && <th className="race-results__col-pts">Punkte</th>}
                {showLaps && <th className="race-results__col-laps">{lapdownMode === "points" ? "Überr." : "Runden"}</th>}
                <th className="race-results__col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r) => {
                const rank  = r.dnf ? null : (rankMap.get(r.athleteNumber) ?? null);
                const medal = rank && rank <= 3 ? MEDAL[rank - 1] : null;
                const rowClass = r.dnf
                  ? "race-results__row--dnf"
                  : r.eliminated
                  ? "race-results__row--eliminated"
                  : "";
                const athlete = athletes.find((a) => a.raceNumber === r.athleteNumber);

                const isExpanded = expandedRows.has(r.athleteNumber);
                const colSpan = 3 + (showPoints ? 1 : 0) + (showLaps ? 1 : 0) + 1;

                return (
                  <Fragment key={r.athleteNumber}>
                  <tr
                    className={`race-results__row race-results__row--clickable ${rowClass}`}
                    onClick={() => toggleRow(r.athleteNumber)}
                  >
                    <td className="race-results__col-rank">
                      {medal ?? (rank ? rank : "—")}
                    </td>
                    <td className="race-results__col-nr">{r.athleteNumber}</td>
                    <td className="race-results__col-name">{r.name}</td>
                    <td className="race-results__col-gender">
                      <GenderBadge gender={athlete?.gender} />
                    </td>
                    <td className="race-results__col-classes">
                      <RaceClassBadges raceClasses={athlete?.raceClasses} />
                    </td>
                    <td className="race-results__col-club">
                      {athlete?.club?.name ?? <span className="rr-dash">—</span>}
                    </td>
                    {showPoints && (
                      <td className="race-results__col-pts">
                        <strong>{r.points}</strong>
                        {r.lastScoringPoints > 0 && (
                          <span className="race-results__last-pts">+{r.lastScoringPoints}</span>
                        )}
                      </td>
                    )}
                    {showLaps && (
                      <td className="race-results__col-laps">
                        {lapdownMode === "points" ? (
                          r.lapPoints > 0 ? (
                            <span className="race-results__laps-up">+{r.lapPoints}</span>
                          ) : r.lapPoints < 0 ? (
                            <span className="race-results__laps-down">{r.lapPoints}</span>
                          ) : (
                            <span className="race-results__laps-zero">—</span>
                          )
                        ) : (
                          r.laps > 0 ? (
                            <span className="race-results__laps-up">+{r.laps}</span>
                          ) : r.laps < 0 ? (
                            <span className="race-results__laps-down">{r.laps}</span>
                          ) : (
                            <span className="race-results__laps-zero">0</span>
                          )
                        )}
                      </td>
                    )}
                    <td className="race-results__col-status">
                      {r.dnf ? (
                        <span className="race-results__badge race-results__badge--dnf">DNF</span>
                      ) : r.eliminated ? (
                        <span className="race-results__badge race-results__badge--elim">OUT</span>
                      ) : (
                        <span className="race-results__badge race-results__badge--ok">✓</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="rr-expand-row">
                      <td colSpan={colSpan}>
                        <div className="rr-expand-content">
                          <GenderBadge gender={athlete?.gender} />
                          {athlete?.raceClasses?.length > 0 && (
                            <RaceClassBadges raceClasses={athlete.raceClasses} />
                          )}
                          {athlete?.club?.name && (
                            <span className="rr-expand-content__club">{athlete.club.name}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {results.length > 0 && (
      <div className="race-results__tools card">
        <RaceResultsFilterBar
          filters={filters}
          onChange={setFilters}
          raceClasses={raceClasses}
        />
        <RaceResultsPdfExport
          results={filteredResults}
          race={race}
          modeSlug={modeSlug}
          filters={filters}
          raceClasses={raceClasses}
        />
        <div className="rr-filter-bar__meta">
          <span className="rr-filter-bar__count">
            {filteredResults.length} von {results.length} Startern
          </span>
          {isFilterActive && (
            <Button style="secondary" small onClick={handleResetFilters}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default RaceResults;
