import "./RaceResults.css";

const MEDAL = ["🥇", "🥈", "🥉"];

const RaceResults = ({ race, modeSlug, results, entries }) => {
  const lapdownMode = race.lapdownMode;
  const showLaps = lapdownMode === "lapped";
  const showPoints =
    modeSlug === "points" ||
    modeSlug === "danish" ||
    modeSlug === "tempo";

  const scoringCount = entries.filter((e) => e.type === "scoring").length;
  const totalRounds = race.rounds ?? 0;
  const interval = race.scoringInterval ?? 1;
  const scoringRoundCount = Math.floor(totalRounds / interval);

  return (
    <div className="race-results card">
      <div className="race-results__header-row">
        <h2 className="race-results__title">Zwischenstand</h2>
        {modeSlug !== "scratch" && (
          <span className="race-results__counter">
            Wertungen: {scoringCount} / {scoringRoundCount}
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <p className="race-results__empty">Noch keine Einträge.</p>
      ) : (
        <div className="race-results__table-wrap">
          <table className="race-results__table">
            <thead>
              <tr>
                <th className="race-results__col-rank">#</th>
                <th className="race-results__col-nr">Nr.</th>
                <th className="race-results__col-name">Name</th>
                {showPoints && (
                  <th className="race-results__col-pts">Punkte</th>
                )}
                {showLaps && showPoints && (
                  <th className="race-results__col-laps">Rd.</th>
                )}
                {showLaps && !showPoints && (
                  <th className="race-results__col-laps">Runden</th>
                )}
                {modeSlug === "scratch" || modeSlug === "elimination" ? (
                  <th className="race-results__col-finish">Einlauf</th>
                ) : null}
                <th className="race-results__col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const rank = r.dnf || r.eliminated ? null : idx + 1;
                const medal = rank && rank <= 3 ? MEDAL[rank - 1] : null;
                const rowClass = r.dnf
                  ? "race-results__row--dnf"
                  : r.eliminated
                  ? "race-results__row--eliminated"
                  : "";

                return (
                  <tr key={r.athleteNumber} className={`race-results__row ${rowClass}`}>
                    <td className="race-results__col-rank">
                      {medal ?? (rank ? rank : "—")}
                    </td>
                    <td className="race-results__col-nr">{r.athleteNumber}</td>
                    <td className="race-results__col-name">{r.name}</td>
                    {showPoints && (
                      <td className="race-results__col-pts">
                        <strong>{r.points}</strong>
                        {r.lastScoringPoints > 0 && (
                          <span className="race-results__last-pts">
                            +{r.lastScoringPoints}
                          </span>
                        )}
                      </td>
                    )}
                    {showLaps && (
                      <td className="race-results__col-laps">
                        {r.laps > 0 ? (
                          <span className="race-results__laps-up">+{r.laps}</span>
                        ) : r.laps < 0 ? (
                          <span className="race-results__laps-down">{r.laps}</span>
                        ) : (
                          <span className="race-results__laps-zero">0</span>
                        )}
                      </td>
                    )}
                    {(modeSlug === "scratch" || modeSlug === "elimination") && (
                      <td className="race-results__col-finish">
                        {r.finishPosition ?? "—"}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RaceResults;
