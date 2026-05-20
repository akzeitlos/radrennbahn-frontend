import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import RaceClassForm from "@/components/Forms/RaceClassForm.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";

import "./RaceClasses.css";

const RaceClasses = () => {
  const { token } = useContext(AuthContext);
  const { raceClasses, createRaceClass, updateRaceClass, deleteRaceClass, isLoading, error } =
    useRaceClasses(token);

  const [toDelete, setToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = editing
      ? await updateRaceClass(editing.id, formData)
      : await createRaceClass(formData);

    if (result.success) {
      setShowForm(false);
      setEditing(null);
      setFormData({ name: "" });
    }
  };

  return (
    <>
      <h1>Rennklassen</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {raceClasses.map((rc) => {
            // 1. LÖSCH-ZUSTAND
            if (toDelete?.id === rc.id) {
              return (
                <DeleteCard
                  key={rc.id}
                  item={rc}
                  title="Rennklasse"
                  onConfirm={() => deleteRaceClass(rc.id)}
                  onCancel={() => setToDelete(null)}
                />
              );
            }

            // 2. EDITIER-ZUSTAND: Formular direkt inline in der Liste anzeigen
            if (editing?.id === rc.id && showForm) {
              return (
                <Card key={rc.id} title="Rennklasse bearbeiten" extraClass="card-edit">
                  <RaceClassForm
                    formData={formData}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditing(null);
                      setFormData({ name: "" });
                    }}
                    error={error}
                  />
                </Card>
              );
            }

            // 3. NORMALER ZUSTAND
            return (
              <Card
                key={rc.id}
                title={rc.name}
                onEdit={() => {
                  setEditing(rc);
                  setFormData({ name: rc.name });
                  setShowForm(true);
                }}
                onDelete={() => setToDelete(rc)}
              />
            );
          })}

          {/* Formular für eine GANZ NEUE Rennklasse (am Ende der Liste) */}
          {showForm && !editing ? (
            <Card title="Neue Rennklasse" extraClass="card-edit">
              <RaceClassForm
                formData={formData}
                onChange={(e) => setFormData({ name: e.target.value })}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                }}
                error={error}
              />
            </Card>
          ) : (
            // Zeige die "Hinzufügen"-Karte nur, wenn wir nicht gerade eine neue erstellen
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditing(null);
                  setFormData({ name: "" });
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

export default RaceClasses;