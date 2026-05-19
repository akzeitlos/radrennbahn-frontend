import { useState } from "react";
import Card from "@/components/Card/Card.jsx";
import UserForm from "@/components/Forms/UserForm.jsx";
import useUsers from "@/hooks/useUsers.jsx";

const UserEditCard = ({
  user,
  token,
  updateUser,
  onCancel,
  onSave,
  roles,
  error,
}) => {
  const { fetchUsers } = useUsers(token); // fetchUsers aus Hook holen

  // Initialisierung: roles als Strings im formData
  const [formData, setFormData] = useState({
    ...user,
    password: "",
    roles: user.roles?.map((r) => String(r.id)) || [],
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    // IDs in Numbers umwandeln
    const payload = {
      ...formData,
      roles: formData.roles.map((id) => Number(id)),
    };

    const userResult = await updateUser(user.id, payload);
    if (!userResult.success) return;

    await fetchUsers(); // alle Nutzer neu laden

    // Formular mit aktualisiertem User füllen
    const updatedUser = userResult.user;
    setFormData({
      ...updatedUser,
      roles: updatedUser.roles?.map((r) => String(r.id)) || [],
      password: "", // Passwort leer lassen
    });

    onSave();
  };

  return (
    <Card title="Nutzer bearbeiten" extraClass="card-edit">
      <UserForm
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        roles={roles}
        error={error}
      />
    </Card>
  );
};

export default UserEditCard;
