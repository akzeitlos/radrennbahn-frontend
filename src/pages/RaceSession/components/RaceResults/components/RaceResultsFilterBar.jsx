import Button from "@/components/Button/Button.jsx";
import ChipSelect from "@/components/FormElements/ChipSelect/ChipSelect.jsx";
import Male from "@/assets/icons/male.svg?react";
import Female from "@/assets/icons/female.svg?react";
import "./RaceResultsFilterBar.css";

const RaceResultsFilterBar = ({
  filters,
  onChange,
  raceClasses,
}) => {
  const handleGender = (val) =>
    onChange({ ...filters, gender: filters.gender === val ? "" : val });

  return (
    <div className="rr-filter-bar">
      <div className="rr-filter-bar__top">
        <div className="rr-filter-bar__gender-group">
          <Button
            style={filters.gender === "m" ? "male" : "secondary"}
            extraClassName="secondary-male"
            onClick={() => handleGender("m")}
          >
            <Male className="icon" /> Männlich
          </Button>
          <Button
            style={filters.gender === "f" ? "female" : "secondary"}
            extraClassName="secondary-female"
            onClick={() => handleGender("f")}
          >
            <Female className="icon" /> Weiblich
          </Button>
        </div>
      </div>

      {raceClasses?.length > 0 && (
        <div className="rr-filter-bar__classes">
          <span className="rr-filter-bar__classes-label">Rennklassen:</span>
          <ChipSelect
            name="raceClassIds"
            value={filters.raceClassIds}
            options={[...raceClasses]
              .sort((a, b) => (a.name ?? a.title).localeCompare(b.name ?? b.title))
              .map((rc) => ({ value: rc.id, label: rc.name ?? rc.title }))}
            onChange={(e) => onChange({ ...filters, raceClassIds: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default RaceResultsFilterBar;
