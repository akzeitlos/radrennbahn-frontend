import useCrudApi from "./useCrudApi";

function useRaceClasses(token) {
  const { items: raceClasses, createItem, updateItem, deleteItem, isLoading, error } =
    useCrudApi("race-classes", token);

  return {
    raceClasses,
    isLoading,
    error,
    createRaceClass: (data) => createItem(data).then((r) => ({ ...r, raceClass: r.data })),
    updateRaceClass: (id, data) => updateItem(id, data).then((r) => ({ ...r, raceClass: r.data })),
    deleteRaceClass: deleteItem,
  };
}

export default useRaceClasses;
