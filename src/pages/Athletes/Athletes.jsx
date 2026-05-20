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

const Athletes = () => {
  const { token } = useContext(AuthContext);

  const {
    athletes,
    createAthlete,
    updateAthlete,
    deleteAthlete,
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
      // Verhindert den Foreign Key Constraint Error (0 vs null)
      clubId: formData.clubId === "" ? null : Number(formData.clubId),
      // Da sie jetzt schon Numbers sind, reicht das direkte Array:
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
      setFormData({
        firstname: "",
        lastname: "",
        raceNumber: "",
        gender: "",
        clubId: "",
        raceClasses: [],
      });
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
      // HIER GEÄNDERT: String() entfernt, damit es Numbers bleiben
      raceClasses: athlete.raceClasses?.map((r) => r.id) || [],
    });
    setShowForm(true);
  };

  const handleDelete = (athlete) => setAthleteToDelete(athlete);

  const confirmDelete = async (id) => {
    const result = await deleteAthlete(id);
    if (result.success) setAthleteToDelete(null);
  };

  return (
    <>
      <h1>Athleten</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {athletes.map((athlete) => {
            // 1. LÖSCH-ZUSTAND
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

            // 2. EDITIER-ZUSTAND: Ersetze die Karte direkt mit dem Formular
            if (editingAthlete?.id === athlete.id && showForm) {
              return (
                <Card
                  key={athlete.id}
                  title="Athlet bearbeiten"
                  extraClass="card-edit"
                >
                  <AthleteForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingAthlete(null);
                      // Formulardaten zurücksetzen
                      setFormData({
                        firstname: "",
                        lastname: "",
                        raceNumber: "",
                        gender: "",
                        clubId: "",
                        raceClasses: [],
                      });
                    }}
                    clubs={clubs}
                    raceClasses={raceClasses}
                    error={error}
                  />
                </Card>
              );
            }

            // 3. NORMALER ZUSTAND
            return (
              <Card
                key={athlete.id}
                title={`${athlete.firstname} ${athlete.lastname}`}
                subtitle={`Nr. ${athlete.raceNumber || "-"}`}
                onEdit={() => handleEdit(athlete)}
                onDelete={() => handleDelete(athlete)}
              />
            );
          })}

          {/* Formular für einen GANZ NEUEN Athleten (am Ende der Liste) */}
          {showForm && !editingAthlete ? (
            <Card title="Neuer Athlet" extraClass="card-edit">
              <AthleteForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                }}
                clubs={clubs}
                raceClasses={raceClasses}
                error={error}
              />
            </Card>
          ) : (
            // Zeige die "Hinzufügen"-Karte nur, wenn wir nicht gerade einen neuen erstellen
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditingAthlete(null);
                  setFormData({
                    firstname: "",
                    lastname: "",
                    raceNumber: "",
                    gender: "",
                    clubId: "",
                    raceClasses: [],
                  });
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
