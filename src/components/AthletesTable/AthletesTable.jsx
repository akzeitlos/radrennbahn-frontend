import { useState } from "react";
import RaceHistoryPanel from "./RaceHistoryPanel.jsx";
import "./AthleteTable.css";

// ---- kleine Hilfsdisplays ----

const GenderBadge = ({ gender }) => {
  if (!gender) return <span className="athlete-table__dash">—</span>;
  const isMale = gender === "m" || gender === "male" || gender === "männlich";
  return (
    <span className={`gender-badge ${isMale ? "gender-badge--m" : "gender-badge--f"}`}>
      {isMale ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="14" r="5" />
            <path d="M18 6l-5.5 5.5M18 6h-4M18 6v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          m
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="9" r="5" />
            <path d="M12 14v6M9 17h6" strokeLinecap="round" />
          </svg>
          w
        </>
      )}
    </span>
  );
};

const RaceClassBadges = ({ raceClasses }) => {
  if (!raceClasses?.length) return <span className="athlete-table__dash">—</span>;
  return (
    <div className="race-class-badges">
      {raceClasses.map((rc) => (
        <span key={rc.id} className="race-class-badge">{rc.title ?? rc.name}</span>
      ))}
    </div>
  );
};

// ---- Sortier-Header ----
const SortableHeader = ({ label, field, sort, onSort }) => {
  const active = sort.field === field;
  const dir = active ? sort.dir : null;
  return (
    <th
      className={`athlete-table__th athlete-table__th--sortable ${active ? "athlete-table__th--active" : ""}`}
      onClick={() => onSort(field)}
    >
      {label}
      <span className="sort-icon">
        {dir === "asc" ? " ▲" : dir === "desc" ? " ▼" : " ⇅"}
      </span>
    </th>
  );
};

// ---- Haupttabelle ----
const AthleteTable = ({
  athletes,
  onEdit,
  onDelete,
  fetchAthleteRaceHistory,
}) => {
  const [sort, setSort] = useState({ field: "lastname", dir: "asc" });
  const [expandedId, setExpandedId] = useState(null);

  const handleSort = (field) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
  };

  const sorted = [...athletes].sort((a, b) => {
    let va, vb;
    switch (sort.field) {
      case "lastname":
        va = `${a.lastname} ${a.firstname}`.toLowerCase();
        vb = `${b.lastname} ${b.firstname}`.toLowerCase();
        break;
      case "raceNumber":
        va = a.raceNumber ?? Infinity;
        vb = b.raceNumber ?? Infinity;
        break;
      case "gender":
        va = a.gender ?? "";
        vb = b.gender ?? "";
        break;
      case "club":
        va = a.club?.name?.toLowerCase() ?? "";
        vb = b.club?.name?.toLowerCase() ?? "";
        break;
      case "raceClasses":
        va = a.raceClasses?.[0]?.title?.toLowerCase() ?? "";
        vb = b.raceClasses?.[0]?.title?.toLowerCase() ?? "";
        break;
      default:
        va = "";
        vb = "";
    }
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  if (!sorted.length) {
    return (
      <div className="athlete-table__empty">
        Keine Athleten gefunden.
      </div>
    );
  }

  return (
    <div className="athlete-table-wrap">
      <table className="athlete-table">
        <thead>
          <tr>
            <SortableHeader label="Name" field="lastname" sort={sort} onSort={handleSort} />
            <SortableHeader label="Nr." field="raceNumber" sort={sort} onSort={handleSort} />
            <SortableHeader label="Geschlecht" field="gender" sort={sort} onSort={handleSort} />
            <SortableHeader label="Verein" field="club" sort={sort} onSort={handleSort} />
            <SortableHeader label="Rennklassen" field="raceClasses" sort={sort} onSort={handleSort} />
            <th className="athlete-table__th athlete-table__th--actions">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((athlete) => {
            const isExpanded = expandedId === athlete.id;
            return (
              <>
                <tr
                  key={athlete.id}
                  className={`athlete-table__row ${isExpanded ? "athlete-table__row--expanded" : ""}`}
                >
                  <td className="athlete-table__td athlete-table__name">
                    <button
                      className="athlete-table__expand-btn"
                      onClick={() => setExpandedId(isExpanded ? null : athlete.id)}
                      title="Rennhistorie"
                    >
                      <span className={`expand-arrow ${isExpanded ? "expand-arrow--open" : ""}`}>▶</span>
                    </button>
                    <span className="athlete-table__fullname">
                      {athlete.lastname}, {athlete.firstname}
                    </span>
                  </td>
                  <td className="athlete-table__td athlete-table__number">
                    {athlete.raceNumber
                      ? <span className="race-number">{athlete.raceNumber}</span>
                      : <span className="athlete-table__dash">—</span>
                    }
                  </td>
                  <td className="athlete-table__td">
                    <GenderBadge gender={athlete.gender} />
                  </td>
                  <td className="athlete-table__td athlete-table__club">
                    {athlete.club?.name ?? <span className="athlete-table__dash">—</span>}
                  </td>
                  <td className="athlete-table__td">
                    <RaceClassBadges raceClasses={athlete.raceClasses} />
                  </td>
                  <td className="athlete-table__td athlete-table__actions">
                    <button
                      className="athlete-table__action-btn athlete-table__action-btn--edit"
                      onClick={() => onEdit(athlete)}
                      title="Bearbeiten"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="athlete-table__action-btn athlete-table__action-btn--delete"
                      onClick={() => onDelete(athlete)}
                      title="Löschen"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 6h10M8 6V4h4v2M7 6l1 10h4l1-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${athlete.id}-history`} className="athlete-table__history-row">
                    <td colSpan={6} className="athlete-table__history-cell">
                      <RaceHistoryPanel
                        athleteId={athlete.id}
                        fetchAthleteRaceHistory={fetchAthleteRaceHistory}
                        autoLoad
                      />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AthleteTable;