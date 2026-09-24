<template>
  <PageContainer
    title="路由搜索记录"
    description="输入的筛选条件会保存在当前账号、当前页面的记录中，离开页面再返回或刷新后恢复。"
  >
    <el-alert
      v-if="storageError"
      :title="storageError"
      type="warning"
      :closable="false"
    />
    <PageGrid>
      <ContentCard
        title="筛选条件"
        description="重置会整体恢复默认值，包括数组和嵌套对象。页面展示静态示例数据，不请求业务接口。"
      >
        <el-form
          label-position="top"
          @submit.prevent="applySearch"
        >
          <el-form-item label="名称关键词">
            <el-input
              v-model="searchParams.keyword"
              placeholder="例如：角色"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchParams.status">
              <el-option
                label="全部"
                value="all"
              />
              <el-option
                label="启用"
                value="enabled"
              />
              <el-option
                label="停用"
                value="disabled"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属模块">
            <el-checkbox-group v-model="searchParams.modules">
              <el-checkbox value="权限">权限</el-checkbox>
              <el-checkbox value="模板">模板</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <div class="ui-row">
            <el-button
              type="primary"
              native-type="submit"
            >
              查询
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <router-link to="/examples/storage">前往其他示例，再返回</router-link>
          </div>
        </el-form>
        <el-table
          :data="filteredRows"
          empty-text="没有符合条件的记录"
        >
          <el-table-column
            prop="name"
            label="名称"
          />
          <el-table-column
            prop="module"
            label="模块"
          />
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === "enabled" ? "启用" : "停用" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </ContentCard>
      <ContentCard
        title="当前记录"
        description="持久化的是输入草稿；查询按钮将草稿应用到列表。"
      >
        <CodeBlock>{{ JSON.stringify(searchParams, null, 2) }}</CodeBlock>
        <el-text
          tag="p"
          type="info"
        >
          存储键：{{ storageKey }}
        </el-text>
        <el-text tag="h3">调用方式</el-text>
        <CodeBlock>{{ usage }}</CodeBlock>
      </ContentCard>
    </PageGrid>
  </PageContainer>
</template>
<script setup lang="ts" name="exampleSearchRecord">
import PageContainer from "@/components/PageContainer/index.vue";
import PageGrid from "@/components/PageGrid/index.vue";
import ContentCard from "@/components/ContentCard/index.vue";
import CodeBlock from "@/components/CodeBlock/index.vue";
import { computed, ref } from "vue";
import { useRouteSearchRecord } from "@/hooks/useRouteSearchRecord";
interface ISearchParams {
  keyword: string;
  status: "all" | "enabled" | "disabled";
  modules: string[];
}
const defaults = (): ISearchParams => ({ keyword: "", status: "all", modules: [] });
function validate(value: unknown): value is ISearchParams {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.keyword === "string" &&
    typeof record.status === "string" &&
    ["all", "enabled", "disabled"].includes(record.status) &&
    Array.isArray(record.modules) &&
    record.modules.every(item => item === "权限" || item === "模板")
  );
}
const { searchParams, reset, storageKey, storageError } = useRouteSearchRecord(defaults, { validate });
const applied = ref<ISearchParams>({ ...searchParams.value, modules: [...searchParams.value.modules] });
const rows = [
  { name: "权限点管理", module: "权限", status: "enabled" },
  { name: "角色管理", module: "权限", status: "enabled" },
  { name: "管理员管理", module: "权限", status: "disabled" },
  { name: "CRUD 页面模板", module: "模板", status: "enabled" }
];
const filteredRows = computed(() =>
  rows.filter(
    row =>
      row.name.includes(applied.value.keyword.trim()) &&
      (applied.value.status === "all" || row.status === applied.value.status) &&
      (!applied.value.modules.length || applied.value.modules.includes(row.module))
  )
);
function applySearch() {
  applied.value = { ...searchParams.value, modules: [...searchParams.value.modules] };
}
function resetSearch() {
  reset();
  applySearch();
}
const usage = `const { searchParams, reset } = useRouteSearchRecord(
  () => ({ keyword: '', status: 'all', modules: [] }),
  { validate, version: 1 }
)
// 模板直接绑定 searchParams.keyword
// 脚本通过 searchParams.value.keyword 读取
// reset() 整体替换为新的默认对象`;
</script>
