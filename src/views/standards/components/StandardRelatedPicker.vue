<template>
  <div class="ui-stack">
    <el-alert
      title="抽屉内表格使用独立 memory 查询态，分页在抽屉内显示。"
      type="info"
      :closable="false"
    />
    <QueryListContainer
      :fields="query.fields"
      :draft="draft"
      :applied="requestParams"
      :loading="loading"
      @search="search"
      @reset="reset"
      @apply="applyQuery"
    />
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
    />
    <el-table
      v-loading="loading"
      :data="list"
      row-key="id"
      highlight-current-row
      @row-click="select"
    >
      <!-- @vue-generic {IStandardRecord} -->
      <el-table-column
        label="选择"
        width="75"
      >
        <template #default="{ row }">
          <el-radio
            v-model="selectedId"
            :value="row.id"
            :aria-label="`选择${row.name}`"
            @change="select(row)"
          >
            <span />
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        min-width="140"
      />
      <el-table-column
        prop="code"
        label="编码"
        min-width="120"
      />
    </el-table>
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="changeCurrent"
    />
    <el-button
      type="primary"
      :disabled="!selectedName || loading"
      @click="confirm"
    >
      应用并返回
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { onScopeDispose, ref } from "vue";
import QueryListContainer from "@/components/QueryListContainer/index.vue";
import { useQueryListRequest } from "@/hooks/useQueryListRequest";
import { standardDemoApi } from "@/demo/standards";
import type { IFormLeaveEntry } from "@/typings/crud";
import type { IStandardRecord } from "@/typings/standard";
import type { IListQueryOptions } from "@/typings/query";
interface IPickerActions {
  close: () => unknown;
  registerLeave: (entry: IFormLeaveEntry) => () => void;
}
const props = defineProps<{ apply: (value: string) => void; actions: IPickerActions }>();
const query: IListQueryOptions = {
  fields: [
    {
      key: "keyword",
      label: "名称",
      kind: "text",
      inline: true,
      trigger: "debounced-change",
      placeholder: "搜索名称、编码"
    }
  ]
};
const {
  draft,
  requestParams,
  list,
  total,
  page,
  pageSize,
  loading,
  error,
  search,
  reset,
  apply: applyQuery,
  changeCurrent
} = useQueryListRequest({
  request: standardDemoApi.getList,
  query,
  searchStoreOptions: () => ({ type: "memory", key: "standard-related-picker" })
});
const selectedId = ref<number>(),
  selectedName = ref("");
let applied = false;
onScopeDispose(
  props.actions.registerLeave({
    isDirty: () => !applied && Boolean(selectedName.value),
    isBlocked: () => loading.value
  })
);
function select(row: IStandardRecord) {
  selectedId.value = row.id;
  selectedName.value = row.name;
}
function confirm() {
  props.apply(`关联记录：${selectedName.value}`);
  applied = true;
  props.actions.close();
}
</script>
