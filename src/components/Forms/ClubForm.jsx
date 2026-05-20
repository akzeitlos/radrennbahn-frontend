import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

const ClubForm = ({ formData, onChange, onSubmit, onCancel, error }) => {
  return (
    <form className="form" onSubmit={onSubmit}>

      <Input
        name="name"
        label="Vereinsname"
        type="text"
        value={formData.name}
        onChange={onChange}
        required
      />

      <div className="button-wrapper">
        <Button type="submit" style="primary">
          Speichern
        </Button>
        <Button type="button" style="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default ClubForm;