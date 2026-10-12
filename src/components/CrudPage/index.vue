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
        :disabled="saving || optionsLoading || !!optionsError"
        @click="open()"
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
      :action-width="tableWidths.actions"
      @search="search"
      @reset="reset"
      @apply="apply"
      @refresh="getList"
      @page-change="changeCurrent"
      @page-size-change="changeSize"
      @sort-change="changeSorter"
      @column-visibility-change="changeColumnVisibility"
      @column-order-change="changeColumnOrder"
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
        v-if="can('edit') || (api.remove && can('remove'))"
        #row-actions="{ row }"
      >
        <el-button
          v-if="can('edit')"
          link
          type="primary"
          :disabled="saving || optionsLoading || !!optionsError"
          @click="open(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="api.remove && can('remove')"
          link
          type="danger"
          :disabled="removing"
          @click="remove(row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
    <el-dialog
      v-model="visible"
      :title="`${mode === 'add' ? '新增' : '编辑'}${entityName}`"
      width="var(--ui-size-dialog)"
      :close-on-click-modal="false"
      :close-on-press-escape="!saving"
      :show-close="!saving"
      :before-close="close"
      destroy-on-close
      @opened="formRef?.clearValidate()"
    >
      <el-form
        ref="formRef"
        :model="currentRow"
        :rules="rules"
        class="[&_.el-select]:w-full"
        label-position="top"
        :disabled="saving"
        @submit.prevent
      >
        <slot
          name="form"
          :row="currentRow"
          :mode="mode"
        />
      </el-form>
      <template #footer>
        <el-button
          :disabled="saving"
          @click="close()"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="optionsLoading || !!optionsError || !can(mode)"
          @click="submit"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
<script setup lang="ts" generic="T extends { id?: number }">
import { ref, useSlots } from "vue";
import { useRoute } from "vue-router";
import ProTable from "@/components/ProTable/index.vue";
import type { IListColumn, IListQueryOptions } from "@/typings/query";
import type { FormInstance, FormRules } from "element-plus";
import PageContainer from "@/components/PageContainer/index.vue";
import { useUiTokens } from "@/hooks/useUiTokens";
import { useCrud } from "@/hooks/useCrud";
import { useCrudDialog } from "@/hooks/useCrudDialog";
import { useAuthStore } from "@/stores/modules/auth";
import { TEMPLATE_DEMO } from "@/config/template";
import type { ICrudApi } from "@/typings/crud";
import type { TSearchStoreOptions } from "@/typings/search";
const props = defineProps<{
  title: string;
  tableKey?: string;
  entityName: string;
  description?: string;
  permission: string;
  api: ICrudApi<T>;
  createRow: () => T;
  rowLabel: (row: T) => string;
  rules: FormRules;
  optionsLoading?: boolean;
  optionsError?: string;
  searchStoreOptions?: TSearchStoreOptions;
  query?: IListQueryOptions;
  columns?: IListColumn<T>[];
}>();
const slots = useSlots();
const route = useRoute();
const auth = useAuthStore();
const can = (action: string) => auth.hasPermission(`${props.permission}.${action}`);
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
  removing,
  error,
  storageError,
  getList,
  search,
  reset,
  changeCurrent,
  changeSize,
  remove
} = crud;
const { visible, currentRow, mode, open, close, save } = useCrudDialog<T>({
  createRow: props.createRow,
  can,
  saving: () => saving.value,
  ready: () => !props.optionsLoading && !props.optionsError,
  save: crud.save
});
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
const formRef = ref<FormInstance>();
const submit = () => save(async () => (formRef.value ? formRef.value.validate().catch(() => false) : false));
const { tableWidths } = useUiTokens();
</script>
