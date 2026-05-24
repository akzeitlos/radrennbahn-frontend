import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import AthleteForm from "@/components/Forms/AthleteForm.jsx";
import useAthletes from "@/hooks/useAthletes.jsx";
import useClubs from "@/hooks/useClubs.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";

import { AuthContext } from "@/context/AuthContext.jsx";

import "./Athletes.css";

// ==============================
// Rennhistorie-Klappelement
// ==============================
const RaceHistoryPanel = ({ athleteId, fetchAthleteRaceHistory }) => {
  const [open, setOpen] = useState(false);
  const [races, setRaces] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!open && races === null) {
      setLoading(true);
      const result = await fetchAthleteRaceHistory(athleteId);
      setRaces(result.races);
      setLoading(false);
    }
    setOpen((v) => !v);
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

  return (
    <div className="athlete-history">
      <button className="athlete-history__toggle" onClick={toggle}>
        {open ? "▲" : "▼"} Rennhistorie
      </button>

      {open && (
        <div className="athlete-history__panel">
          {loading ? (
            <p className="athlete-history__empty">Lade …</p>
          ) : !races || races.length === 0 ? (
            <p className="athlete-history__empty">Noch keine Rennen eingetragen.</p>
          ) : (
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
                      <td className={pivot?.dnf ? "athlete-history__dnf" : ""}>
                        {formatResult(pivot)}
                      </td>
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
          )}
        </div>
      )}
    </div>
  );
};

// ==============================
// Hauptseite
// ==============================
const Athletes = () => {
  const { token } = useContext(AuthContext);

  const {
    athletes,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    fetchAthleteRaceHistory,
    isLoading,
    error,
  } = useAthletes(token);

  const { clubs } = useClubs(token);
  const { raceClasses } = useRaceClasses(token);

  const [athleteToDelete, setAthleteToDelete] = useState(null);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    raceNumber: "",
    gender: "",
    clubId: "",
    raceClasses: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      raceNumber: formData.raceNumber ? Number(formData.raceNumber) : null,
      clubId: formData.clubId === "" ? null : Number(formData.clubId),
      raceClasses: formData.raceClasses,
    };

    let result;
    if (editingAthlete) {
      result = await updateAthlete(editingAthlete.id, payload);
    } else {
      result = await createAthlete(payload);
    }

    if (result.success) {
      setShowForm(false);
      setEditingAthlete(null);
      setFormData({ firstname: "", lastname: "", raceNumber: "", gender: "", clubId: "", raceClasses: [] });
    }
  };

  const handleEdit = (athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      firstname: athlete.firstname || "",
      lastname: athlete.lastname || "",
      raceNumber: athlete.raceNumber || "",
      gender: athlete.gender || "",
      clubId: athlete.clubId || "",
      raceClasses: athlete.raceClasses?.map((r) => r.id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = (athlete) => setAthleteToDelete(athlete);

  const confirmDelete = async (id) => {
    const result = await deleteAthlete(id);
    if (result.success) setAthleteToDelete(null);
  };

  const emptyForm = { firstname: "", lastname: "", raceNumber: "", gender: "", clubId: "", raceClasses: [] };

  return (
    <>
      <h1>Athleten</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {athletes.map((athlete) => {
            if (athleteToDelete?.id === athlete.id) {
              return (
                <DeleteCard
                  key={athlete.id}
                  item={athlete}
                  title="Athlet"
                  onConfirm={confirmDelete}
                  onCancel={() => setAthleteToDelete(null)}
                />
              );
            }

            if (editingAthlete?.id === athlete.id && showForm) {
              return (
                <Card key={athlete.id} title="Athlet bearbeiten" extraClass="card-edit">
                  <AthleteForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingAthlete(null);
                      setFormData(emptyForm);
                    }}
                    clubs={clubs}
                    raceClasses={raceClasses}
                    error={error}
                  />
                </Card>
              );
            }

            return (
              <Card
                key={athlete.id}
                title={`${athlete.firstname} ${athlete.lastname}`}
                subtitle={`Nr. ${athlete.raceNumber || "-"}${athlete.club ? ` · ${athlete.club.name}` : ""}`}
                onEdit={() => handleEdit(athlete)}
                onDelete={() => handleDelete(athlete)}
              >
                <RaceHistoryPanel
                  athleteId={athlete.id}
                  fetchAthleteRaceHistory={fetchAthleteRaceHistory}
                />
              </Card>
            );
          })}

          {showForm && !editingAthlete ? (
            <Card title="Neuer Athlet" extraClass="card-edit">
              <AthleteForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                clubs={clubs}
                raceClasses={raceClasses}
                error={error}
              />
            </Card>
          ) : (
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditingAthlete(null);
                  setFormData(emptyForm);
                  setShowForm(true);
                }}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default Athletes;
