import { inject, onScopeDispose, type InjectionKey } from "vue";
interface IQueryTabsScope {
  register: (close: () => Promise<boolean>) => () => void;
}
export const queryTabsScopeKey: InjectionKey<IQueryTabsScope> = Symbol("query-tabs-scope");
export function useQueryTabsDrawerClose(close: () => Promise<boolean>) {
  const scope = inject(queryTabsScopeKey, undefined);
  const unregister = scope?.register(close);
  if (unregister) onScopeDispose(unregister);
}
