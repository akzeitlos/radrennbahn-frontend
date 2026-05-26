import Input from "@/components/FormElements/Input/Input.jsx";
import FormActions from "@/components/FormActions/FormActions.jsx";

const ClubForm = ({ formData, onChange, onSubmit, onCancel, error }) => (
  <form className="form" onSubmit={onSubmit}>
    <Input
      name="name"
      label="Vereinsname"
      type="text"
      value={formData.name}
      onChange={onChange}
      required
    />
    <FormActions onCancel={onCancel} error={error} />
  </form>
);

export default ClubForm;
