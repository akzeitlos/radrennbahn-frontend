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

  const abbreviateTitle = (title) => {
    if (!title || title.length <= 14) return title;
    const words = title.split(" ");
    if (words.length <= 1) return title;
    return words[0].slice(0, 3) + ". " + words.slice(1).join(" ");
  };

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
    <ul className="athlete-history__list">
      {races.map((r) => {
        const pivot = r.raceAthlete;
        const points = pivot?.points != null ? `${pivot.points} Punkte` : "0 Punkte";
        return (
          <li key={r.id} className="athlete-history__entry">
            <span className="athlete-history__date">{formatDate(r.date)},</span>
            <span>{abbreviateTitle(r.raceMode?.title) ?? "-"},</span>
            <span className={pivot?.dnf ? "athlete-history__dnf" : ""}>{formatResult(pivot)},</span>
            <span>
              {points}
              {pivot?.laps != null && pivot.laps !== 0 && (
                <span className={`athlete-history__laps ${pivot.laps > 0 ? "athlete-history__laps--up" : "athlete-history__laps--down"}`}>
                  {pivot.laps > 0 ? ` (+${pivot.laps}R)` : ` (${pivot.laps}R)`}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default RaceHistoryPanel;