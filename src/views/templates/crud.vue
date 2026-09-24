<template>
  <CrudPage
    title="CRUD 页面模板"
    entity-name="记录"
    description="包含查询、分页、新增、编辑、删除及表单校验，可作为业务页面起点。"
    permission="template.example"
    :api="api"
    :create-row="createRow"
    :row-label="row => row.name"
    :rules="rules"
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
    <template #form="{ row }">
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
    </template>
  </CrudPage>
</template>
<script setup lang="ts" name="templateCrud">
import { useUiTokens } from "@/hooks/useUiTokens";
import CrudPage from "@/components/CrudPage/index.vue";
import { demoExampleApi } from "@/demo/template";
import type { IExample } from "@/typings/example";
import { TEMPLATE_DEMO } from "@/config/template";
import type { ICrudApi } from "@/typings/crud";
import type { FormRules } from "element-plus";
const unavailable = async (): Promise<never> => {
  throw new Error("请先为业务模板接入真实 API");
};
const api: ICrudApi<IExample> = TEMPLATE_DEMO
  ? demoExampleApi
  : { getList: unavailable, add: unavailable, edit: unavailable, remove: unavailable };
const createRow = (): IExample => ({ name: "", status: 1, remark: "" });
const rules: FormRules = { name: [{ required: true, whitespace: true, message: "请输入名称", trigger: "blur" }] };
const { tableWidths } = useUiTokens();
</script>
