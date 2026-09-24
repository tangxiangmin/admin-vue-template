<template>
  <CrudPage
    title="权限点管理"
    entity-name="权限点"
    description="定义页面和操作使用的权限编码。"
    permission="permission.privilege"
    :api="privilegeApi"
    :create-row="createRow"
    :row-label="row => row.privilegeName"
    :rules="rules"
  >
    <template #columns>
      <el-table-column
        prop="privilegeName"
        label="权限名称"
        :min-width="tableWidths.name"
      />
      <el-table-column
        prop="privilegeKey"
        label="权限编码"
        :min-width="tableWidths.code"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <CodeBlock inline>{{ row.privilegeKey }}</CodeBlock>
        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        :width="tableWidths.status"
      >
        <template #default="{ row }">
          <el-tag :type="row.privilegeType === 0 ? 'primary' : 'info'">
            {{ row.privilegeType === 0 ? "页面" : "操作" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="privilegeUrl"
        label="关联路径"
        :min-width="tableWidths.name"
        show-overflow-tooltip
      />
      <el-table-column
        prop="content"
        label="备注"
        :min-width="tableWidths.name"
        show-overflow-tooltip
      />
    </template>
    <template #form="{ row, mode }">
      <el-form-item
        label="权限名称"
        prop="privilegeName"
      >
        <el-input
          v-model="row.privilegeName"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item
        label="权限编码"
        prop="privilegeKey"
      >
        <el-input
          v-model="row.privilegeKey"
          :disabled="mode === 'edit'"
          placeholder="如 permission.role.view"
          maxlength="100"
        />
      </el-form-item>
      <el-form-item
        label="类型"
        prop="privilegeType"
      >
        <el-radio-group v-model="row.privilegeType">
          <el-radio :value="0">页面</el-radio>
          <el-radio :value="1">操作</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="关联路径"
        prop="privilegeUrl"
      >
        <el-input
          v-model="row.privilegeUrl"
          placeholder="可选，如 /system/roles"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="content"
      >
        <el-input
          v-model="row.content"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>
    </template>
  </CrudPage>
</template>
<script setup lang="ts" name="systemPrivilege">
import { useUiTokens } from "@/hooks/useUiTokens";
import CodeBlock from "@/components/CodeBlock/index.vue";
import CrudPage from "@/components/CrudPage/index.vue";
import { privilegeApi } from "@/api/modules/permission";
import type { IPrivilege } from "@/typings/permission";
import type { FormRules } from "element-plus";
const createRow = (): IPrivilege => ({
  privilegeName: "",
  privilegeKey: "",
  privilegeType: 0,
  privilegeUrl: "",
  content: ""
});
const rules: FormRules = {
  privilegeName: [{ required: true, whitespace: true, message: "请输入权限名称", trigger: "blur" }],
  privilegeKey: [
    {
      required: true,
      pattern: /^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/,
      message: "请输入以点分隔的权限编码",
      trigger: "blur"
    }
  ]
};
const { tableWidths } = useUiTokens();
</script>
