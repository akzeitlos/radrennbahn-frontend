import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import useUsers from "@/hooks/useUsers.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import UserForm from "@/components/Forms/UserForm.jsx";
import useRoles from "@/hooks/useRoles.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import "./Users.css";

const emptyForm = {
  email: "",
  username: "",
  firstname: "",
  lastname: "",
  password: "",
  roles: [],
};

const Users = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const { users, createUser, updateUser, deleteUser, error, isLoading } = useUsers(token);
  const { roles } = useRoles(token);

  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      roles: formData.roles.map((id) => Number(id)),
    };

    try {
      let result;

      if (editingUser) {
        result = await updateUser(editingUser.id, payload);

        if (result.success) {
          const updatedUser = result.user;
          setFormData({ ...updatedUser, roles: updatedUser.roles?.map((r) => r.id) || [], password: "" });
          setEditingUser(updatedUser);
        }
      } else {
        result = await createUser(payload);

        if (result.success) {
          setFormData(emptyForm);
          setEditingUser(null);
        }
      }

      if (result.success) {
        if (editingUser && editingUser.id === user.id) {
          setUser(result.user);
        }
        setShowForm(false);
      }
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      email: u.email || "",
      username: u.username || "",
      firstname: u.firstname || "",
      lastname: u.lastname || "",
      password: "",
      roles: u.roles?.map((role) => role.id) || [],
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const confirmDelete = async (id) => {
    const result = await deleteUser(id);
    if (result.success) setUserToDelete(null);
  };

  return (
    <>
      <h1>Nutzer-Verwaltung</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {users.map((u) => {
            const isDeleting = userToDelete?.id === u.id;
            const isEditing = editingUser?.id === u.id && showForm;

            if (isDeleting) {
              return (
                <DeleteCard
                  key={u.id}
                  item={u}
                  title="Nutzer"
                  onConfirm={confirmDelete}
                  onCancel={() => setUserToDelete(null)}
                />
              );
            }

            if (isEditing) {
              return (
                <Card key={u.id} title="Nutzer bearbeiten" extraClass="card-edit">
                  <UserForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingUser(null);
                      setFormData(emptyForm);
                    }}
                    roles={roles}
                    error={error}
                  />
                </Card>
              );
            }

            return (
              <Card
                key={u.id}
                title={`${u.firstname} ${u.lastname}`}
                subtitle={u.email}
                onEdit={() => handleEdit(u)}
                onDelete={() => setUserToDelete(u)}
              />
            );
          })}

          {showForm && !editingUser ? (
            <Card title="Neuer Nutzer" extraClass="card-edit">
              <UserForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                roles={roles}
                error={error}
              />
            </Card>
          ) : (
            !showForm && <AddCard onClick={handleAdd} />
          )}
        </div>
      )}
    </>
  );
};

export default Users;
