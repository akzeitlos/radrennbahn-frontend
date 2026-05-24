import Button from "@/components/Button/Button.jsx";
import Input from "@/components/FormElements/Input/Input.jsx";
import Chevron from "@/assets/icons/chevron.svg?react";

const LapPanel = ({ inputRef, lapTarget, setLapTarget, onLap }) => (
  <div className="race-input__panel">
    <p className="race-input__hint">
      Startnummer des überrundenden / überrundeten Fahrers eingeben.
    </p>
    <div className="race-input__entry-row">
      <Input
        ref={inputRef}
        name="lapTarget"
        type="number"
        placeholder="Startnummer"
        value={lapTarget}
        onChange={(e) => setLapTarget(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onLap("lapup"); }}
      />
      <Button style="success" onClick={() => onLap("lapup")} square>
        <Chevron className="icon icon-up" />
      </Button>
      <Button style="danger" onClick={() => onLap("lapdown")} square>
        <Chevron className="icon icon-down" />
      </Button>
    </div>
  </div>
);

export default LapPanel;