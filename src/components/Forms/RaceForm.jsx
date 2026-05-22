import Input from "@/components/FormElements/Input/Input.jsx";
import Select from "@/components/FormElements/Select/Select.jsx";
import ChipSelect from "@/components/FormElements/ChipSelect/ChipSelect.jsx";
import MultiSelect from "@/components/FormElements/MultiSelect/MultiSelect.jsx";
import Button from "@/components/Button/Button.jsx";

const RaceForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  raceModes,
  raceClasses,
  athletes,
  error,
}) => {
  const selectedMode = raceModes.find((m) => m.id === Number(formData.raceModeId));
  const modeType = selectedMode?.slug;

  const modeSelected = !!selectedMode;
  const showPoints = modeSelected && (modeType === "points" || modeType === "tempo" || modeType === "danish");
  const isDanish = modeType === "danish";
  const showAthletes = formData.raceClasses.length > 0;

  // ==============================
  // Athleten nach Rennklassen filtern
  // ==============================
  const filteredAthletes = athletes.filter((a) =>
    a.raceClasses?.some((rc) => formData.raceClasses.includes(rc.id))
  );

  // ==============================
  // Dänisches Grid
  // ==============================
  const rounds = Number(formData.rounds);
  const interval = Number(formData.scoringInterval);
  const danishRowCount = rounds > 0 && interval > 0 ? Math.floor(rounds / interval) : 0;

  const getDanishValue = (rowIndex, colIndex) => {
    const round = formData.danishScoringRounds[rowIndex];
    if (!round) return "";
    return round.pointsDistribution[colIndex] ?? "";
  };

  const setDanishValue = (rowIndex, colIndex, val) => {
    const updated = Array.from({ length: danishRowCount }, (_, i) => {
      const existing = formData.danishScoringRounds[i] || {
        roundNumber: i + 1,
        pointsDistribution: [],
      };
      return { ...existing, pointsDistribution: [...(existing.pointsDistribution || [])] };
    });

    const dist = [...(updated[rowIndex].pointsDistribution || [])];
    dist[colIndex] = val === "" ? undefined : Number(val);
    while (dist.length > 0 && dist[dist.length - 1] === undefined) {
      dist.pop();
    }
    updated[rowIndex].pointsDistribution = dist;

    onChange({ target: { name: "danishScoringRounds", value: updated } });
  };

  const maxPlaces = Math.max(
    4,
    ...formData.danishScoringRounds.map((r) => r.pointsDistribution?.length || 0)
  );

  return (
    <form className="form race-form" onSubmit={onSubmit}>

      {/* ==============================
          ABSCHNITT 1: ALLGEMEIN
      ============================== */}
      <div className="race-form__section">
        <h3 className="race-form__section-title">Allgemein</h3>
        <div className="race-form__grid">
          <Input
            name="date"
            label="Datum"
            type="date"
            value={formData.date}
            onChange={onChange}
            required
          />
          <Select
            label="Rennmodus"
            name="raceModeId"
            value={formData.raceModeId}
            onChange={onChange}
            options={raceModes.map((m) => ({ value: m.id, label: m.title }))}
          />

          {modeSelected && (
            <>
              <Input
                name="rounds"
                label="Runden"
                type="number"
                value={formData.rounds}
                onChange={onChange}
                required
              />
              <Input
                name="scoringInterval"
                label="Wertung alle X Runden"
                type="number"
                value={formData.scoringInterval}
                onChange={onChange}
              />
              <Select
                label="Überrundungsmodus"
                name="lapdownMode"
                value={formData.lapdownMode}
                onChange={onChange}
                options={[
                  { value: "lapped", label: "Überrundung registrieren" },
                  { value: "points", label: "Punkteverlust bei Überrundung" },
                ]}
              />
            </>
          )}
        </div>

        {!modeSelected && (
          <p className="race-form__hint">Wähle zuerst einen Rennmodus.</p>
        )}
      </div>

      {/* ==============================
          ABSCHNITT 2: PUNKTE
      ============================== */}
      {showPoints && (
        <div className="race-form__section">
          <h3 className="race-form__section-title">Punkte</h3>

          {/* Lapdown + Platzierungspunkte — nur wenn nicht danish oder lapdown points aktiv */}
          {(!isDanish || formData.lapdownMode === "points") && (
            <div className="race-form__grid">
              {formData.lapdownMode === "points" && (
                <>
                  <Input
                    name="lapdownPointsWin"
                    label="Punkte bei Überrundung (Gewinn)"
                    type="number"
                    value={formData.lapdownPointsWin}
                    onChange={onChange}
                  />
                  <Input
                    name="lapdownPointsLoss"
                    label="Punkte bei Überrundung (Verlust)"
                    type="number"
                    value={formData.lapdownPointsLoss}
                    onChange={onChange}
                  />
                </>
              )}

              {modeType === "tempo" ? (
                <>
                  <Input
                    name="pointsFirst"
                    label="Punkte Erster"
                    type="number"
                    value={formData.pointsFirst}
                    onChange={onChange}
                  />
                  <Input
                    name="pointsSecond"
                    label="Punkte Zweiter"
                    type="number"
                    value={formData.pointsSecond}
                    onChange={onChange}
                  />
                </>
              ) : !isDanish ? (
                <>
                  <Input
                    name="pointsFirst"
                    label="Punkte Erster"
                    type="number"
                    value={formData.pointsFirst}
                    onChange={onChange}
                  />
                  <Input
                    name="pointsSecond"
                    label="Punkte Zweiter"
                    type="number"
                    value={formData.pointsSecond}
                    onChange={onChange}
                  />
                  <Input
                    name="pointsThird"
                    label="Punkte Dritter"
                    type="number"
                    value={formData.pointsThird}
                    onChange={onChange}
                  />
                  <Input
                    name="pointsFourth"
                    label="Punkte Vierter"
                    type="number"
                    value={formData.pointsFourth}
                    onChange={onChange}
                  />
                </>
              ) : null}
            </div>
          )}

          {/* Dänisches Punktegrid */}
          {isDanish && danishRowCount > 0 && (
            <div className="race-form__danish">
              <div
                className="race-form__danish-grid"
                style={{ gridTemplateColumns: `auto repeat(${danishRowCount}, 1fr)` }}
              >
                <div className="race-form__danish-cell race-form__danish-cell--header" />
                {Array.from({ length: danishRowCount }, (_, i) => (
                  <div key={i} className="race-form__danish-cell race-form__danish-cell--header">
                    {i + 1}. Wertung
                  </div>
                ))}

                {Array.from({ length: maxPlaces }, (_, colIndex) => (
                  <>
                    <div
                      key={`label-${colIndex}`}
                      className="race-form__danish-cell race-form__danish-cell--label"
                    >
                      Platz {colIndex + 1}
                    </div>
                    {Array.from({ length: danishRowCount }, (_, rowIndex) => (
                      <input
                        key={`cell-${rowIndex}-${colIndex}`}
                        className="race-form__danish-cell race-form__danish-cell--input"
                        type="number"
                        min="0"
                        value={getDanishValue(rowIndex, colIndex)}
                        onChange={(e) => setDanishValue(rowIndex, colIndex, e.target.value)}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          )}

          {isDanish && danishRowCount === 0 && (
            <p className="race-form__hint">
              Trage Runden und Wertungsintervall ein, um das Punktegrid zu sehen.
            </p>
          )}
        </div>
      )}

      {/* ==============================
          ABSCHNITT 3: TEILNEHMER
      ============================== */}
      {modeSelected && (
        <div className="race-form__section">
          <h3 className="race-form__section-title">Rennklassen & Teilnehmer</h3>
          <MultiSelect
            label="Rennklassen"
            name="raceClasses"
            value={formData.raceClasses}
            onChange={onChange}
            options={raceClasses.map((rc) => ({ value: rc.id, label: rc.name }))}
          />

          {showAthletes ? (
            <ChipSelect
              label="Athleten"
              name="athletes"
              value={formData.athletes}
              onChange={onChange}
              options={filteredAthletes.map((a) => ({
                value: a.id,
                label: `${a.firstname} ${a.lastname} · Nr. ${a.raceNumber}`,
              }))}
            />
          ) : (
            <p className="race-form__hint">
              Wähle zuerst eine Rennklasse, um Athleten auswählen zu können.
            </p>
          )}
        </div>
      )}

      {/* ==============================
          AKTIONEN
      ============================== */}
      <div className="race-form__section race-form__section--actions">
        <Button type="submit" style="primary">
          Speichern
        </Button>
        <Button type="button" style="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
        {error && <p className="error-message">{error}</p>}
      </div>

    </form>
  );
};

export default RaceForm;