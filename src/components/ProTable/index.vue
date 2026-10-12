<template>
  <div class="ui-stack min-w-0">
    <QueryListContainer
      class="ui-panel"
      :fields="queryFields"
      :draft="draft"
      :applied="params"
      :loading="loading"
      @search="emit('search')"
      @reset="emit('reset')"
      @apply="emit('apply', $event)"
    >
      <template #query-extra>
        <slot
          name="query-extra"
          :draft="draft"
        />
      </template>
    </QueryListContainer>
    <div class="ui-panel overflow-hidden min-w-0">
      <div class="pro-table__header p-md sm:px-lg border-b border-b-solid border-ui-border">
        <div class="ui-row">
          <span class="text-md font-semibold">{{ title }}</span>
          <span class="text-xs bg-ui-soft text-ui-muted px-xs py-1 rounded-sm">{{ total }}</span>
        </div>
        <div class="pro-table__tools">
          <slot name="header-extra" />
          <slot
            name="toolbar"
            :params="params"
            :rows="rows"
            :selected="selected"
          />
          <TableColumnSettings
            v-if="columns.length && !slots.columns && !slots.list"
            :columns="columns"
            :table-key="tableKey"
            @visibility-change="(key, hidden) => emit('column-visibility-change', key, hidden)"
            @order-change="emit('column-order-change', $event)"
          />
          <el-button
            text
            circle
            :loading="loading"
            aria-label="刷新列表"
            title="刷新"
            @click="emit('refresh')"
          >
            <i
              v-if="!loading"
              class="i-ep-refresh text-lg"
            />
          </el-button>
        </div>
      </div>
      <slot name="alerts" />
      <div
        v-if="selectable && selected.length"
        class="ui-row px-md pb-md"
      >
        <span>已选 {{ selected.length }} 条</span>
        <el-tag
          v-for="row in selected"
          :key="row.id"
          closable
          @close="emit('remove-selection', row)"
        >
          {{ rowLabel ? rowLabel(row) : row.id }}
        </el-tag>
        <el-button
          text
          @click="emit('clear-selection')"
        >
          清空已选
        </el-button>
      </div>
      <slot
        name="list"
        :rows="rows"
      >
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="rows"
          row-key="id"
          :row-class-name="rowClassName"
          :default-sort="{ prop: params.orderBy, order: params.order }"
          :empty-text="error ? '加载失败，请点击刷新重试' : '暂无数据'"
          @sort-change="emit('sort-change', $event)"
          @selection-change="onSelectionChange"
          @row-click="onRowClick"
        >
          <el-table-column
            v-if="selectable"
            type="selection"
            width="48"
          />
          <slot name="columns">
            <template
              v-for="column in columns"
              :key="column.key"
            >
              <el-table-column
                v-if="!column.hidden"
                :prop="column.key"
                :label="column.label"
                :min-width="column.minWidth ?? 140"
                :sortable="column.sortable ? 'custom' : false"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  <slot
                    name="cell"
                    :row="row"
                    :column="column"
                  >
                    {{ column.format ? column.format(row) : (row[column.key] ?? "-") }}
                  </slot>
                </template>
              </el-table-column>
            </template>
          </slot>
          <el-table-column
            v-if="slots['row-actions']"
            label="操作"
            fixed="right"
            :width="actionWidth"
          >
            <template #default="{ row }">
              <slot
                name="row-actions"
                :row="row"
              />
            </template>
          </el-table-column>
        </el-table>
      </slot>
      <div class="ui-between p-md sm:px-lg overflow-x-auto">
        <span class="text-sm text-ui-muted">共 {{ total }} 条记录</span>
        <el-pagination
          background
          :current-page="params.pageNum"
          :page-size="params.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next"
          @current-change="emit('page-change', $event)"
          @size-change="emit('page-size-change', $event)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" generic="T extends { id?: number }">
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from "vue";
import type { TableInstance } from "element-plus";
import QueryListContainer from "@/components/QueryListContainer/index.vue";
import TableColumnSettings from "@/components/TableColumnSettings/index.vue";
import type { IPageQuery } from "@/typings/crud";
import type { IListColumn, IQueryField } from "@/typings/query";

const props = withDefaults(
  defineProps<{
    title: string;
    tableKey: string;
    rows: T[];
    total: number;
    draft: IPageQuery;
    params: IPageQuery;
    queryFields?: IQueryField[];
    columns?: IListColumn<T>[];
    loading?: boolean;
    error?: string;
    selectable?: boolean;
    selected?: T[];
    rowLabel?: (row: T) => string;
    rowClassName?: (data: { row: T; rowIndex: number }) => string;
    actionWidth?: number;
  }>(),
  { columns: () => [], selected: () => [], loading: false, selectable: false, actionWidth: 140 }
);
const emit = defineEmits<{
  search: [];
  reset: [];
  refresh: [];
  apply: [patch: Partial<IPageQuery>];
  "page-change": [page: number];
  "page-size-change": [size: number];
  "sort-change": [sorter: { prop?: string; order?: "ascending" | "descending" | null }];
  "selection-change": [rows: T[]];
  "remove-selection": [row: T];
  "clear-selection": [];
  "column-visibility-change": [key: keyof T & string, hidden: boolean];
  "column-order-change": [keys: (keyof T & string)[]];
  "row-click": [row: T, column: unknown, event: MouseEvent];
}>();
const slots = useSlots();
const queryFields = computed<IQueryField[]>(
  () =>
    props.queryFields ?? [
      { key: "keyword", label: "", kind: "text", inline: true, trigger: "manual", placeholder: "输入关键词搜索" }
    ]
);
const tableRef = ref<TableInstance>();
let syncingSelection = false,
  selectionVersion = 0;
onBeforeUnmount(() => {
  selectionVersion++;
});
watch(
  [() => props.rows, () => props.selected, () => props.selectable],
  async () => {
    const version = ++selectionVersion;
    syncingSelection = true;
    try {
      await nextTick();
      if (version !== selectionVersion) return;
      tableRef.value?.clearSelection();
      if (props.selectable) {
        const ids = new Set(props.selected.map(row => row.id));
        props.rows.forEach(row => {
          if (ids.has(row.id)) tableRef.value?.toggleRowSelection(row, true);
        });
      }
    } finally {
      if (version === selectionVersion) syncingSelection = false;
    }
  },
  { flush: "sync", immediate: true }
);
function onSelectionChange(rows: T[]) {
  if (!syncingSelection) emit("selection-change", rows);
}
function onRowClick(row: T, column: unknown, event: MouseEvent) {
  emit("row-click", row, column, event);
}
</script>
<style scoped>
.pro-table__header,
.pro-table__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-sm);
}
.pro-table__header {
  justify-content: space-between;
}
.pro-table__tools :deep(.el-button) {
  margin: 0;
  height: var(--el-component-size);
}
.pro-table__tools :deep(.el-dropdown) {
  display: inline-flex;
  align-items: center;
}
</style>
