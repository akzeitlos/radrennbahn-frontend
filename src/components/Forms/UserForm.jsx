import Input from "@/components/FormElements/Input/Input.jsx";
import MultiSelect from "@/components/FormElements/MultiSelect/MultiSelect.jsx";
import FormActions from "@/components/FormActions/FormActions.jsx";

const UserForm = ({ formData, onChange, onSubmit, onCancel, roles, error }) => (
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
      options={roles.map((role) => ({ value: role.id, label: role.name }))}
    />
    <FormActions onCancel={onCancel} error={error} />
  </form>
);

export default UserForm;
