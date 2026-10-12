import { computed, shallowRef } from "vue";
import type { IDrawerLayer } from "@/typings/crud";

export function useDrawerStack<T>() {
  const layers = shallowRef<IDrawerLayer<T>[]>([]);
  let sequence = 0;
  const top = computed(() => layers.value.at(-1));
  function push(layer: Omit<IDrawerLayer<T>, "id">) {
    const next = { ...layer, id: ++sequence };
    layers.value = [...layers.value, next];
    return next;
  }
  function trim(depth: number) {
    layers.value = layers.value.slice(0, depth);
  }
  function replace(id: number, record: T) {
    layers.value = layers.value.map(layer => (layer.id === id ? { ...layer, record } : layer));
  }
  return { layers, top, push, trim, replace };
}
