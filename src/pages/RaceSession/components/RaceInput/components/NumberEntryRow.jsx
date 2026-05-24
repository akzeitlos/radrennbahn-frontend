import Button from "@/components/Button/Button.jsx";
import Input from "@/components/FormElements/Input/Input.jsx";
import Add from "@/assets/icons/add.svg?react";


const NumberEntryRow = ({ inputRef, value, onChange, onAdd, onKeyDown }) => (
  <div className="race-input__entry-row">
    <Input
      ref={inputRef}
      name="numberInput"
      type="number"
      placeholder="Startnummer"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
    <Button style="primary" onClick={onAdd} square><Add></Add></Button>
  </div>
);

export default NumberEntryRow;