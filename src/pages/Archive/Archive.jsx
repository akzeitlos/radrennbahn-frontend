import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/Card/Card.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import Modal from "@/components/Modal/Modal.jsx";
import useRaces from "@/hooks/useRaces.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import "./Archive.css";

const Archive = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { races, isLoading, deleteRace } = useRaces(token);
  const [deleteId, setDeleteId] = useState(null);

  const today = new Date().toISOString().slice(0, 10);
  const pastRaces = [...races]
    .filter((r) => r.date && r.date < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <h1>Renn-Archiv</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : pastRaces.length === 0 ? (
        <p>Noch keine archivierten Rennen.</p>
      ) : (
        <div className="card-container">
          {pastRaces.map((race) => {
            const [year, month, day] = (race.date || "").split("-");
            const formattedDate = race.date ? `${day}.${month}.${year}` : "-";
            const raceClassNames = race.raceClasses?.map((rc) => rc.name).join(", ") || "";
            return (
              <Card
                key={race.id}
                title={`${formattedDate}${raceClassNames ? ` · ${raceClassNames}` : ""}`}
                subtitle={race.raceMode?.title || "-"}
                onPlay={() => navigate(`/races/${race.id}/session`)}
                onDelete={() => setDeleteId(race.id)}
                isCompleted={race.isCompleted}
              />
            );
          })}
        </div>
      )}

      {deleteId && (
        <Modal
          title="Rennen löschen"
          message="Das Rennen wird unwiderruflich gelöscht. Fortfahren?"
          confirmLabel="Löschen"
          cancelLabel="Abbrechen"
          danger
          onConfirm={async () => { await deleteRace(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
};

export default Archive;
