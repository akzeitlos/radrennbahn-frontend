import Input from "@/components/FormElements/Input/Input.jsx";
import MultiSelect from "@/components/FormElements/MultiSelect/MultiSelect.jsx";
import Button from "@/components/Button/Button.jsx";

const UserForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  roles,
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
    <form className="form" onSubmit={onSubmit}>
      <Input
        name="email"
        label="E-Mail"
        type="email"
        value={formData.email}
        onChange={onChange}
        required
      />

      <Input
        name="username"
        label="Benutzername"
        type="text"
        value={formData.username}
        onChange={onChange}
        required
      />

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
        name="password"
        label="Passwort"
        type="password"
        value={formData.password}
        onChange={onChange}
      />

      <MultiSelect
        label="Rollen"
        name="roles"
        value={formData.roles}
        onChange={onChange}
        options={roles.map((role) => ({
          value: role.id,
          label: role.name,
        }))}
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

export default UserForm;