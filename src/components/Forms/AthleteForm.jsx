import Input from "@/components/FormElements/Input/Input.jsx";
import Select from "@/components/FormElements/Select/Select.jsx";
import MultiSelect from "@/components/FormElements/MultiSelect/MultiSelect.jsx";
import Button from "@/components/Button/Button.jsx";

const AthleteForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  clubs,
  raceClasses,
  error,
}) => {
  const handleMultiChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value),
    );

    onChange({
      target: {
        name: e.target.name,
        value: values,
      },
    });
  };
  return (
    <form className="form athlete-form" onSubmit={onSubmit}>
      <Input
        name="firstname"
        label="Vorname"
        type="text"
        value={formData.firstname}
        onChange={onChange}
        required
      />

      <Input
        name="lastname"
        label="Nachname"
        type="text"
        value={formData.lastname}
        onChange={onChange}
        required
      />

      <Input
        name="raceNumber"
        label="Startnummer"
        type="text"
        value={formData.raceNumber}
        onChange={onChange}
        placeholder=" "
      />

      {/* GENDER */}
      <Select
        label="Geschlecht"
        name="gender"
        value={formData.gender}
        onChange={onChange}
        options={[
          { value: "male", label: "Männlich" },
          { value: "female", label: "Weiblich" },
        ]}
      />

      {/* ========================= */}
      {/* CLUB (ONE TO MANY) */}
      {/* ========================= */}
      <Select
        label="Verein"
        name="clubId"
        value={formData.clubId}
        onChange={onChange}
        options={clubs.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
      />

      {/* ========================= */}
      {/* RACE CLASSES (MANY TO MANY) */}
      {/* ========================= */}
      <MultiSelect
        label="Rennklassen"
        name="raceClasses"
        value={formData.raceClasses}
        onChange={onChange}
        options={raceClasses.map((rc) => ({
          value: rc.id,
          label: rc.name,
        }))}
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

export default AthleteForm;
