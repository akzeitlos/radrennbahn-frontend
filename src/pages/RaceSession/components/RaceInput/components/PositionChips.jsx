const PositionChips = ({ positions, onRemove, startRank = 1, isElimination = false }) => {
  if (positions.length === 0) return null;
  return (
    <div className="race-input__positions">
      {positions.map((nr, idx) => (
        <div key={idx} className={`race-input__position-chip${isElimination ? " race-input__position-chip--elim" : ""}`}>
          <span className="race-input__pos-rank">{isElimination ? "OUT" : `${startRank + idx}.`}</span>
          <span className="race-input__pos-nr">{nr}</span>
          {onRemove && <button className="race-input__pos-remove" onClick={() => onRemove(idx)}>×</button>}
        </div>
      ))}
    </div>
  );
};

export default PositionChips;