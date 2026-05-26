import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import RaceForm from "@/components/Forms/RaceForm.jsx";
import useRaces from "@/hooks/useRaces.jsx";
import useRaceModes from "@/hooks/useRaceModes.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";
import useAthletes from "@/hooks/useAthletes.jsx";

import { AuthContext } from "@/context/AuthContext.jsx";

import "./Races.css";

const emptyForm = {
  date: "",
  raceModeId: "",
  rounds: "",
  scoringInterval: "",
  lapdownMode: "lapped",
  lapdownPointsWin: "",
  lapdownPointsLoss: "",
  pointsFirst: "",
  pointsSecond: "",
  pointsThird: "",
  pointsFourth: "",
  raceClasses: [],
  athletes: [],
  danishScoringRounds: [],
};

const Races = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const { races, createRace, updateRace, deleteRace, isLoading, error } = useRaces(token);
  const { raceModes } = useRaceModes(token);
  const { raceClasses } = useRaceClasses(token);
  const { athletes } = useAthletes(token);

  const [raceToDelete, setRaceToDelete] = useState(null);
  const [editingRace, setEditingRace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "raceClasses") {
      const removedClassIds = formData.raceClasses.filter((id) => !value.includes(id));

      if (removedClassIds.length > 0) {
        const athletesToRemove = athletes
          .filter(
            (a) =>
              a.raceClasses?.some((rc) => removedClassIds.includes(rc.id)) &&
              !a.raceClasses?.some((rc) => value.includes(rc.id)),
          )
          .map((a) => a.id);

        setFormData((prev) => ({
          ...prev,
          raceClasses: value,
          athletes: prev.athletes.filter((id) => !athletesToRemove.includes(id)),
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "raceModeId") {
      const slug = raceModes.find((m) => m.id === Number(value))?.slug;
      const pointDefaults =
        slug === "points"
          ? { pointsFirst: 5, pointsSecond: 3, pointsThird: 2, pointsFourth: 1 }
          : slug === "tempo"
          ? { pointsFirst: 2, pointsSecond: 1, pointsThird: "", pointsFourth: "" }
          : { pointsFirst: "", pointsSecond: "", pointsThird: "", pointsFourth: "" };

      setFormData((prev) => ({ ...prev, [name]: value, ...pointDefaults }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      rounds: formData.rounds ? Number(formData.rounds) : null,
      scoringInterval: formData.scoringInterval ? Number(formData.scoringInterval) : null,
      raceModeId: formData.raceModeId ? Number(formData.raceModeId) : null,
      lapdownPointsWin: formData.lapdownPointsWin ? Number(formData.lapdownPointsWin) : null,
      lapdownPointsLoss: formData.lapdownPointsLoss ? Number(formData.lapdownPointsLoss) : null,
      pointsFirst: formData.pointsFirst ? Number(formData.pointsFirst) : null,
      pointsSecond: formData.pointsSecond ? Number(formData.pointsSecond) : null,
      pointsThird: formData.pointsThird ? Number(formData.pointsThird) : null,
      pointsFourth: formData.pointsFourth ? Number(formData.pointsFourth) : null,
    };

    const result = editingRace
      ? await updateRace(editingRace.id, payload)
      : await createRace(payload);

    if (result.success) {
      setShowForm(false);
      setEditingRace(null);
      setFormData(emptyForm);
    }
  };

  const handleEdit = (race) => {
    setEditingRace(race);
    setFormData({
      date: race.date || "",
      raceModeId: race.raceModeId || "",
      rounds: race.rounds || "",
      scoringInterval: race.scoringInterval || "",
      lapdownMode: race.lapdownMode || "lapped",
      lapdownPointsWin: race.lapdownPointsWin ?? "",
      lapdownPointsLoss: race.lapdownPointsLoss ?? "",
      pointsFirst: race.pointsFirst ?? "",
      pointsSecond: race.pointsSecond ?? "",
      pointsThird: race.pointsThird ?? "",
      pointsFourth: race.pointsFourth ?? "",
      raceClasses: race.raceClasses?.map((rc) => rc.id) || [],
      athletes: race.athletes?.map((a) => a.id) || [],
      danishScoringRounds: race.danishScoringRounds || [],
    });
    setShowForm(true);
  };

  const confirmDelete = async (id) => {
    const result = await deleteRace(id);
    if (result.success) setRaceToDelete(null);
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcomingRaces = [...races]
    .filter((r) => !r.date || r.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <>
      <h1>Rennen</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {upcomingRaces.map((race) => {
            if (raceToDelete?.id === race.id) {
              return (
                <DeleteCard
                  key={race.id}
                  item={race}
                  title="Rennen"
                  onConfirm={confirmDelete}
                  onCancel={() => setRaceToDelete(null)}
                />
              );
            }

            if (editingRace?.id === race.id && showForm) {
              return (
                <Card key={race.id} title="Rennen bearbeiten" extraClass="card-edit">
                  <RaceForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingRace(null);
                      setFormData(emptyForm);
                    }}
                    raceModes={raceModes}
                    raceClasses={raceClasses}
                    athletes={athletes}
                    error={error}
                  />
                </Card>
              );
            }

            const [year, month, day] = (race.date || "").split("-");
            const formattedDate = race.date ? `${day}.${month}.${year}` : "-";
            const raceClassNames = race.raceClasses?.map((rc) => rc.name).join(", ") || "";

            return (
              <Card
                key={race.id}
                title={`${formattedDate}${raceClassNames ? ` · ${raceClassNames}` : ""}`}
                subtitle={race.raceMode?.title || "-"}
                onPlay={() => navigate(`/races/${race.id}/session`)}
                isCompleted={race.isCompleted}
                onEdit={() => handleEdit(race)}
                onDelete={() => setRaceToDelete(race)}
              />
            );
          })}

          {showForm && !editingRace ? (
            <Card title="Neues Rennen" extraClass="card-edit">
              <RaceForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                raceModes={raceModes}
                raceClasses={raceClasses}
                athletes={athletes}
                error={error}
              />
            </Card>
          ) : (
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditingRace(null);
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

export default Races;
