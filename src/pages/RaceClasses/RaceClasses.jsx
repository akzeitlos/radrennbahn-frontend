import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import RaceClassForm from "@/components/Forms/RaceClassForm.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import "./RaceClasses.css";

const emptyForm = { name: "", slug: "", description: "" };

const RaceClasses = () => {
  const { token } = useContext(AuthContext);
  const { raceClasses, createRaceClass, updateRaceClass, deleteRaceClass, isLoading, error } =
    useRaceClasses(token);

  const [toDelete, setToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editing
      ? await updateRaceClass(editing.id, formData)
      : await createRaceClass(formData);
    if (result.success) {
      setShowForm(false);
      setEditing(null);
      setFormData(emptyForm);
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

            // 2. EDITIER-ZUSTAND
            if (editing?.id === rc.id && showForm) {
              return (
                <Card key={rc.id} title="Rennklasse bearbeiten" extraClass="card-edit">
                  <RaceClassForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditing(null);
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
                key={rc.id}
                title={rc.name}
                subtitle={rc.slug}
                onEdit={() => {
                  setEditing(rc);
                  setFormData({
                    name: rc.name || "",
                    slug: rc.slug || "",
                    description: rc.description || "",
                  });
                  setShowForm(true);
                }}
                onDelete={() => setToDelete(rc)}
              />
            );
          })}

          {showForm && !editing ? (
            <Card title="Neue Rennklasse" extraClass="card-edit">
              <RaceClassForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setFormData(emptyForm);
                }}
                error={error}
              />
            </Card>
          ) : (
            !showForm && (
              <AddCard
                onClick={() => {
                  setEditing(null);
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

export default RaceClasses;