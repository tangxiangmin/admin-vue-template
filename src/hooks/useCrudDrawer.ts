import { computed, onActivated, onBeforeUnmount, onDeactivated, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useCrudDeepLink } from "@/hooks/useCrudDeepLink";
import { useQueryTabsDrawerClose } from "@/hooks/useQueryTabsScope";
import { useDrawerStack } from "@/hooks/useDrawerStack";
import { useFormLeaveGuard } from "@/hooks/useFormLeaveGuard";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { getPagePath } from "@/utils/pageRoute";
import type { IDrawerLayer, ICrudApi, IFormLeaveEntry, TCrudDrawerMode } from "@/typings/crud";

interface ICrudDrawerOptions<T> {
  api: ICrudApi<T>;
  entityName: string;
  createRow: () => T;
  copyRow?: (row: T) => T;
  rowLabel: (row: T) => string;
  can: (action: string) => boolean;
  ready: () => boolean;
  hasDetail: () => boolean;
  saving: () => boolean;
  removing: () => boolean;
  list: () => T[];
  save: (row: T, mode: "add" | "edit", validate: () => Promise<boolean>) => Promise<boolean>;
  remove: (row: T) => Promise<boolean>;
  onRemoved?: (row: T) => void;
  onSaved?: (row: T) => void;
}

export function useCrudDrawer<T extends { id?: number }>(options: ICrudDrawerOptions<T>) {
  const stack = useDrawerStack<T>();
  const guard = useFormLeaveGuard();
  const formStates = new Map<number, { baseline: string; touched: boolean }>();
  const pageLeave = usePageLeaveStore();
  const route = useRoute();
  const pagePath = getPagePath(route);
  const active = ref(true);
  const opening = ref(false);
  const busy = computed(() => opening.value || options.saving() || options.removing());
  const detail = computed(() => stack.layers.value.find(layer => layer.mode === "detail"));
  let alive = true;
  const clone = (row: T): T => JSON.parse(JSON.stringify(row));
  const editable = (mode: TCrudDrawerMode) => mode === "add" || mode === "edit" || mode === "copy";
  const errorMessage = (error: unknown) => ElMessage.error(error instanceof Error ? error.message : "操作失败，请重试");
  function trim(depth: number) {
    stack.layers.value.slice(depth).forEach(layer => {
      guard.unregister(layer.id);
      formStates.delete(layer.id);
    });
    stack.trim(depth);
  }
  const unregisterPage = pageLeave.register(pagePath, {
    isDirty: () => guard.isDirty(),
    isBlocked: () => busy.value || guard.isBlocked(),
    discard: () => trim(0)
  });
  async function request(depth: number) {
    const keys = stack.layers.value.slice(depth).map(layer => layer.id);
    return pageLeave.confirmEntries([
      {
        isDirty: () => guard.isDirty(keys),
        isBlocked: () => options.saving() || options.removing() || guard.isBlocked(keys)
      }
    ]);
  }
  function push(mode: TCrudDrawerMode, record: T, routeName?: string, params?: Record<string, unknown>) {
    const labels = { add: "新增", edit: "编辑", copy: "复制新增", detail: "详情", custom: "" };
    const row = reactive(clone(record)) as T;
    const layer = stack.push({
      mode,
      record: row,
      title:
        mode === "custom"
          ? (routeName ?? "")
          : `${labels[mode]}${options.entityName}${mode === "detail" ? ` · ${options.rowLabel(row)}` : ""}`,
      route: routeName,
      params
    });
    if (editable(mode)) {
      const state = { baseline: JSON.stringify(row), touched: false };
      formStates.set(layer.id, state);
      guard.register(layer.id, {
        isDirty: () => state.touched || JSON.stringify(layer.record) !== state.baseline,
        isBlocked: () => options.saving()
      });
    }
    return layer;
  }
  async function load(row: T) {
    if (!options.api.getDetail || row.id === undefined) return clone(row);
    return options.api.getDetail(row.id);
  }
  async function open(mode: "add" | "edit" | "copy" | "detail", row?: T) {
    const permission = mode === "detail" ? "view" : mode === "copy" ? "add" : mode;
    if (busy.value || !active.value || !options.can(permission)) return;
    if (mode !== "detail" && !options.ready()) return;
    if (mode === "detail" && (!row || !options.hasDetail())) return;
    if (mode === "edit" && !row) return;
    if (mode === "copy" && (!row || !options.copyRow)) return;
    if (mode === "detail" && row?.id !== undefined && detail.value?.record.id === row.id) return;
    // 详情内编辑保留详情；再次编辑、新增和换记录会替换受影响的表单层。
    const currentDetail = detail.value;
    const depth =
      mode === "edit" && currentDetail && currentDetail.record.id === row?.id
        ? stack.layers.value.indexOf(currentDetail) + 1
        : 0;
    opening.value = true;
    try {
      if (!(await request(depth))) return;
      const record =
        mode === "add" ? options.createRow() : mode === "copy" ? options.copyRow!(await load(row!)) : await load(row!);
      if (!alive || !active.value || !options.can(permission)) return;
      trim(depth);
      push(mode, record);
    } catch (error) {
      errorMessage(error);
    } finally {
      opening.value = false;
    }
  }
  async function close() {
    if (busy.value) return;
    opening.value = true;
    try {
      const depth = stack.layers.value.length - 1;
      if (depth >= 0 && (await request(depth))) trim(depth);
    } finally {
      opening.value = false;
    }
  }
  async function reset() {
    if (busy.value) return false;
    opening.value = true;
    try {
      if (!(await request(0))) return false;
      trim(0);
      return true;
    } finally {
      opening.value = false;
    }
  }
  useQueryTabsDrawerClose(reset);
  function openRoute(name: string, params?: Record<string, unknown>) {
    if (busy.value || !active.value || !stack.top.value) return;
    push("custom", stack.top.value.record, name, params);
  }
  async function save(validate: () => Promise<boolean>) {
    const layer = stack.top.value;
    if (!layer || !editable(layer.mode) || busy.value) return;
    if (!(await options.save(layer.record, layer.mode === "edit" ? "edit" : "add", validate))) return;
    options.onSaved?.(layer.record);
    // 写入已成功：解除脏态、返回上层。详情刷新失败单独提示，不把保存报告为失败。
    guard.unregister(layer.id);
    trim(stack.layers.value.indexOf(layer));
    const lower = detail.value;
    if (lower) {
      const latest = options.list().find(row => row.id === lower.record.id);
      stack.replace(lower.id, { ...lower.record, ...clone(layer.record), ...latest });
      if (options.api.getDetail) {
        opening.value = true;
        try {
          stack.replace(lower.id, await load(lower.record));
        } catch (error) {
          errorMessage(error);
        } finally {
          opening.value = false;
        }
      }
    }
  }
  async function remove(row: T) {
    if (busy.value) return;
    opening.value = true;
    try {
      const index = stack.layers.value.findIndex(layer => layer.record.id === row.id);
      if (index >= 0 && !(await request(index))) return;
      if (await options.remove(row)) {
        options.onRemoved?.(row);
        if (index >= 0) trim(index);
      }
    } finally {
      opening.value = false;
    }
  }
  useCrudDeepLink({
    ready: options.ready,
    active: () => active.value,
    busy: () => busy.value,
    hasDetailApi: Boolean(options.api.getDetail),
    open: (mode, id) => open(mode, id === undefined ? undefined : ({ id } as T))
  });
  onActivated(() => {
    active.value = true;
  });
  onDeactivated(() => {
    active.value = false;
  });
  onBeforeUnmount(() => {
    alive = false;
    unregisterPage();
  });
  const rowClassName = ({ row }: { row: T }) =>
    detail.value?.record.id !== undefined && detail.value.record.id === row.id ? "crud-current-row" : "";
  // 插槽动作只接受当前顶层，避免保留在下层的回调修改错误记录。
  const registerLeave = (layer: IDrawerLayer<T>, entry: IFormLeaveEntry) => guard.register(layer.id, entry);
  const isTop = (layer: IDrawerLayer<T>) => stack.top.value?.id === layer.id;
  function markTouched(layer: IDrawerLayer<T>) {
    const state = formStates.get(layer.id);
    if (state && stack.layers.value.some(item => item.id === layer.id)) state.touched = true;
  }
  function setFieldsValueWithoutTouch(layer: IDrawerLayer<T>, values: Partial<T>) {
    const state = formStates.get(layer.id);
    if (!state || !isTop(layer)) return;
    Object.assign(layer.record, clone(values as T));
    state.baseline = JSON.stringify(layer.record);
  }
  return {
    layers: stack.layers,
    top: stack.top,
    active,
    busy,
    open,
    close,
    reset,
    openRoute,
    save,
    remove,
    rowClassName,
    isTop,
    registerLeave,
    markTouched,
    setFieldsValueWithoutTouch
  };
}
