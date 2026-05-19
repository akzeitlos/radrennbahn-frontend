import Input from "@/components/FormElements/Input/Input.jsx";
import Textarea from "@/components/FormElements/Textarea/Textarea.jsx";
import Button from "@/components/Button/Button.jsx";

const RoleForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  error,
}) => {
  return (
    <form className="create-role-form" onSubmit={onSubmit}>
      <Input
        name="name"
        type="text"
        label="Name der Rolle"
        value={formData.name}
        onChange={onChange}
        required
      />
      <Textarea
        name="description"
        label="Beschreibung"
        value={formData.description}
        onChange={onChange}
        placeholder="Beschreibung der Rolle"
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

export default RoleForm;
