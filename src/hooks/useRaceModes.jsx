import useCrudApi from "./useCrudApi";

function useRaceModes(token) {
  const { items: raceModes, createItem, updateItem, deleteItem, isLoading, error } =
    useCrudApi("race-modes", token);

  return {
    raceModes,
    isLoading,
    error,
    createRaceMode: (data) => createItem(data).then((r) => ({ ...r, raceMode: r.data })),
    updateRaceMode: (id, data) => updateItem(id, data).then((r) => ({ ...r, raceMode: r.data })),
    deleteRaceMode: deleteItem,
  };
}

export default useRaceModes;
