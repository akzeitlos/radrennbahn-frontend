import Input from "@/components/FormElements/Input/Input.jsx";
import Textarea from "@/components/FormElements/Textarea/Textarea.jsx";
import FormActions from "@/components/FormActions/FormActions.jsx";

const RoleForm = ({ formData, onChange, onSubmit, onCancel, error }) => (
  <form className="form" onSubmit={onSubmit}>
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
    <FormActions onCancel={onCancel} error={error} />
  </form>
);

export default RoleForm;
