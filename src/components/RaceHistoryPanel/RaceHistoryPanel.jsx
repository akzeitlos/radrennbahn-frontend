import { useState, useEffect } from "react";
import "./RaceHistoryPanel.css";

const RaceHistoryPanel = ({ athleteId, fetchAthleteRaceHistory, autoLoad = false }) => {
  const [races, setRaces] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoLoad && races === null) {
      setLoading(true);
      fetchAthleteRaceHistory(athleteId).then((result) => {
        setRaces(result.races);
        setLoading(false);
      });
    }
  }, [autoLoad]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  };

  const formatResult = (pivot) => {
    if (!pivot) return "";
    if (pivot.dnf) return "DNF";
    if (pivot.eliminated) return "Ausgeschieden";
    if (pivot.finalPosition) return `Platz ${pivot.finalPosition}`;
    return "-";
  };

  if (loading) return <p className="athlete-history__empty">Lade …</p>;

  if (!races || races.length === 0) {
    return <p className="athlete-history__empty">Noch keine Rennen eingetragen.</p>;
  }

  return (
    <table className="athlete-history__table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Modus</th>
          <th>Ergebnis</th>
          <th>Punkte</th>
        </tr>
      </thead>
      <tbody>
        {races.map((r) => {
          const pivot = r.raceAthlete;
          return (
            <tr key={r.id}>
              <td>{formatDate(r.date)}</td>
              <td>{r.raceMode?.title ?? "-"}</td>
              <td className={pivot?.dnf ? "athlete-history__dnf" : ""}>{formatResult(pivot)}</td>
              <td>
                {pivot?.points != null ? pivot.points : "-"}
                {pivot?.laps !== 0 && pivot?.laps != null ? (
                  <span className={`athlete-history__laps ${pivot.laps > 0 ? "athlete-history__laps--up" : "athlete-history__laps--down"}`}>
                    {pivot.laps > 0 ? ` (+${pivot.laps}R)` : ` (${pivot.laps}R)`}
                  </span>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RaceHistoryPanel;