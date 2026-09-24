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
        :disabled="optionsLoading || !!optionsError"
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
    <div class="ui-panel overflow-hidden">
      <div class="ui-between p-md sm:px-lg border-b border-b-solid border-ui-border">
        <div class="ui-row">
          <span class="text-md font-semibold">全部{{ entityName }}</span>
          <span class="text-xs bg-ui-soft text-ui-muted px-xs py-1 rounded-sm">{{ total }}</span>
        </div>
        <span class="hidden sm:inline text-sm text-ui-muted">统一管理与维护</span>
      </div>
      <div class="ui-between p-md sm:px-lg">
        <el-form
          inline
          class="ui-row [&>.el-form-item]:m-0"
          @submit.prevent="search"
        >
          <el-form-item>
            <el-input
              class="w-filter max-w-full"
              v-model="keyword"
              :placeholder="`搜索${entityName}…`"
              :aria-label="`搜索${entityName}`"
              clearable
              @clear="search"
            >
              <template #prefix><i class="i-ep-search" /></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              native-type="submit"
              :loading="loading"
            >
              查询
            </el-button>
            <el-button
              v-if="keyword"
              text
              @click="reset"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <el-button
          :loading="loading"
          aria-label="刷新列表"
          @click="getList"
        >
          <i class="i-ep-refresh" />
          <span>刷新</span>
        </el-button>
      </div>
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
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        :empty-text="error ? '加载失败，请点击刷新重试' : '暂无数据'"
      >
        <slot name="columns" />
        <el-table-column
          v-if="can('edit') || (api.remove && can('remove'))"
          label="操作"
          fixed="right"
          :width="tableWidths.actions"
        >
          <template #default="{ row }">
            <el-button
              v-if="can('edit')"
              link
              type="primary"
              :disabled="optionsLoading || !!optionsError"
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
        </el-table-column>
      </el-table>
      <div class="ui-between p-md sm:px-lg overflow-x-auto">
        <span class="text-sm text-ui-muted">共 {{ total }} 条记录</span>
        <el-pagination
          background
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next"
          @current-change="changeCurrent"
          @size-change="changeSize"
        />
      </div>
    </div>
    <el-dialog
      v-model="formDialogVisible"
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
        class="[&_.el-select]:w-full"
        :rules="rules"
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
import { useUiTokens } from "@/hooks/useUiTokens";
import PageContainer from "@/components/PageContainer/index.vue";
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { TEMPLATE_DEMO } from "@/config/template";
import { useCrud } from "@/hooks/useCrud";
import { useAuthStore } from "@/stores/modules/auth";
import type { ICrudApi } from "@/typings/crud";
const props = defineProps<{
  title: string;
  entityName: string;
  description?: string;
  permission: string;
  api: ICrudApi<T>;
  createRow: () => T;
  rowLabel: (row: T) => string;
  rules: FormRules;
  optionsLoading?: boolean;
  optionsError?: string;
}>();
const auth = useAuthStore();
const can = (action: string) => auth.hasPermission(`${props.permission}.${action}`);
const formRef = ref<FormInstance>();
const {
  list,
  currentRow,
  page,
  pageSize,
  total,
  keyword,
  loading,
  saving,
  removing,
  error,
  formDialogVisible,
  mode,
  getList,
  search,
  reset,
  changeCurrent,
  changeSize,
  open,
  close,
  save,
  remove
} = useCrud<T>({ api: props.api, createRow: props.createRow, rowLabel: props.rowLabel, can });
onBeforeRouteLeave(async () => {
  if (!formDialogVisible.value) return true;
  await close();
  return !formDialogVisible.value;
});
const submit = () => save(async () => (formRef.value ? formRef.value.validate().catch(() => false) : false));
const { tableWidths } = useUiTokens();
</script>
