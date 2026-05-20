import Input from "@/components/FormElements/Input/Input.jsx";
import Textarea from "@/components/FormElements/Textarea/Textarea.jsx";
import Button from "@/components/Button/Button.jsx";

const RaceClassForm = ({ formData, onChange, onSubmit, onCancel, error }) => {
  return (
    <form className="form" onSubmit={onSubmit}>

      <Input
        name="name"
        label="Name"
        type="text"
        value={formData.name}
        onChange={onChange}
        required
      />

      <Textarea
        name="description"
        label="Beschreibung"
        value={formData.description}
        onChange={onChange}
        placeholder="Beschreibung der Rennklasse"
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

export default RaceClassForm;