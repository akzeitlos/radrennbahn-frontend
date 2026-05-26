import Input from "@/components/FormElements/Input/Input.jsx";
import Textarea from "@/components/FormElements/Textarea/Textarea.jsx";
import FormActions from "@/components/FormActions/FormActions.jsx";
import { toSlug } from "@/utils/stringUtils.js";

const RaceClassForm = ({ formData, onChange, onSubmit, onCancel, error }) => {

  const handleNameChange = (e) => {
    const name = e.target.value;
    onChange({ target: { name: "name", value: name } });
    onChange({ target: { name: "slug", value: toSlug(name) } });
  };

  const handleSlugChange = (e) => {
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onChange({ target: { name: "slug", value: clean } });
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <Input
        name="name"
        label="Name"
        type="text"
        value={formData.name}
        onChange={handleNameChange}
        required
      />
      <Input
        name="slug"
        label="Slug (Kurzname)"
        type="text"
        value={formData.slug}
        onChange={handleSlugChange}
        required
      />
      <Textarea
        name="description"
        label="Beschreibung"
        value={formData.description}
        onChange={onChange}
        placeholder="Beschreibung der Rennklasse"
      />
      <FormActions onCancel={onCancel} error={error} />
    </form>
  );
};

export default RaceClassForm;
