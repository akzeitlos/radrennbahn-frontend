import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

const UserForm = ({ formData, onChange, onSubmit, onCancel, roles, error }) => {
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

      {/* Multi-select for Roles */}
      <label htmlFor="roles">Rollen</label>
      <select
        name="roles"
        id="roles"
        multiple
        value={formData.roles}
        onChange={(e) => {
          const selectedRoles = Array.from(e.target.selectedOptions).map(
            (opt) => opt.value,
          );
          onChange({
            target: {
              name: "roles",
              value: selectedRoles,
            },
          });
        }}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

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
