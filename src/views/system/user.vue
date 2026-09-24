<template>
  <div>
    <el-button
      v-if="error"
      class="mb-lg"
      @click="reload"
    >
      重试加载角色选项
    </el-button>
    <CrudPage
      title="管理员管理"
      entity-name="管理员"
      description="创建管理账号并分配角色。演示模式新增账号仅用于展示，不参与登录。"
      permission="permission.user"
      :api="adminUserApi"
      :create-row="createRow"
      :row-label="row => row.username"
      :rules="rules"
      :options-loading="loading"
      :options-error="error"
    >
      <template #columns>
        <el-table-column
          prop="id"
          label="ID"
          :width="tableWidths.id"
        />
        <el-table-column
          prop="username"
          label="账号"
          :min-width="tableWidths.name"
        />
        <el-table-column
          label="角色"
          :min-width="tableWidths.code"
        >
          <template #default="{ row }">
            <div class="ui-row">
              <el-tag
                v-for="id in row.roleList"
                :key="id"
              >
                {{ options.find(item => item.id === id)?.roleName ?? `角色 ${id}` }}
              </el-tag>
              <span v-if="!row.roleList.length">未分配角色</span>
            </div>
          </template>
        </el-table-column>
      </template>
      <template #form="{ row, mode }">
        <el-form-item
          label="账号"
          prop="username"
        >
          <el-input
            v-model="row.username"
            :disabled="mode === 'edit'"
            maxlength="50"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item
          v-if="mode === 'add'"
          label="初始密码"
          prop="password"
        >
          <el-input
            v-model="row.password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item
          label="角色列表"
          prop="roleList"
        >
          <el-select
            v-model="row.roleList"
            multiple
            filterable
            placeholder="选择角色，留空表示无权限"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :value="item.id!"
              :label="item.roleName"
            />
          </el-select>
        </el-form-item>
      </template>
    </CrudPage>
  </div>
</template>
<script setup lang="ts" name="systemUser">
import { useUiTokens } from "@/hooks/useUiTokens";
import CrudPage from "@/components/CrudPage/index.vue";
import { adminUserApi, roleApi } from "@/api/modules/permission";
import { usePermissionOptions } from "@/hooks/usePermissionOptions";
import type { IAdminUser } from "@/typings/permission";
import type { FormRules } from "element-plus";
const { options, loading, error, reload } = usePermissionOptions(roleApi);
const createRow = (): IAdminUser => ({ username: "", password: "", roleList: [] });
const rules: FormRules = {
  username: [
    { required: true, pattern: /^[a-zA-Z][\w-]{2,49}$/, message: "账号为 3–50 位，以字母开头", trigger: "blur" }
  ],
  password: [{ required: true, min: 8, max: 64, message: "请输入 8–64 位初始密码", trigger: "blur" }]
};
const { tableWidths } = useUiTokens();
</script>
