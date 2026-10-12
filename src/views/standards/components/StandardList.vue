<template>
  <CrudDrawerPage
    :title="title"
    :table-key="`standard:${route.path}:${mode}:${groupId ?? 'all'}`"
    entity-name="记录"
    description="本地内存数据。查询、详情、编辑、复制、删除共用同一套列表与抽屉能力。"
    permission="template.example"
    :api="standardDemoApi"
    :create-row="createRow"
    :copy-row="copyRow"
    :row-label="row => row.name"
    :rules="rules"
    :query="query"
    :columns="columns"
    :selectable="mode !== 'cards'"
  >
    <template
      v-if="mode === 'tree'"
      #aside="{ params, apply }"
    >
      <div class="ui-panel p-md">
        <div class="font-semibold mb-md">所属组织</div>
        <el-tree
          :data="tree"
          node-key="id"
          :current-node-key="params.groupIds?.[0] ?? 0"
          highlight-current
          default-expand-all
          @node-click="node => apply({ groupIds: node.id ? [node.id] : [], pageNum: 1 })"
        />
      </div>
    </template>
    <template #toolbar="{ params, selected }">
      <el-dropdown
        trigger="click"
        :disabled="exporting"
      >
        <el-button
          text
          circle
          :loading="exporting"
          aria-label="导出"
          title="导出"
        >
          <i
            v-if="!exporting"
            class="i-ep-download text-lg"
          />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              :disabled="exporting"
              @click="exportData('标准记录', columns, () => exportStandardRows(params))"
            >
              导出筛选结果
            </el-dropdown-item>
            <el-dropdown-item
              v-if="mode !== 'cards'"
              :disabled="exporting || !selected.length"
              @click="exportData('已选记录', columns, async () => selected)"
            >
              导出已选{{ selected.length ? `（${selected.length}）` : "" }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <template
      v-if="mode === 'cards'"
      #list="{ rows, open, remove, busy }"
    >
      <div class="standard-cards p-md">
        <el-card
          v-for="row in rows"
          :key="row.id"
          shadow="never"
        >
          <template #header>
            <div class="ui-between">
              <el-button
                link
                type="primary"
                :disabled="busy"
                @click="open('detail', row)"
              >
                {{ row.name }}
              </el-button>
              <OperateButtons :items="cardOperations(row, open, remove, busy)" />
            </div>
          </template>
          <el-descriptions :column="1">
            <el-descriptions-item label="编码">{{ row.code }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ row.status === 1 ? "启用" : "停用" }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ row.remark || "—" }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-empty
          v-if="!rows.length"
          description="暂无符合条件的记录"
        />
      </div>
    </template>
    <template #drawer-title="{ layer }">
      <template v-if="layer.mode === 'detail'">
        <span>{{ layer.record.name }}</span>
        <el-tag
          class="ml-sm"
          :type="layer.record.status === 1 ? 'success' : 'info'"
        >
          {{ layer.record.status === 1 ? "启用" : "停用" }}
        </el-tag>
      </template>
      <template v-else>{{ layer.title }}</template>
    </template>
    <template #detail="{ row }">
      <StandardDetailContent :record="row" />
      <el-button
        class="mt-md"
        @click="copyDetailLink(row)"
      >
        复制详情链接
      </el-button>
    </template>
    <template #form="{ row, mode: formMode, actions }">
      <StandardFormContent
        :model="row"
        :mode="formMode"
      />
      <el-button
        @click="
          actions.openRoute('关联记录选择器', {
            apply: (value: string) => {
              row.remark = value;
              actions.markTouched();
            }
          })
        "
      >
        从内存表格选择备注
      </el-button>
    </template>
    <template #drawer="{ route, params, actions }">
      <StandardRelatedPicker
        v-if="route === '关联记录选择器' && params"
        :apply="value => applyPicked(params, value)"
        :actions="actions"
      />
    </template>
  </CrudDrawerPage>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormRules } from "element-plus";
import CrudDrawerPage from "@/components/CrudDrawerPage/index.vue";
import OperateButtons from "@/components/OperateButtons/index.vue";
import { useTableExport } from "@/hooks/useTableExport";
import { useAuthStore } from "@/stores/modules/auth";
import { standardDemoApi, exportStandardRows, standardGroups } from "@/demo/standards";
import type { IStandardTableModel } from "@/typings/query";
import type { IStandardRecord } from "@/typings/standard";
import { decodeInboundStandardQuery } from "@/utils/queryParams";
import { createStandardTableModel, createStandardQuery } from "../fields";
import StandardRelatedPicker from "./StandardRelatedPicker.vue";
import StandardFormContent from "./StandardFormContent.vue";
import StandardDetailContent from "./StandardDetailContent.vue";
const props = withDefaults(
  defineProps<{
    mode?: "table" | "tree" | "cards";
    groupId?: number;
    title: string;
    inbound?: boolean;
    customizeTableModel?: (model: IStandardTableModel<IStandardRecord>) => void;
  }>(),
  { mode: "table" }
);
const model = createStandardTableModel();
props.customizeTableModel?.(model);
const columns = reactive(Object.values(model.fields));
const query = createStandardQuery(props.groupId ? [props.groupId] : undefined);
query.fields = Object.values(model.queryFields);
if (props.inbound) query.inboundQuery = { keys: ["keyword", "status", "groupId"], decode: decodeInboundStandardQuery };
const tree = [{ id: 0, label: "全部组织", children: standardGroups }];
function localNow() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
const createRow = (): IStandardRecord => ({
  name: "",
  code: "",
  status: 1,
  groupId: props.groupId ?? 1,
  createdAt: localNow(),
  remark: ""
});
const copyRow = (row: IStandardRecord): IStandardRecord => ({
  name: `${row.name}副本`,
  code: `${row.code}-COPY`,
  status: row.status,
  groupId: row.groupId,
  createdAt: createRow().createdAt,
  remark: row.remark
});
const rules: FormRules = {
  name: [{ required: true, whitespace: true, message: "请输入名称", trigger: "blur" }],
  code: [{ required: true, whitespace: true, message: "请输入编码", trigger: "blur" }],
  groupId: [{ required: true, message: "请选择组织", trigger: "change" }]
};
const { exporting, exportData } = useTableExport<IStandardRecord>();
const auth = useAuthStore();
const route = useRoute(),
  router = useRouter();
async function copyDetailLink(row: IStandardRecord) {
  try {
    const href = router.resolve({
      path: route.path,
      query: { ...route.query, drawer: "detail", id: String(row.id) },
      hash: route.hash
    }).href;
    await navigator.clipboard.writeText(new URL(href, window.location.href).href);
    ElMessage.success("详情链接已复制");
  } catch {
    ElMessage.error("链接复制失败，请检查浏览器剪贴板权限");
  }
}
function applyPicked(params: Record<string, unknown>, value: string) {
  if (typeof params.apply === "function") params.apply(value);
}
function cardOperations(
  row: IStandardRecord,
  open: (mode: "edit" | "copy", row: IStandardRecord) => unknown,
  remove: (row: IStandardRecord) => unknown,
  busy: boolean
) {
  return [
    {
      key: "edit",
      label: "编辑",
      icon: "i-ep-edit",
      show: auth.hasPermission("template.example.edit"),
      disabled: busy,
      run: () => open("edit", row)
    },
    {
      key: "copy",
      label: "复制新增",
      icon: "i-ep-copy-document",
      show: auth.hasPermission("template.example.add"),
      disabled: busy,
      run: () => open("copy", row)
    },
    {
      key: "export",
      label: "导出",
      children: [
        {
          key: "export-full",
          label: "完整字段",
          disabled: exporting.value,
          run: () => exportData(row.code, columns, async () => [row])
        },
        {
          key: "export-summary",
          label: "名称与编码",
          disabled: exporting.value,
          run: () =>
            exportData(
              `${row.code}-摘要`,
              columns.filter(column => column.key === "name" || column.key === "code"),
              async () => [row]
            )
        }
      ]
    },
    {
      key: "remove",
      label: "删除",
      danger: true,
      show: auth.hasPermission("template.example.remove"),
      disabled: busy,
      run: () => remove(row)
    }
  ];
}
</script>
<style scoped>
.standard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--ui-space-md);
}
</style>
