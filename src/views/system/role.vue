<template>
  <div>
    <el-button
      v-if="error"
      class="mb-lg"
      @click="reload"
    >
      重试加载权限选项
    </el-button>
    <CrudPage
      title="角色管理"
      entity-name="角色"
      description="通过角色分配页面和操作权限。"
      permission="permission.role"
      :api="roleApi"
      :create-row="createRow"
      :row-label="row => row.roleName"
      :rules="rules"
      :options-loading="loading"
      :options-error="error"
    >
      <template #columns>
        <el-table-column
          prop="roleName"
          label="角色名称"
          :min-width="tableWidths.name"
        />
        <el-table-column
          prop="roleKey"
          label="角色编码"
          :min-width="tableWidths.name"
        />
        <el-table-column
          label="权限数量"
          :width="tableWidths.status"
        >
          <template #default="{ row }">{{ row.privilegeIdList.length }}</template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          :min-width="tableWidths.text"
          show-overflow-tooltip
        />
      </template>
      <template #form="{ row, mode }">
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input
            v-model="row.roleName"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item
          label="角色编码"
          prop="roleKey"
        >
          <el-input
            v-model="row.roleKey"
            :disabled="mode === 'edit'"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="row.description"
            type="textarea"
            :rows="3"
            maxlength="300"
          />
        </el-form-item>
        <el-form-item
          label="权限列表"
          prop="privilegeIdList"
        >
          <el-select
            v-model="row.privilegeIdList"
            multiple
            filterable
            placeholder="选择权限，留空表示不授予权限"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :value="item.id!"
              :label="`${item.privilegeName} (${item.privilegeKey})`"
            />
          </el-select>
        </el-form-item>
      </template>
    </CrudPage>
  </div>
</template>
<script setup lang="ts" name="systemRole">
import { useUiTokens } from "@/hooks/useUiTokens";
import CrudPage from "@/components/CrudPage/index.vue";
import { roleApi, privilegeApi } from "@/api/modules/permission";
import { usePermissionOptions } from "@/hooks/usePermissionOptions";
import type { IRole } from "@/typings/permission";
import type { FormRules } from "element-plus";
const { options, loading, error, reload } = usePermissionOptions(privilegeApi);
const createRow = (): IRole => ({ roleName: "", roleKey: "", description: "", privilegeIdList: [] });
const rules: FormRules = {
  roleName: [{ required: true, whitespace: true, message: "请输入角色名称", trigger: "blur" }],
  roleKey: [
    {
      required: true,
      pattern: /^[a-zA-Z][\w-]*$/,
      message: "编码以字母开头，仅包含字母、数字、下划线或短横线",
      trigger: "blur"
    }
  ]
};
const { tableWidths } = useUiTokens();
</script>
