import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Umlaute auflösen: ä→a, ö→o etc.
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const RaceModeForm = ({ formData, onChange, onSubmit, onCancel, error }) => {

  const handleTitleChange = (e) => {
    const title = e.target.value;
    onChange({ target: { name: "title", value: title } });
    // Slug nur auto-generieren wenn noch leer oder bisher auto-generiert
    onChange({ target: { name: "slug", value: toSlug(title) } });
  };

  const handleSlugChange = (e) => {
    // Slug manuell überschreiben — direkt nur erlaubte Zeichen zulassen
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

      <Button type="submit" style="primary">
        Speichern
      </Button>
      <Button type="button" style="secondary" onClick={onCancel}>
        Abbrechen
      </Button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default RaceModeForm;