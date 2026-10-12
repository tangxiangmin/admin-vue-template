<template>
  <el-result
    v-if="!auth.hasPermission(`${permission}.view`)"
    icon="warning"
    title="无权访问此页面"
    sub-title="当前账号没有查看权限"
  />
  <PageContainer
    v-else
    :title="title"
    :description="description"
  >
    <template #actions>
      <el-button
        v-if="can('add')"
        type="primary"
        :disabled="busy || optionsLoading || !!optionsError"
        @click="open('add')"
      >
        <i class="i-ep-plus" />
        新增{{ entityName }}
      </el-button>
    </template>
    <div
      v-if="TEMPLATE_DEMO"
      class="ui-row text-sm text-ui-muted"
    >
      <i class="i-ep-info-filled text-ui-accent" />
      <span>当前为演示模式，数据将在刷新后恢复。</span>
    </div>
    <div :class="['standard-list-layout', { 'standard-list-layout--aside': slots.aside }]">
      <aside v-if="slots.aside">
        <slot
          name="aside"
          :params="requestParams"
          :apply="apply"
        />
      </aside>
      <ProTable
        :title="`全部${entityName}`"
        :table-key="tableKey ?? `${route.path}:${title}`"
        :rows="list"
        :total="total"
        :draft="draft"
        :params="requestParams"
        :query-fields="query?.fields"
        :columns="columns"
        :loading="loading"
        :error="error"
        :selectable="selectable"
        :selected="selection.selected.value"
        :row-label="rowLabel"
        :row-class-name="rowClassName"
        :action-width="Math.max(112, tableWidths.actions)"
        @search="search"
        @reset="reset"
        @apply="apply"
        @refresh="getList"
        @page-change="changeCurrent"
        @page-size-change="changeSize"
        @sort-change="changeSorter"
        @selection-change="rows => selection.updatePage(rows, list)"
        @remove-selection="row => selection.removeItems([row])"
        @clear-selection="selection.clear"
        @column-visibility-change="changeColumnVisibility"
        @column-order-change="changeColumnOrder"
        @row-click="onRowClick"
      >
        <template #query-extra>
          <slot
            name="query-extra"
            :draft="draft"
            :search="search"
          />
        </template>
        <template #toolbar="scope">
          <slot
            name="toolbar"
            v-bind="scope"
          />
        </template>
        <template #alerts>
          <el-alert
            v-if="storageError"
            class="mb-md"
            :title="storageError"
            type="warning"
            :closable="false"
            show-icon
          />
          <el-alert
            class="mb-md"
            v-if="optionsError"
            :title="optionsError"
            type="error"
            :closable="false"
            show-icon
          />
          <el-alert
            class="mb-md"
            v-if="error"
            :title="error"
            type="error"
            :closable="false"
            show-icon
          />
        </template>
        <template
          v-if="slots.list"
          #list
        >
          <slot
            name="list"
            :rows="list"
            :open="open"
            :remove="remove"
            :busy="busy"
            :row-class-name="rowClassName"
          />
        </template>
        <template
          v-if="slots.columns"
          #columns
        >
          <slot name="columns" />
        </template>
        <template
          v-if="slots.cell"
          #cell="scope"
        >
          <slot
            name="cell"
            v-bind="scope"
          />
        </template>
        <template
          v-if="hasDetail || can('edit') || copyRow || (api.remove && can('remove'))"
          #row-actions="{ row }"
        >
          <OperateButtons :items="getOperations(row)" />
        </template>
      </ProTable>
    </div>
    <DrawerStack
      :layers="layers"
      :active="active"
      :busy="busy"
      @close="close"
      @reset="resetDrawers"
    >
      <template #title="{ layer }">
        <slot
          name="drawer-title"
          :layer="layer"
        >
          {{ layer.title }}
        </slot>
      </template>
      <template #default="{ layer }">
        <slot
          v-if="layer.mode === 'detail'"
          name="detail"
          :row="layer.record"
          :actions="getActions(layer)"
        />
        <slot
          v-else-if="layer.mode === 'custom'"
          name="drawer"
          :route="layer.route"
          :params="layer.params"
          :row="layer.record"
          :actions="getActions(layer)"
        />
        <el-form
          v-else
          :ref="instance => setFormRef(layer.id, instance)"
          :model="layer.record"
          :rules="rules"
          class="[&_.el-select]:w-full"
          label-position="top"
          :disabled="busy"
          @input="markTouched(layer)"
          @change="markTouched(layer)"
          @submit.prevent
        >
          <slot
            name="form"
            :row="layer.record"
            :mode="layer.mode === 'copy' ? 'add' : layer.mode"
            :actions="getActions(layer)"
          />
        </el-form>
      </template>
      <template #footer="{ layer }">
        <template v-if="layer.mode === 'detail'">
          <el-button
            v-if="can('edit')"
            type="primary"
            :disabled="busy || optionsLoading || !!optionsError"
            @click="open('edit', layer.record)"
          >
            编辑
          </el-button>
          <el-button
            v-if="copyRow && can('add')"
            :disabled="busy || optionsLoading || !!optionsError"
            @click="open('copy', layer.record)"
          >
            复制新增
          </el-button>
          <el-button
            v-if="api.remove && can('remove')"
            type="danger"
            :disabled="busy"
            @click="remove(layer.record)"
          >
            删除
          </el-button>
          <el-button
            :disabled="busy"
            @click="close"
          >
            关闭
          </el-button>
        </template>
        <el-button
          v-else-if="layer.mode === 'custom'"
          :disabled="busy"
          @click="close"
        >
          返回
        </el-button>
        <template v-else>
          <el-button
            :disabled="busy"
            @click="close"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="busy || optionsLoading || !!optionsError || !can(layer.mode === 'edit' ? 'edit' : 'add')"
            @click="submit"
          >
            保存
          </el-button>
        </template>
      </template>
    </DrawerStack>
  </PageContainer>
</template>
<script setup lang="ts" generic="T extends { id?: number }">
import { computed, useSlots, watch } from "vue";
import { useRoute } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import OperateButtons from "@/components/OperateButtons/index.vue";
import { useTableSelection } from "@/hooks/useTableSelection";
import type { IListColumn, IListQueryOptions } from "@/typings/query";
import PageContainer from "@/components/PageContainer/index.vue";
import DrawerStack from "@/components/DrawerStack/index.vue";
import { useUiTokens } from "@/hooks/useUiTokens";
import { useCrud } from "@/hooks/useCrud";
import { useCrudDrawer } from "@/hooks/useCrudDrawer";
import { useAuthStore } from "@/stores/modules/auth";
import { TEMPLATE_DEMO } from "@/config/template";
import type { ICrudApi, IDrawerLayer, IFormLeaveEntry } from "@/typings/crud";
import type { TSearchStoreOptions } from "@/typings/search";
const props = defineProps<{
  title: string;
  tableKey?: string;
  entityName: string;
  description?: string;
  permission: string;
  api: ICrudApi<T>;
  createRow: () => T;
  copyRow?: (row: T) => T;
  rowLabel: (row: T) => string;
  rules: FormRules;
  optionsLoading?: boolean;
  optionsError?: string;
  searchStoreOptions?: TSearchStoreOptions;
  query?: IListQueryOptions;
  columns?: IListColumn<T>[];
  selectable?: boolean;
}>();
const auth = useAuthStore();
const can = (action: string) => auth.hasPermission(`${props.permission}.${action}`);
const slots = useSlots();
const route = useRoute();
const hasDetail = computed(() => Boolean(slots.detail) && can("view"));
const crud = useCrud<T>({
  api: props.api,
  rowLabel: props.rowLabel,
  can,
  searchStoreOptions: () => props.searchStoreOptions,
  query: props.query
});
const {
  draft,
  requestParams,
  apply,
  changeSorter,
  list,
  total,
  loading,
  saving,
  error,
  storageError,
  getList,
  search,
  reset,
  changeCurrent,
  changeSize
} = crud;
const selection = useTableSelection<T>();
watch(list, rows => selection.syncItems(rows), { flush: "sync" });
function changeColumnVisibility(key: keyof T & string, hidden: boolean) {
  const column = props.columns?.find(column => column.key === key);
  if (column) column.hidden = hidden;
}
function changeColumnOrder(keys: (keyof T & string)[]) {
  const columns = props.columns;
  if (!columns) return;
  const remaining = new Map(columns.map(column => [column.key, column]));
  const ordered = keys.flatMap(key => {
    const column = remaining.get(key);
    if (!column) return [];
    remaining.delete(key);
    return [column];
  });
  columns.splice(0, columns.length, ...ordered, ...remaining.values());
}
const {
  layers,
  top,
  active,
  busy,
  open,
  close,
  reset: resetDrawers,
  openRoute,
  save,
  remove,
  rowClassName,
  isTop,
  registerLeave,
  markTouched,
  setFieldsValueWithoutTouch
} = useCrudDrawer<T>({
  api: props.api,
  entityName: props.entityName,
  createRow: props.createRow,
  copyRow: props.copyRow,
  rowLabel: props.rowLabel,
  can,
  ready: () => !props.optionsLoading && !props.optionsError,
  hasDetail: () => hasDetail.value,
  saving: () => saving.value,
  removing: () => crud.removing.value,
  list: () => list.value,
  save: crud.save,
  remove: crud.remove,
  onRemoved: row => selection.removeItems([row]),
  onSaved: row => selection.syncItems([row])
});
const forms = new Map<number, FormInstance>();
function setFormRef(id: number, instance: unknown) {
  if (instance) forms.set(id, instance as FormInstance);
  else forms.delete(id);
}
function submit() {
  const form = top.value && forms.get(top.value.id);
  return save(async () => (form ? form.validate().catch(() => false) : false));
}
function getActions(layer: IDrawerLayer<T>) {
  return {
    registerLeave: (entry: IFormLeaveEntry) => registerLeave(layer, entry),
    markTouched: () => markTouched(layer),
    setFieldsValueWithoutTouch: (values: Partial<T>) => setFieldsValueWithoutTouch(layer, values),
    close: () => (isTop(layer) ? close() : undefined),
    openRoute: (name: string, params?: Record<string, unknown>) => {
      if (isTop(layer) && slots.drawer) openRoute(name, params);
    }
  };
}
function getOperations(row: T) {
  return [
    {
      key: "detail",
      label: "详情",
      icon: "i-ep-view",
      show: hasDetail.value,
      disabled: busy.value,
      run: () => open("detail", row)
    },
    {
      key: "edit",
      label: "编辑",
      icon: "i-ep-edit",
      show: can("edit"),
      disabled: busy.value || props.optionsLoading || !!props.optionsError,
      run: () => open("edit", row)
    },
    {
      key: "copy",
      label: "复制新增",
      show: !!props.copyRow && can("add"),
      disabled: busy.value || props.optionsLoading || !!props.optionsError,
      run: () => open("copy", row)
    },
    {
      key: "remove",
      label: "删除",
      danger: true,
      show: !!props.api.remove && can("remove"),
      disabled: busy.value,
      run: () => remove(row)
    }
  ];
}
function onRowClick(row: T, _column: unknown, event: MouseEvent) {
  const target = event.target;
  if (target instanceof Element && target.closest("button, a, input, label, .el-checkbox, .el-switch, .el-select"))
    return;
  if (hasDetail.value) open("detail", row);
}
const { tableWidths } = useUiTokens();
</script>
<style scoped lang="scss">
.standard-list-layout--aside {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: var(--ui-space-md);
}
@media (max-width: 768px) {
  .standard-list-layout--aside {
    grid-template-columns: minmax(0, 1fr);
  }
}
:deep(.el-table__body tr.crud-current-row > td.el-table__cell) {
  background: var(--ui-soft);
}
</style>
