import { useState } from "react";
import RaceHistoryPanel from "@/components/RaceHistoryPanel/RaceHistoryPanel.jsx";
import Edit from "@/assets/icons/edit.svg?react";
import Delete from "@/assets/icons/delete.svg?react";
import Male from "@/assets/icons/male.svg?react";
import Female from "@/assets/icons/female.svg?react";
import Chevron from "@/assets/icons/chevron.svg?react";
import "./AthletesTable.css";

const GenderBadge = ({ gender }) => {
  if (!gender) return <span className="athlete-table__dash">—</span>;
  const isMale = gender === "m" || gender === "male" || gender === "männlich";
  return (
    <span className={`gender-badge ${isMale ? "gender-badge--m" : "gender-badge--f"}`}>
      {isMale ? <><Male className="icon" /> m</> : <><Female className="icon" /> w</>}
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

const SortableHeader = ({ label, field, sort, onSort }) => {
  const active = sort.field === field;
  const dir = active ? sort.dir : null;
  return (
    <th
      className={`athlete-table__th athlete-table__th--sortable ${active ? "athlete-table__th--active" : ""}`}
      onClick={() => onSort(field)}
    >
      {label}
      <span className="sort-icon">{dir === "asc" ? " ▲" : dir === "desc" ? " ▼" : " ⇅"}</span>
    </th>
  );
};

const AthletesTable = ({ athletes, onEdit, onDelete, fetchAthleteRaceHistory }) => {
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
        va = ""; vb = "";
    }
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  if (!sorted.length) {
    return <div className="athlete-table__empty">Keine Athleten gefunden.</div>;
  }

  return (
    <div className="athlete-table-wrap">
      <div className="athlete-table-scroll">
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

              const actionBtns = (
                <>
                  <button
                    className="athlete-table__action-btn athlete-table__action-btn--edit"
                    onClick={() => onEdit(athlete)}
                    title="Bearbeiten"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    className="athlete-table__action-btn athlete-table__action-btn--delete"
                    onClick={() => onDelete(athlete)}
                    title="Löschen"
                  >
                    <Delete className="icon" />
                  </button>
                </>
              );

              return (
                <>
                  <tr
                    key={athlete.id}
                    className={`athlete-table__row ${isExpanded ? "athlete-table__row--expanded" : ""}`}
                  >
                    {/* Spalte 1: Name + inline-Aktionen (Mobile) */}
                    <td className="athlete-table__td athlete-table__name">
                      <div className="athlete-table__name-inner">
                        <button
                          className="athlete-table__expand-btn"
                          onClick={() => setExpandedId(isExpanded ? null : athlete.id)}
                          title="Rennhistorie anzeigen"
                        >
                          <Chevron className={`icon expand-arrow ${isExpanded ? "expand-arrow--open" : ""}`} />
                        </button>
                        <span className="athlete-table__fullname">
                          {athlete.lastname}, {athlete.firstname}
                        </span>
                        {/* Nur auf Mobile sichtbar */}
                        <span className="athlete-table__actions-inline">{actionBtns}</span>
                      </div>
                    </td>

                    {/* Spalte 2–5: auf Mobile in .athlete-table__mobile-meta gebündelt */}
                    <td className="athlete-table__td athlete-table__meta-cell" colSpan={1}>
                      {/* Desktop: normale Zellen-Inhalte */}
                      <span className="athlete-table__desktop-cell">
                        {athlete.raceNumber
                          ? <span className="race-number">{athlete.raceNumber}</span>
                          : <span className="athlete-table__dash">—</span>}
                      </span>
                      {/* Mobile: alle Meta-Infos zusammen — wird auf Desktop ausgeblendet */}
                      <div className="athlete-table__mobile-meta">
                        <div className="athlete-table__mobile-row">
                          {athlete.raceNumber && <span className="race-number">{athlete.raceNumber}</span>}
                          <GenderBadge gender={athlete.gender} />
                          <RaceClassBadges raceClasses={athlete.raceClasses} />
                        </div>
                        {athlete.club?.name && <span className="athlete-table__mobile-club">{athlete.club.name}</span>}
                      </div>
                    </td>

                    <td className="athlete-table__td athlete-table__desktop-only">
                      <GenderBadge gender={athlete.gender} />
                    </td>

                    <td className="athlete-table__td athlete-table__desktop-only athlete-table__club">
                      {athlete.club?.name ?? <span className="athlete-table__dash">—</span>}
                    </td>

                    <td className="athlete-table__td athlete-table__desktop-only">
                      <RaceClassBadges raceClasses={athlete.raceClasses} />
                    </td>

                    {/* Aktionen Desktop */}
                    <td className="athlete-table__td athlete-table__actions athlete-table__desktop-only">
                      {actionBtns}
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
    </div>
  );
};

export default AthletesTable;