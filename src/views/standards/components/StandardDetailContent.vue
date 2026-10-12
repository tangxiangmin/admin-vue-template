<template>
  <el-tabs v-model="section">
    <el-tab-pane
      label="基础信息"
      name="base"
    >
      <el-descriptions
        :column="1"
        border
      >
        <el-descriptions-item
          v-for="column in columns.filter(column => column.key !== 'remark')"
          :key="column.key"
          :label="column.label"
        >
          {{ column.format ? column.format(record) : record[column.key] }}
        </el-descriptions-item>
      </el-descriptions>
    </el-tab-pane>
    <el-tab-pane
      label="备注信息"
      name="remark"
    >
      <el-descriptions
        :column="1"
        border
      >
        <el-descriptions-item label="备注">{{ record.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { createStandardColumns } from "../fields";
import type { IStandardRecord } from "@/typings/standard";
defineProps<{ record: IStandardRecord }>();
const columns = createStandardColumns(),
  section = ref("base");
</script>
