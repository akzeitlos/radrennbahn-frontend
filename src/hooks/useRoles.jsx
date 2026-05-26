import useCrudApi from "./useCrudApi";

const normalizeRole = (fd) => ({
  name: fd.name,
  description: fd.description === "" ? null : fd.description,
});

function useRoles(token) {
  const { items: roles, createItem, updateItem, deleteItem, isLoading, error } =
    useCrudApi("roles", token);

  return {
    roles,
    isLoading,
    error,
    createRole: (data) => createItem(normalizeRole(data)).then((r) => ({ ...r, role: r.data })),
    updateRole: (id, data) => updateItem(id, normalizeRole(data)).then((r) => ({ ...r, role: r.data })),
    deleteRole: deleteItem,
  };
}

export default useRoles;
