const PositionChips = ({ positions, onRemove }) => {
  if (positions.length === 0) return null;
  return (
    <div className="race-input__positions">
      {positions.map((nr, idx) => (
        <div key={idx} className="race-input__position-chip">
          <span className="race-input__pos-rank">{idx + 1}.</span>
          <span className="race-input__pos-nr">{nr}</span>
          <button className="race-input__pos-remove" onClick={() => onRemove(idx)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default PositionChips;