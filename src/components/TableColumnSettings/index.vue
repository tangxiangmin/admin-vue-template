<template>
  <el-popover
    placement="bottom-end"
    trigger="click"
    :width="260"
  >
    <template #reference>
      <el-button
        text
        circle
        aria-label="列设置"
        title="列设置"
      >
        <i class="i-ep-setting text-lg" />
      </el-button>
    </template>
    <div class="column-settings">
      <div class="column-settings__header">
        <el-checkbox
          :model-value="allVisible"
          :indeterminate="partlyVisible"
          @change="toggleAll(Boolean($event))"
        >
          <span class="font-semibold">列展示</span>
        </el-checkbox>
        <el-button
          link
          type="primary"
          @click="reset"
        >
          重置
        </el-button>
      </div>
      <div
        ref="listRef"
        class="column-settings__list"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          class="column-settings__row"
        >
          <button
            class="column-settings__handle"
            type="button"
            :aria-label="`拖动调整${column.label}的顺序，或使用上下方向键`"
            title="拖动调整顺序"
            @keydown.up.prevent="moveColumn(column.key, -1)"
            @keydown.down.prevent="moveColumn(column.key, 1)"
          >
            <svg
              width="12"
              height="18"
              viewBox="0 0 12 18"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle
                cx="3"
                cy="3"
                r="1.3"
              />
              <circle
                cx="9"
                cy="3"
                r="1.3"
              />
              <circle
                cx="3"
                cy="9"
                r="1.3"
              />
              <circle
                cx="9"
                cy="9"
                r="1.3"
              />
              <circle
                cx="3"
                cy="15"
                r="1.3"
              />
              <circle
                cx="9"
                cy="15"
                r="1.3"
              />
            </svg>
          </button>
          <el-checkbox
            :model-value="!column.hidden"
            @change="emit('visibility-change', column.key, !$event)"
          >
            {{ column.label }}
          </el-checkbox>
        </div>
      </div>
    </div>
  </el-popover>
</template>
<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import Sortable from "sortablejs";
import type { IListColumn } from "@/typings/query";

type TColumnKey = keyof T & string;
interface IStoredColumn {
  key: string;
  hidden: boolean;
}
const props = defineProps<{ columns: IListColumn<T>[]; tableKey: string }>();
const emit = defineEmits<{
  "visibility-change": [key: TColumnKey, hidden: boolean];
  "order-change": [keys: TColumnKey[]];
}>();
const visibleCount = computed(() => props.columns.filter(column => !column.hidden).length);
const allVisible = computed(() => props.columns.length > 0 && visibleCount.value === props.columns.length);
const partlyVisible = computed(() => visibleCount.value > 0 && !allVisible.value);
const defaultVisibility = new Map<TColumnKey, boolean>();
let defaultOrder: TColumnKey[] = [];
const storageKey = computed(() => `forma:table-columns:v1:${props.tableKey}`);
let persistenceReady = false,
  restoring = false,
  storageWarningShown = false;
function reportStorageError() {
  if (storageWarningShown) return;
  storageWarningShown = true;
  ElMessage.warning("列设置无法保存或读取，请检查浏览器本地存储权限");
}
watch(
  () => props.columns.map(column => column.key),
  keys => {
    const currentKeys = new Set(keys);
    defaultOrder = defaultOrder.filter(key => currentKeys.has(key));
    for (const key of defaultVisibility.keys()) if (!currentKeys.has(key)) defaultVisibility.delete(key);
    for (const column of props.columns) {
      if (!defaultVisibility.has(column.key)) {
        defaultOrder.push(column.key);
        defaultVisibility.set(column.key, !!column.hidden);
      }
    }
  },
  { immediate: true, flush: "sync" }
);
function restoreSavedColumns() {
  restoring = true;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey.value) ?? "null");
    if (
      !Array.isArray(saved) ||
      !saved.every((column: unknown): column is IStoredColumn => {
        if (!column || typeof column !== "object") return false;
        const value = column as Partial<IStoredColumn>;
        return typeof value.key === "string" && typeof value.hidden === "boolean";
      })
    )
      return;
    const current = new Map(props.columns.map(column => [column.key, column]));
    const order: TColumnKey[] = [];
    for (const column of saved as IStoredColumn[]) {
      const key = column.key as TColumnKey;
      if (!current.has(key)) continue;
      emit("visibility-change", key, column.hidden);
      order.push(key);
      current.delete(key);
    }
    emit("order-change", [...order, ...current.keys()]);
  } catch {
    reportStorageError();
  } finally {
    restoring = false;
  }
}
onMounted(() => {
  restoreSavedColumns();
  persistenceReady = true;
});
watch(
  () => props.columns.map(column => ({ key: column.key, hidden: !!column.hidden })),
  columns => {
    if (!persistenceReady || restoring) return;
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(columns));
    } catch {
      reportStorageError();
    }
  },
  { flush: "sync" }
);
watch(
  () => props.tableKey,
  () => {
    restoring = true;
    applyDefaults();
    restoring = false;
    restoreSavedColumns();
  }
);
function toggleAll(visible: boolean) {
  props.columns.forEach(column => emit("visibility-change", column.key, !visible));
}
function applyDefaults() {
  props.columns.forEach(column => emit("visibility-change", column.key, defaultVisibility.get(column.key) ?? false));
  emit("order-change", [...defaultOrder]);
}
function reset() {
  restoring = true;
  try {
    applyDefaults();
    localStorage.removeItem(storageKey.value);
  } catch {
    reportStorageError();
  } finally {
    restoring = false;
  }
}
function moveColumn(key: TColumnKey, offset: number) {
  const keys = props.columns.map(column => column.key);
  const from = keys.indexOf(key),
    to = from + offset;
  if (from < 0 || to < 0 || to >= keys.length) return;
  keys.splice(to, 0, ...keys.splice(from, 1));
  emit("order-change", keys);
}
const listRef = ref<HTMLElement>();
let sortable: Sortable | undefined;
watch(
  listRef,
  element => {
    sortable?.destroy();
    sortable = undefined;
    if (!element) return;
    sortable = new Sortable(element, {
      animation: 150,
      handle: ".column-settings__handle",
      draggable: ".column-settings__row",
      ghostClass: "column-settings__row--ghost",
      onEnd: ({ item, oldIndex, newIndex }) => {
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
        // 恢复拖拽前的 DOM 顺序，再由 Vue 根据配置更新列表。
        item.remove();
        element.insertBefore(item, element.children[oldIndex] ?? null);
        const key = props.columns[oldIndex]?.key;
        if (key !== undefined) moveColumn(key, newIndex - oldIndex);
      }
    });
  },
  { flush: "post" }
);
onBeforeUnmount(() => sortable?.destroy());
</script>
<style scoped>
.column-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-sm);
  padding-bottom: var(--ui-space-sm);
  border-bottom: 1px solid var(--ui-border);
}
.column-settings__list {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-xs);
  padding-top: var(--ui-space-sm);
  max-height: 20rem;
  overflow-y: auto;
}
.column-settings__row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-md);
  min-height: var(--el-component-size);
  border-radius: var(--ui-radius-sm);
}
.column-settings__row:hover {
  background: var(--ui-soft);
}
.column-settings__row--ghost {
  opacity: 0.4;
}
.column-settings__handle {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--el-component-size-small);
  height: var(--el-component-size);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-muted);
  cursor: grab;
  touch-action: none;
}
.column-settings__handle:active {
  cursor: grabbing;
}
.column-settings :deep(.el-checkbox) {
  margin-right: 0;
  min-width: 0;
}
.column-settings__row :deep(.el-checkbox) {
  flex: 1;
}
.column-settings__row :deep(.el-checkbox__label) {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
