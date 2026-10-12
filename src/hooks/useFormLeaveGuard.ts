import { onScopeDispose } from "vue";
import type { IFormLeaveEntry } from "@/typings/crud";

/** 一个抽屉实例一个注册表，关闭时仅检查受影响的层。 */
export function useFormLeaveGuard() {
  const entries = new Map<number, Set<IFormLeaveEntry>>();
  const select = (keys?: number[]) =>
    [...entries].filter(([key]) => !keys || keys.includes(key)).flatMap(([, values]) => [...values]);
  function register(key: number, entry: IFormLeaveEntry) {
    const values = entries.get(key) ?? new Set<IFormLeaveEntry>();
    values.add(entry);
    entries.set(key, values);
    return () => {
      values.delete(entry);
      if (!values.size) entries.delete(key);
    };
  }
  const unregister = (key: number) => entries.delete(key);
  const isDirty = (keys?: number[]) => select(keys).some(entry => entry.isDirty());
  const isBlocked = (keys?: number[]) => select(keys).some(entry => entry.isBlocked?.());
  onScopeDispose(() => entries.clear());
  return { register, unregister, isDirty, isBlocked };
}
