<template>
  <div class="ui-stack">
    <div class="ui-row">
      <span class="text-sm text-ui-muted">搜索条件保存方式</span>
      <el-select
        v-model="searchStoreType"
        class="w-filter max-w-full"
        aria-label="搜索条件保存方式"
      >
        <el-option
          label="URL（可复制链接）"
          value="url"
        />
        <el-option
          label="本次会话（刷新保留）"
          value="sessionStorage"
        />
        <el-option
          label="当前页面（刷新清空）"
          value="memory"
        />
        <el-option
          label="不持久化"
          value="none"
        />
      </el-select>
    </div>
    <CrudDrawerPage
      title="表格与抽屉交互"
      entity-name="记录"
      description="点击行查看详情；支持详情内编辑、复制新增、选择器叠层和未保存修改提示。"
      permission="template.example"
      :api="api"
      :create-row="createRow"
      :copy-row="copyRow"
      :row-label="row => row.name"
      :rules="rules"
      :search-store-options="searchStoreOptions"
    >
      <template #columns>
        <el-table-column
          prop="name"
          label="名称"
          :min-width="tableWidths.name"
        />
        <el-table-column
          label="状态"
          :width="tableWidths.status"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? "启用" : "停用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          :min-width="tableWidths.text"
          show-overflow-tooltip
        />
      </template>
      <template #detail="{ row }">
        <el-descriptions
          :column="1"
          border
        >
          <el-descriptions-item label="名称">{{ row.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ row.status === 1 ? "启用" : "停用" }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ row.remark || "未填写" }}</el-descriptions-item>
        </el-descriptions>
        <el-button
          class="mt-md"
          @click="openDetailLink(row)"
        >
          通过链接打开详情
        </el-button>
      </template>
      <template #drawer="{ route, params, actions }">
        <ExampleRemarkPicker
          v-if="route === '备注选择器' && params"
          :apply-value="getRemarkApply(params)"
          :actions="actions"
        />
      </template>
      <template #form="{ row, actions }">
        <el-form-item
          label="名称"
          prop="name"
        >
          <el-input
            v-model="row.name"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="row.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="row.remark"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        <el-button @click="actions.openRoute('备注选择器', { applyValue: (value: string) => (row.remark = value) })">
          选择常用备注
        </el-button>
      </template>
    </CrudDrawerPage>
  </div>
</template>
<script setup lang="ts" name="templateCrudDrawer">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LocationQueryRaw } from "vue-router";
import ExampleRemarkPicker from "./components/ExampleRemarkPicker.vue";
import { useUiTokens } from "@/hooks/useUiTokens";
import CrudDrawerPage from "@/components/CrudDrawerPage/index.vue";
import { demoDrawerExampleApi } from "@/demo/template";
import type { IExample } from "@/typings/example";
import { TEMPLATE_DEMO } from "@/config/template";
import type { ICrudApi } from "@/typings/crud";
import type { TSearchStoreOptions } from "@/typings/search";
import type { FormRules } from "element-plus";
const unavailable = async (): Promise<never> => {
  throw new Error("请先为业务模板接入真实 API");
};
const api: ICrudApi<IExample> = TEMPLATE_DEMO
  ? demoDrawerExampleApi
  : { getList: unavailable, add: unavailable, edit: unavailable, remove: unavailable, getDetail: unavailable };
const router = useRouter();
const route = useRoute();
const searchStoreType = computed({
  get(): "url" | "sessionStorage" | "memory" | "none" {
    const type = route.query["__query_state__:store"];
    return type === "sessionStorage" || type === "memory" || type === "none" ? type : "url";
  },
  set(type: "url" | "sessionStorage" | "memory" | "none") {
    const query: LocationQueryRaw = { ...route.query, "__query_state__:store": type === "url" ? undefined : type };
    delete query.__query_state__;
    void router.replace({ path: route.path, query, hash: route.hash });
  }
});
const searchStoreOptions = computed<TSearchStoreOptions>(() => {
  const type = searchStoreType.value;
  return type === "sessionStorage" || type === "memory" ? { type, key: "drawer-example" } : { type };
});
function getRemarkApply(params: Record<string, unknown>) {
  const applyValue = params.applyValue;
  return (value: string) => {
    if (typeof applyValue === "function") applyValue(value);
  };
}
function openDetailLink(row: IExample) {
  router.push({
    path: "/templates/crud-drawer",
    query: { ...route.query, drawer: "detail", id: String(row.id) },
    hash: route.hash
  });
}
const copyRow = (row: IExample): IExample => ({ name: `${row.name}副本`, status: row.status, remark: row.remark });
const createRow = (): IExample => ({ name: "", status: 1, remark: "" });
const rules: FormRules = { name: [{ required: true, whitespace: true, message: "请输入名称", trigger: "blur" }] };
const { tableWidths } = useUiTokens();
</script>
