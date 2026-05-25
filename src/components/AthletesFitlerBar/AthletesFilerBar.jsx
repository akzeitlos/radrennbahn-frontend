import "./AthleteFilterBar.css";

const AthleteFilterBar = ({ filters, onChange, raceClasses, totalCount, filteredCount }) => {
  const handleSearch = (e) => onChange({ ...filters, search: e.target.value });
  const handleGender = (val) => onChange({ ...filters, gender: filters.gender === val ? "" : val });
  const handleRaceClass = (id) => {
    const current = filters.raceClassIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChange({ ...filters, raceClassIds: next });
  };
  const handleReset = () => onChange({ search: "", gender: "", raceClassIds: [] });

  const isActive = filters.search || filters.gender || filters.raceClassIds.length > 0;

  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        <div className="filter-bar__search-wrap">
          <svg className="filter-bar__search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
            <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            className="filter-bar__search"
            type="text"
            placeholder="Name oder Startnummer suchen …"
            value={filters.search}
            onChange={handleSearch}
          />
          {filters.search && (
            <button className="filter-bar__clear-input" onClick={() => onChange({ ...filters, search: "" })}>×</button>
          )}
        </div>

        <div className="filter-bar__gender-group">
          <button
            className={`filter-bar__gender-btn filter-bar__gender-btn--m ${filters.gender === "m" ? "active" : ""}`}
            onClick={() => handleGender("m")}
            title="Männlich"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="14" r="5" />
              <path d="M18 6l-5.5 5.5M18 6h-4M18 6v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Männlich
          </button>
          <button
            className={`filter-bar__gender-btn filter-bar__gender-btn--f ${filters.gender === "f" ? "active" : ""}`}
            onClick={() => handleGender("f")}
            title="Weiblich"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="9" r="5" />
              <path d="M12 14v6M9 17h6" strokeLinecap="round" />
            </svg>
            Weiblich
          </button>
        </div>
      </div>

      {raceClasses?.length > 0 && (
        <div className="filter-bar__classes">
          <span className="filter-bar__classes-label">Rennklassen:</span>
          <div className="filter-bar__class-chips">
            {raceClasses.map((rc) => (
              <button
                key={rc.id}
                className={`filter-bar__chip ${filters.raceClassIds.includes(rc.id) ? "active" : ""}`}
                onClick={() => handleRaceClass(rc.id)}
              >
                {rc.title ?? rc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-bar__meta">
        <span className="filter-bar__count">
          {filteredCount} von {totalCount} Athleten
        </span>
        {isActive && (
          <button className="filter-bar__reset" onClick={handleReset}>
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
};

export default AthleteFilterBar;