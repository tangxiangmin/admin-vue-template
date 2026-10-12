import { defineStore } from "pinia";
import { ElMessageBox } from "element-plus";
import type { IFormLeaveEntry, IPageLeaveEntry } from "@/typings/crud";

/** 只保存页面生命周期内的回调，不持久化表单及授权。 */
export const usePageLeaveStore = defineStore("admin-template-page-leave", () => {
  const entries = new Map<string, Set<IPageLeaveEntry>>();
  const approved = new Set<string>();
  let pending: Promise<boolean> | undefined;
  let performing = false;
  const select = (paths?: string[]) =>
    [...entries].filter(([path]) => !paths || paths.includes(path)).flatMap(([, values]) => [...values]);
  function register(path: string, entry: IPageLeaveEntry) {
    const values = entries.get(path) ?? new Set<IPageLeaveEntry>();
    values.add(entry);
    entries.set(path, values);
    return () => {
      values.delete(entry);
      if (!values.size) entries.delete(path);
    };
  }
  const isDirty = () => select().some(entry => entry.isDirty());
  async function confirm(entriesToCheck: IFormLeaveEntry[]): Promise<boolean> {
    if (entriesToCheck.some(entry => entry.isBlocked?.())) return false;
    if (!entriesToCheck.some(entry => entry.isDirty())) return true;
    // 不同操作不共享批准结果，避免一次确认允许另一个范围的关闭。
    if (pending) return false;
    pending = ElMessageBox.confirm("尚有未保存的修改，确认放弃？", "未保存的修改", {
      type: "warning",
      confirmButtonText: "放弃修改",
      cancelButtonText: "继续编辑"
    }).then(
      () => true,
      () => false
    );
    try {
      return await pending;
    } finally {
      pending = undefined;
    }
  }
  async function request(paths: string[]) {
    return confirm(select(paths.filter(path => !approved.has(path))));
  }
  function discard(paths: string[]) {
    select(paths).forEach(entry => entry.discard());
  }
  async function perform(paths: string[], action: () => Promise<boolean>) {
    if (performing) return false;
    performing = true;
    try {
      if (!(await request(paths))) return false;
      const targets = select(paths);
      paths.forEach(path => approved.add(path));
      if (!(await action())) return false;
      // 刷新可能已创建新页面，只清理本次批准的原实例。
      targets.forEach(entry => entry.discard());
      return true;
    } finally {
      paths.forEach(path => approved.delete(path));
      performing = false;
    }
  }
  // 抽屉关闭与路由关闭共用确认窗口，局部关闭自行在通过后清理对应层。
  const confirmEntries = (values: IFormLeaveEntry[]) => confirm(values);
  return { register, request, perform, discard, isDirty, confirmEntries };
});
