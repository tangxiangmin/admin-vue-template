import { createInjectionState, useCounter } from "@vueuse/core";
import { readonly } from "vue";

const [useProvideExampleCounter, injectExampleCounter] = createInjectionState((initial: number) => {
  const { count, inc, dec, reset } = useCounter(initial, { min: 0, max: 99 });
  return { count: readonly(count), inc, dec, reset };
});
export { useProvideExampleCounter };
export function useExampleCounter() {
  const state = injectExampleCounter();
  if (!state) throw new Error("计数器组件必须放在 CounterProvider 内");
  return state;
}
