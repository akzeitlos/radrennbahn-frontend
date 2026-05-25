import Button from "@/components/Button/Button.jsx";
import Input from "@/components/FormElements/Input/Input.jsx";
import ChipSelect from "@/components/FormElements/ChipSelect/ChipSelect.jsx";
import Male from "@/assets/icons/male.svg?react";
import Female from "@/assets/icons/female.svg?react";
import "./AthletesFilterBar.css";

const AthletesFilerBar = ({
  filters,
  onChange,
  raceClasses,
  totalCount,
  filteredCount,
}) => {
  const handleSearch = (e) => onChange({ ...filters, search: e.target.value });
  const handleGender = (val) =>
    onChange({ ...filters, gender: filters.gender === val ? "" : val });
  const handleRaceClass = (id) => {
    const current = filters.raceClassIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onChange({ ...filters, raceClassIds: next });
  };
  const handleReset = () =>
    onChange({ search: "", gender: "", raceClassIds: [] });

  const isActive =
    filters.search || filters.gender || filters.raceClassIds.length > 0;

  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        {/* Suche */}
        <div className="filter-bar__search-wrap">
          <Input
            name="search"
            placeholder="Name oder Startnummer suchen …"
            value={filters.search}
            onChange={handleSearch}
          />
          {filters.search && (
            <button
              className="filter-bar__clear-input"
              onClick={() => onChange({ ...filters, search: "" })}
            >
              ×
            </button>
          )}
        </div>

        {/* Geschlecht */}
        <div className="filter-bar__gender-group">
          <Button
            style={filters.gender === "m" ? "male" : "secondary"}
            extraClassName="secondary-male"
            onClick={() => handleGender("m")}
          >
            <Male className="icon"/> Männlich
          </Button>
          <Button
            style={filters.gender === "f" ? "female" : "secondary"}
            onClick={() => handleGender("f")}
            extraClassName="secondary-female"
          >
            <Female className="icon" /> Weiblich
          </Button>
        </div>
      </div>

      {/* Rennklassen */}
      {raceClasses?.length > 0 && (
        <div className="filter-bar__classes">
          <span className="filter-bar__classes-label">Rennklassen:</span>
          <ChipSelect
            name="raceClassIds"
            value={filters.raceClassIds}
            options={[...raceClasses]
              .sort((a, b) =>
                (a.name ?? a.title).localeCompare(b.name ?? b.title),
              )
              .map((rc) => ({ value: rc.id, label: rc.name ?? rc.title }))}
            onChange={(e) =>
              onChange({ ...filters, raceClassIds: e.target.value })
            }
          />
        </div>
      )}

      {/* Meta */}
      <div className="filter-bar__meta">
        <span className="filter-bar__count">
          {filteredCount} von {totalCount} Athleten
        </span>
        {isActive && (
          <Button style="secondary" small onClick={handleReset}>
            Filter zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
};

export default AthletesFilerBar;
