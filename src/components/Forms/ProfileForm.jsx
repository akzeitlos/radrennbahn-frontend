import Input from "@/components/FormElements/Input/Input.jsx";
import Button from "@/components/Button/Button.jsx";

const ProfileForm = ({ formData, onChange, onSubmit, error, isSuccess }) => (
  <form className="form" onSubmit={onSubmit}>
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
      name="username"
      label="Benutzername"
      type="text"
      value={formData.username}
      onChange={onChange}
      required
    />
    <Input
      name="password"
      label="Neues Passwort"
      type="password"
      value={formData.password}
      onChange={onChange}
      placeholder="Leer lassen, wenn unverändert"
    />
    <div className="button-wrapper">
      <Button type="submit" style={isSuccess ? "success" : "primary"}>
        {isSuccess ? "Profil erfolgreich gespeichert" : "Speichern"}
      </Button>
    </div>
    {error && <p className="error-message">{error}</p>}
  </form>
);

export default ProfileForm;
