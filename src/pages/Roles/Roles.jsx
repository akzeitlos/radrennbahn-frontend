import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import useRoles from "@/hooks/useRoles.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import RoleForm from "@/components/Forms/RoleForm.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";


import "./Roles.css";

const Roles = () => {
  // Get the auth token from context to authenticate API calls
  const { token } = useContext(AuthContext);

  // Load roles and role management functions from the custom hook
  const { roles, createRole, updateRole, deleteRole, error, isLoading } =
    useRoles(token);

  // Local state to track the role currently selected for deletion
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Local state to track the role currently being edited (null if creating a new one)
  const [editingRole, setEditingRole] = useState(null);

  // Controls whether the form (edit or add) is currently shown
  const [showForm, setShowForm] = useState(false);

  // Form input state for name and description
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Handles form submission for both create and update
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior

    let result;

    if (editingRole) {
      // If we're editing a role, call update function with current ID and form data
      result = await updateRole(editingRole.id, formData);
    } else {
      // If creating a new role, call the create function with the form data
      result = await createRole(formData);
    }

    // If the request was successful, reset everything and hide the form
    if (result.success) {
      setShowForm(false);
      setEditingRole(null);
      setFormData({ name: "", description: "" });
    }
  };

  // Updates form state whenever user types something
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Called when user clicks "Edit" on a role card
  const handleEdit = (role) => {
    setEditingRole(role); // Mark this role as the one we're editing
    setFormData({ name: role.name, description: role.description }); // Pre-fill the form
    setShowForm(true); // Show the form
  };

  // Called when user clicks the "Add" button
  const handleAdd = () => {
    setEditingRole(null); // We're not editing an existing role
    setFormData({ name: "", description: "" }); // Clear form
    setShowForm(true); // Show the form
  };

  // Called when user clicks "Delete" on a card
  const handleDelete = (role) => {
    setRoleToDelete(role); // Show the delete confirmation UI for this role
  };

  // Called when user confirms the deletion
  const confirmDelete = async (id) => {
    const result = await deleteRole(id);
    if (result.success) {
      setRoleToDelete(null); // Hide the delete confirmation
    }
  };

  // Called when user cancels the deletion
  const cancelDelete = () => {
    setRoleToDelete(null); // Just hide the delete confirmation UI
  };

  return (
    <>
      <h1>Nutzergruppen-Verwaltung</h1>
      {isLoading ? (
        <LoadingSpinner />// Spinner, Text oder Skeleton
      ) : (
        <div className="roles-card-container">
          {/* Loop through each role and decide what UI to show for it */}
          {roles.map((role) => {
            const isDeleting = roleToDelete?.id === role.id;
            const isEditing = editingRole?.id === role.id && showForm;

            // If this role is selected for deletion, show the confirmation card
            if (isDeleting) {
              return (
                <DeleteCard
                  key={role.id}
                  item={role}
                  title='Rolle'
                  onConfirm={confirmDelete}
                  onCancel={cancelDelete}
                />
              );
            }

            // If this role is being edited, show the edit form inside a card
            if (isEditing) {
              return (
                <Card
                  key={role.id}
                  title="Rolle bearbeiten"
                  aspectRatio="aspect-3-2"
                  extraClass="card-edit"
                >
                  <RoleForm
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingRole(null);
                    }}
                    error={error}
                  />
                </Card>
              );
            }

            // Otherwise, just show the normal role card with edit and delete options
            return (
              <Card
                key={role.id}
                title={role.name}
                aspectRatio="aspect-3-2"
                onEdit={() => handleEdit(role)}
                onDelete={() => handleDelete(role)}
              >
                {role.description}
              </Card>
            );
          })}

          {/* At the bottom: either show the form for a new role or the "Add" button */}
          {showForm && !editingRole ? (
            <Card
              title="Neue Rolle"
              aspectRatio="aspect-3-2"
              extraClass="card-edit"
            >
              <RoleForm
                title="Neue Rolle"
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingRole(null);
                }}
                error={error}
              />
            </Card>
          ) : (
            // If form is not shown, render the "Add New Role" card
            <AddCard onClick={handleAdd} aspectRatio="aspect-3-2" />
          )}
        </div>
      )}
    </>
  );
};

export default Roles;
