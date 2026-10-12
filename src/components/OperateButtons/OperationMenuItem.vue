<template>
  <template v-if="item.show !== false">
    <el-sub-menu
      v-if="item.children?.some(child => child.show !== false)"
      :index="item.key"
      :disabled="item.disabled"
    >
      <template #title>{{ item.label }}</template>
      <OperationMenuItem
        v-for="child in item.children"
        :key="child.key"
        :item="child"
      />
    </el-sub-menu>
    <el-menu-item
      v-else
      :index="item.key"
      :disabled="item.disabled"
      @click="item.run?.()"
    >
      <span :style="item.danger ? { color: 'var(--el-color-danger)' } : undefined">{{ item.label }}</span>
    </el-menu-item>
  </template>
</template>
<script setup lang="ts">
import type { IOperation } from "@/typings/operation";
defineProps<{ item: IOperation }>();
</script>
