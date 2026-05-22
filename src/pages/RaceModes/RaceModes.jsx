import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import RaceModeForm from "@/components/Forms/RaceModeForm.jsx";
import useRaceModes from "@/hooks/useRaceModes.jsx";

import { AuthContext } from "@/context/AuthContext.jsx";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
};

const RaceModes = () => {
  const { token } = useContext(AuthContext);

  const { raceModes, createRaceMode, updateRaceMode, deleteRaceMode, isLoading, error } =
    useRaceModes(token);

  const [raceModeToDelete, setRaceModeToDelete] = useState(null);
  const [editingRaceMode, setEditingRaceMode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (editingRaceMode) {
      result = await updateRaceMode(editingRaceMode.id, formData);
    } else {
      result = await createRaceMode(formData);
    }

    if (result.success) {
      setShowForm(false);
      setEditingRaceMode(null);
      setFormData(emptyForm);
    }
  };

  const handleEdit = (raceMode) => {
    setEditingRaceMode(raceMode);
    setFormData({
      title: raceMode.title || "",
      slug: raceMode.slug || "",
      description: raceMode.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = (raceMode) => setRaceModeToDelete(raceMode);

  const confirmDelete = async (id) => {
    const result = await deleteRaceMode(id);
    if (result.success) setRaceModeToDelete(null);
  };

  return (
    <>
      <h1>Rennmodi</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {raceModes.map((raceMode) => {
            // 1. LÖSCH-ZUSTAND
            if (raceModeToDelete?.id === raceMode.id) {
              return (
                <DeleteCard
                  key={raceMode.id}
                  item={raceMode}
                  title="Rennmodus"
                  onConfirm={confirmDelete}
                  onCancel={() => setRaceModeToDelete(null)}
                />
              );
            }

            // 2. EDITIER-ZUSTAND
            if (editingRaceMode?.id === raceMode.id && showForm) {
              return (
                <Card key={raceMode.id} title="Rennmodus bearbeiten" extraClass="card-edit">
                  <RaceModeForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingRaceMode(null);
                      setFormData(emptyForm);
                    }}
                    error={error}
                  />
                </Card>
              );
            }

            // 3. NORMALER ZUSTAND
            return (
              <Card
                key={raceMode.id}
                title={raceMode.title}
                subtitle={raceMode.description || ""}
                onEdit={() => handleEdit(raceMode)}
                onDelete={() => handleDelete(raceMode)}
              />
            );
          })}

          {showForm && !editingRaceMode ? (
            <Card title="Neuer Rennmodus" extraClass="card-edit">
              <RaceModeForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                error={error}
              />
            </Card>
          ) : (
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditingRaceMode(null);
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

export default RaceModes;