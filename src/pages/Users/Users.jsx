import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import useUsers from "@/hooks/useUsers.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import UserForm from "@/components/Forms/UserForm.jsx";
import useRoles from "@/hooks/useRoles.jsx";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";
import UserEditCard from "@/components/UserEditCard/UserEditCard.jsx";

import "./Users.css";

const Users = () => {
  // Get the auth token from context to authenticate API calls
  const { token } = useContext(AuthContext);
  // Load users and user management functions from the custom hook
  const { users, createUser, updateUser, deleteUser, error, isLoading } =
    useUsers(token);

  // Local state to track the user currently selected for deletion
  const [userToDelete, setUserToDelete] = useState(null);

  // Local state to track the user currently being edited (null if creating a new one)
  const [editingUser, setEditingUser] = useState(null);

  // Controls whether the form (edit or add) is currently shown
  const [showForm, setShowForm] = useState(false);

  const { roles } = useRoles(token);

  // Form input state for name and description
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    roles: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      roles: formData.roles.map((id) => Number(id)),
    };

    let result;

    try {
      if (editingUser) {
        // User updaten
        result = await updateUser(editingUser.id, payload);

        if (result.success) {
          const updatedUser = result.user; // updatedUser kommt von updateUser

          setFormData({
            ...updatedUser,
            roles: updatedUser.roles?.map((r) => r.id) || [],
            password: "", // Passwort leer lassen
          });
          setEditingUser(updatedUser);
        }
      } else {
        // User anlegen
        result = await createUser(payload);

        if (result.success) {
          setFormData({
            email: "",
            username: "",
            firstname: "",
            lastname: "",
            password: "",
            roles: [],
          });
          setEditingUser(null);
        }
      }

      if (result.success) {
        setShowForm(false);
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  // Updates form state whenever user types something
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Called when user clicks "Edit" on a user card
const handleEdit = (user) => {
  setEditingUser(user);
  console.log("user",user);
  setFormData({
    email: user.email || "",
    username: user.username || "",
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    password: "",
    roles: user.roles?.map((role) => String(role.id)) || [],
  });
    console.log("formdata:",formData);

  setShowForm(true);
};

  // Called when user clicks the "Add" button
const handleAdd = () => {
  setEditingUser(null);
  setFormData({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    roles: [],
  });
  setShowForm(true);
};

  // Called when user clicks "Delete" on a card
  const handleDelete = (user) => {
    setUserToDelete(user); // Show the delete confirmation UI for this user
  };

  // Called when user confirms the deletion
  const confirmDelete = async (id) => {
    const result = await deleteUser(id);
    if (result.success) {
      setUserToDelete(null); // Hide the delete confirmation
    }
  };

  // Called when user cancels the deletion
  const cancelDelete = () => {
    setUserToDelete(null); // Just hide the delete confirmation UI
  };
  return (
    <>
      <h1>Nutzer-Verwaltung</h1>
      {isLoading ? (
        <LoadingSpinner /> // Spinner, Text oder Skeleton
      ) : (
        <div className="card-container">
          {/* Loop through each user and decide what UI to show for it */}
          {users.map((user) => {
            const isDeleting = userToDelete?.id === user.id;
            const isEditing = editingUser?.id === user.id && showForm;

            // If this user is selected for deletion, show the confirmation card
            if (isDeleting) {
              return (
                <DeleteCard
                  key={user.id}
                  item={user}
                  title="Nutzer"
                  onConfirm={confirmDelete}
                  onCancel={cancelDelete}
                />
              );
            }

            // If this user is being edited, show the edit form inside a card
            if (isEditing) {
              return (
                <UserEditCard
                  key={user.id}
                  user={user}
                  token={token}
                  updateUser={updateUser}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  onSave={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  roles={roles}
                  error={error}
                />
              );
            }

            // Otherwise, just show the normal user card with edit and delete options
            return (
              <Card
                key={user.id}
                title={`${user.firstname} ${user.lastname}`}
                onEdit={() => handleEdit(user)}
                onDelete={() => handleDelete(user)}
              />
            );
          })}

          {/* At the bottom: either show the form for a new user or the "Add" button */}
          {showForm && !editingUser ? (
            <Card title="Neue Nutzer" extraClass="card-edit">
              <UserForm
                title="Neue Nutzer"
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
            // Wenn kein Formular gezeigt wird, "Add" Button
            <AddCard onClick={handleAdd} />
          )}
        </div>
      )}
    </>
  );
};

export default Users;
