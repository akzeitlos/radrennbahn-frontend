import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import ClubForm from "@/components/Forms/ClubForm.jsx";
import useClubs from "@/hooks/useClubs.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";

import "./Clubs.css";

const Clubs = () => {
  const { token } = useContext(AuthContext);
  const { clubs, createClub, updateClub, deleteClub, isLoading, error } =
    useClubs(token);

  const [clubToDelete, setClubToDelete] = useState(null);
  const [editingClub, setEditingClub] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = editingClub
      ? await updateClub(editingClub.id, formData)
      : await createClub(formData);

    if (result.success) {
      setShowForm(false);
      setEditingClub(null);
      setFormData({ name: "" });
    }
  };

  return (
    <>
      <h1>Vereine</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {clubs.map((club) => {
            // 1. LÖSCH-ZUSTAND
            if (clubToDelete?.id === club.id) {
              return (
                <DeleteCard
                  key={club.id}
                  item={club}
                  title="Verein"
                  onConfirm={() => deleteClub(club.id)}
                  onCancel={() => setClubToDelete(null)}
                />
              );
            }

            // 2. EDITIER-ZUSTAND: Ersetze die Karte direkt in der Schleife
            if (editingClub?.id === club.id && showForm) {
              return (
                <Card key={club.id} title="Verein bearbeiten" extraClass="card-edit">
                  <ClubForm
                    formData={formData}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingClub(null);
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
                key={club.id}
                title={club.name}
                onEdit={() => {
                  setEditingClub(club);
                  setFormData({ name: club.name });
                  setShowForm(true);
                }}
                onDelete={() => setClubToDelete(club)}
              />
            );
          })}

          {/* Formular für einen GANZ NEUEN Verein (am Ende der Liste) */}
          {showForm && !editingClub ? (
            <Card title="Neuer Verein" extraClass="card-edit">
              <ClubForm
                formData={formData}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                }}
                error={error}
              />
            </Card>
          ) : (
            // Zeige die "Hinzufügen"-Karte nur, wenn wir nicht gerade einen neuen erstellen
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditingClub(null);
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

export default Clubs;