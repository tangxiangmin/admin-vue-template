import { computed, shallowRef } from "vue";
export function useTableSelection<T extends { id?: number }>() {
  const selected = shallowRef<T[]>([]);
  function updatePage(rows: T[], pageRows: T[]) {
    const ids = new Set(pageRows.map(row => row.id));
    selected.value = [...selected.value.filter(row => !ids.has(row.id)), ...rows];
  }
  function removeItems(rows: T[]) {
    const ids = new Set(rows.map(row => row.id));
    selected.value = selected.value.filter(row => !ids.has(row.id));
  }
  function syncItems(rows: T[]) {
    const records = new Map(rows.map(row => [row.id, row]));
    selected.value = selected.value.map(row => records.get(row.id) ?? row);
  }
  return {
    selected,
    keys: computed(() => selected.value.map(row => row.id)),
    updatePage,
    removeItems,
    syncItems,
    clear: () => {
      selected.value = [];
    }
  };
}
