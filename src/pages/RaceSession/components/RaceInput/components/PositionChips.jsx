const PositionChips = ({ positions, onRemove, startRank = 1 }) => {
  if (positions.length === 0) return null;
  return (
    <div className="race-input__positions">
      {positions.map((nr, idx) => (
        <div key={idx} className="race-input__position-chip">
          <span className="race-input__pos-rank">{startRank + idx}.</span>
          <span className="race-input__pos-nr">{nr}</span>
          <button className="race-input__pos-remove" onClick={() => onRemove(idx)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default PositionChips;