import { useState, useContext, useMemo } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import AthleteForm from "@/components/Forms/AthleteForm.jsx";
import AthleteFilterBar from "@/components/AthleteFilterBar/AthleteFilterBar.jsx";
import AthleteTable from "@/components/AthleteTable/AthleteTable.jsx";

import useAthletes from "@/hooks/useAthletes.jsx";
import useClubs from "@/hooks/useClubs.jsx";
import useRaceClasses from "@/hooks/useRaceClasses.jsx";

import { AuthContext } from "@/context/AuthContext.jsx";

import "./Athletes.css";

// ---- Filterfunktion ----
const applyFilters = (athletes, filters) => {
  return athletes.filter((a) => {
    // Textsuche: Name oder Startnummer
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const fullName = `${a.firstname} ${a.lastname}`.toLowerCase();
      const raceNum = String(a.raceNumber ?? "");
      if (!fullName.includes(q) && !raceNum.includes(q)) return false;
    }

    // Geschlecht
    if (filters.gender) {
      const g = (a.gender ?? "").toLowerCase();
      const isMale = g === "m" || g === "male" || g === "männlich";
      const isFemale = g === "f" || g === "female" || g === "weiblich" || g === "w";
      if (filters.gender === "m" && !isMale) return false;
      if (filters.gender === "f" && !isFemale) return false;
    }

    // Rennklassen (mind. eine muss passen)
    if (filters.raceClassIds.length > 0) {
      const athleteClassIds = a.raceClasses?.map((rc) => rc.id) ?? [];
      const hasMatch = filters.raceClassIds.some((id) => athleteClassIds.includes(id));
      if (!hasMatch) return false;
    }

    return true;
  });
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

  const [filters, setFilters] = useState({
    search: "",
    gender: "",
    raceClassIds: [],
  });

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    raceNumber: "",
    gender: "",
    clubId: "",
    raceClasses: [],
  });
  const emptyForm = { firstname: "", lastname: "", raceNumber: "", gender: "", clubId: "", raceClasses: [] };

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

  const handleDelete = (athlete) => setAthleteToDelete(athlete);

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
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 4v12M4 10h12" strokeLinecap="round" />
          </svg>
          Neuer Athlet
        </button>
      </div>

      <AthleteFilterBar
        filters={filters}
        onChange={setFilters}
        raceClasses={raceClasses}
        totalCount={athletes.length}
        filteredCount={filteredAthletes.length}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AthleteTable
          athletes={filteredAthletes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          fetchAthleteRaceHistory={fetchAthleteRaceHistory}
        />
      )}

      {/* Delete Modal */}
      {athleteToDelete && (
        <div className="athletes-modal-overlay" onClick={() => setAthleteToDelete(null)}>
          <div className="athletes-modal" onClick={(e) => e.stopPropagation()}>
            <DeleteCard
              item={athleteToDelete}
              title="Athlet"
              onConfirm={confirmDelete}
              onCancel={() => setAthleteToDelete(null)}
            />
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {showForm && (
        <div className="athletes-modal-overlay" onClick={closeForm}>
          <div className="athletes-modal athletes-modal--form" onClick={(e) => e.stopPropagation()}>
            <Card
              title={editingAthlete ? "Athlet bearbeiten" : "Neuer Athlet"}
              extraClass="card-edit"
            >
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