import { useState, useContext, useMemo } from "react";
import Modal from "@/components/Modal/Modal.jsx";
import Card from "@/components/Card/Card.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import AthleteForm from "@/components/Forms/AthleteForm.jsx";
import AthletesFilerBar from "@/components/AthletesFilterBar/AthletesFilterBar.jsx";
import AthletesTable from "@/components/AthletesTable/AthletesTable.jsx";

import useAthletes from "@/hooks/useAthletes.jsx";
import useClubs from "@/hooks/useClubs.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";

import { AuthContext } from "@/context/AuthContext.jsx";
import Add from "@/assets/icons/add.svg?react";

import "./Athletes.css";

// ---- Filterfunktion ----
const applyFilters = (athletes, filters) => {
  return athletes.filter((a) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const fullName = `${a.firstname} ${a.lastname}`.toLowerCase();
      const raceNum = String(a.raceNumber ?? "");
      if (!fullName.includes(q) && !raceNum.includes(q)) return false;
    }
    if (filters.gender) {
      const g = (a.gender ?? "").toLowerCase();
      const isMale = g === "m" || g === "male" || g === "männlich";
      const isFemale = g === "f" || g === "female" || g === "weiblich" || g === "w";
      if (filters.gender === "m" && !isMale) return false;
      if (filters.gender === "f" && !isFemale) return false;
    }
    if (filters.raceClassIds.length > 0) {
      const athleteClassIds = a.raceClasses?.map((rc) => rc.id) ?? [];
      const hasMatch = filters.raceClassIds.some((id) => athleteClassIds.includes(id));
      if (!hasMatch) return false;
    }
    return true;
  });
};

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

  const [filters, setFilters] = useState({ search: "", gender: "", raceClassIds: [] });

  const emptyForm = { firstname: "", lastname: "", raceNumber: "", gender: "", clubId: "", raceClasses: [] };
  const [formData, setFormData] = useState(emptyForm);

  const filteredAthletes = useMemo(() => applyFilters(athletes, filters), [athletes, filters]);

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
    const result = editingAthlete
      ? await updateAthlete(editingAthlete.id, payload)
      : await createAthlete(payload);
    if (result.success) {
      setShowForm(false);
      setEditingAthlete(null);
      setFormData(emptyForm);
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

  const confirmDelete = async (id) => {
    const result = await deleteAthlete(id);
    if (result.success) setAthleteToDelete(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAthlete(null);
    setFormData(emptyForm);
  };

  return (
    <>
      <div className="athletes-header">
        <h1>Athleten</h1>
        <button
          className="athletes-header__add-btn"
          onClick={() => {
            setEditingAthlete(null);
            setFormData(emptyForm);
            setShowForm(true);
          }}
        >
          <Add className="icon" />
          Neuer Athlet
        </button>
      </div>

      <AthletesFilerBar
        filters={filters}
        onChange={setFilters}
        raceClasses={raceClasses}
        totalCount={athletes.length}
        filteredCount={filteredAthletes.length}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AthletesTable
          athletes={filteredAthletes}
          onEdit={handleEdit}
          onDelete={(athlete) => setAthleteToDelete(athlete)}
          fetchAthleteRaceHistory={fetchAthleteRaceHistory}
        />
      )}

      {/* Löschen-Bestätigung */}
      {athleteToDelete && (
        <Modal
          title="Athlet löschen"
          message={`Möchtest du den Athleten ${athleteToDelete.firstname} ${athleteToDelete.lastname} wirklich löschen?`}
          confirmLabel="Löschen"
          cancelLabel="Abbrechen"
          danger
          onConfirm={() => confirmDelete(athleteToDelete.id)}
          onCancel={() => setAthleteToDelete(null)}
        />
      )}

      {/* Formular-Modal */}
      {showForm && (
        <div className="athletes-modal-overlay" onClick={closeForm}>
          <div className="athletes-modal" onClick={(e) => e.stopPropagation()}>
            <Card title={editingAthlete ? "Athlet bearbeiten" : "Neuer Athlet"}>
              <AthleteForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={closeForm}
                clubs={clubs}
                raceClasses={raceClasses}
                error={error}
              />
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default Athletes;