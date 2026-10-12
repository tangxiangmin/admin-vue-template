<template>
  <el-dropdown-menu>
    <el-dropdown-item
      :disabled="!target"
      @click="refresh"
    >
      <el-icon><i class="i-ep-refresh" /></el-icon>
      刷新
    </el-dropdown-item>
    <el-dropdown-item
      :disabled="!target"
      @click="maximize"
    >
      <el-icon><i class="i-ep-full-screen" /></el-icon>
      最大化
    </el-dropdown-item>
    <el-dropdown-item
      divided
      :disabled="!canClose"
      @click="close"
    >
      <el-icon><i class="i-ep-remove" /></el-icon>
      {{ context ? "关闭此标签" : "关闭当前" }}
    </el-dropdown-item>
    <el-dropdown-item
      :disabled="!canCloseLeft"
      @click="closeLeft"
    >
      <el-icon><i class="i-ep-d-arrow-left" /></el-icon>
      关闭左侧
    </el-dropdown-item>
    <el-dropdown-item
      :disabled="!canCloseRight"
      @click="closeRight"
    >
      <el-icon><i class="i-ep-d-arrow-right" /></el-icon>
      关闭右侧
    </el-dropdown-item>
    <el-dropdown-item
      divided
      :disabled="!canCloseOther"
      @click="closeOther"
    >
      <el-icon><i class="i-ep-circle-close" /></el-icon>
      关闭其它
    </el-dropdown-item>
    <el-dropdown-item
      :disabled="!canCloseAll"
      @click="closeAll"
    >
      <el-icon><i class="i-ep-folder-delete" /></el-icon>
      关闭所有
    </el-dropdown-item>
  </el-dropdown-menu>
</template>
<script setup lang="ts">
import type { ITabMenu } from "@/typings/store";
import { useTabActions } from "../useTabActions";
const props = defineProps<{ tab?: ITabMenu; context?: boolean }>();
const {
  target,
  canClose,
  canCloseLeft,
  canCloseRight,
  canCloseOther,
  canCloseAll,
  refresh,
  maximize,
  close,
  closeLeft,
  closeRight,
  closeOther,
  closeAll
} = useTabActions(() => props.tab);
</script>
