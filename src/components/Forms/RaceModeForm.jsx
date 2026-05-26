import Input from "@/components/FormElements/Input/Input.jsx";
import FormActions from "@/components/FormActions/FormActions.jsx";
import { toSlug } from "@/utils/stringUtils.js";

const RaceModeForm = ({ formData, onChange, onSubmit, onCancel, error }) => {

  const handleTitleChange = (e) => {
    const title = e.target.value;
    onChange({ target: { name: "title", value: title } });
    onChange({ target: { name: "slug", value: toSlug(title) } });
  };

  const handleSlugChange = (e) => {
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onChange({ target: { name: "slug", value: clean } });
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <Input
        name="title"
        label="Titel"
        type="text"
        value={formData.title}
        onChange={handleTitleChange}
        required
      />
      <Input
        name="slug"
        label="Slug (z.B. punkterennen)"
        type="text"
        value={formData.slug}
        onChange={handleSlugChange}
        required
      />
      <Input
        name="description"
        label="Beschreibung"
        type="text"
        value={formData.description}
        onChange={onChange}
      />
      <FormActions onCancel={onCancel} error={error} />
    </form>
  );
};

export default RaceModeForm;
