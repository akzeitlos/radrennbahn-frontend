import { useState, useContext } from "react";
import Card from "@/components/Card/Card.jsx";
import AddCard from "@/components/AddCard/AddCard.jsx";
import useRoles from "@/hooks/useRoles.jsx";
import { AuthContext } from "@/context/AuthContext.jsx";
import DeleteCard from "@/components/DeleteCard/DeleteCard.jsx";
import RoleForm from "@/components/Forms/RoleForm.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner.jsx";

import "./Roles.css";

const emptyForm = { name: "", description: "" };

const Roles = () => {
  const { token } = useContext(AuthContext);
  const { roles, createRole, updateRole, deleteRole, error, isLoading } = useRoles(token);

  const [roleToDelete, setRoleToDelete] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingRole
      ? await updateRole(editingRole.id, formData)
      : await createRole(formData);

    if (result.success) {
      setShowForm(false);
      setEditingRole(null);
      setFormData(emptyForm);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description });
    setShowForm(true);
  };

  const confirmDelete = async (id) => {
    const result = await deleteRole(id);
    if (result.success) setRoleToDelete(null);
  };

  return (
    <>
      <h1>Nutzergruppen-Verwaltung</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card-container">
          {roles.map((role) => {
            const isDeleting = roleToDelete?.id === role.id;
            const isEditing = editingRole?.id === role.id && showForm;

            if (isDeleting) {
              return (
                <DeleteCard
                  key={role.id}
                  item={role}
                  title="Rolle"
                  onConfirm={confirmDelete}
                  onCancel={() => setRoleToDelete(null)}
                />
              );
            }

            if (isEditing) {
              return (
                <Card key={role.id} title="Rolle bearbeiten" extraClass="card-edit">
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

            return (
              <Card
                key={role.id}
                title={role.name}
                subtitle={role.description || ""}
                onEdit={() => handleEdit(role)}
                onDelete={() => setRoleToDelete(role)}
              />
            );
          })}

          {showForm && !editingRole ? (
            <Card title="Neue Rolle" extraClass="card-edit">
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
          ) : (
            !showForm && <AddCard onClick={() => {
              setEditingRole(null);
              setFormData(emptyForm);
              setShowForm(true);
            }} />
          )}
        </div>
      )}
    </>
  );
};

export default Roles;
