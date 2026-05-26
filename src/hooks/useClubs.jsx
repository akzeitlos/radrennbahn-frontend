import useCrudApi from "./useCrudApi";

function useClubs(token) {
  const { items: clubs, createItem, updateItem, deleteItem, isLoading, error } =
    useCrudApi("clubs", token);

  return {
    clubs,
    isLoading,
    error,
    createClub: (data) => createItem(data).then((r) => ({ ...r, club: r.data })),
    updateClub: (id, data) => updateItem(id, data).then((r) => ({ ...r, club: r.data })),
    deleteClub: deleteItem,
  };
}

export default useClubs;
