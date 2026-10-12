<template>
  <el-tabs v-model="section">
    <el-tab-pane
      label="基础信息"
      name="base"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="model.name"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        label="编码"
        prop="code"
      >
        <el-input
          v-model="model.code"
          :disabled="mode === 'edit'"
          maxlength="40"
        />
      </el-form-item>
      <el-form-item
        label="所属组织"
        prop="groupId"
      >
        <el-select v-model="model.groupId">
          <el-option
            v-for="group in standardGroups"
            :key="group.id"
            :label="group.label"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-radio-group v-model="model.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane
      label="备注信息"
      name="remark"
    >
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="model.remark"
          type="textarea"
          :rows="4"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { standardGroups } from "@/demo/standards";
import type { IStandardRecord } from "@/typings/standard";
defineProps<{ model: IStandardRecord; mode: string }>();
const section = ref("base");
</script>
