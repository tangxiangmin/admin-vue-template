<template>
  <el-form
    :model="model"
    label-position="top"
    :disabled="disabled"
    @submit.prevent
  >
    <el-form-item label="名称">
      <el-input
        v-model="model.name"
        maxlength="80"
        show-word-limit
      />
    </el-form-item>
    <el-form-item label="备注">
      <el-input
        v-model="model.remark"
        type="textarea"
        :rows="3"
        maxlength="300"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
defineProps<{ model: { name: string; remark: string }; disabled: boolean }>();
</script>
