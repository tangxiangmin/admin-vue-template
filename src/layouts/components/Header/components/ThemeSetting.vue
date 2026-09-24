<template>
  <button
    class="ui-icon-button"
    type="button"
    aria-label="主题与布局设置"
    title="主题与布局设置"
    @click="uiStore.themeDrawerVisible = true"
  >
    <i
      class="i-ep-setting"
      aria-hidden="true"
    ></i>
  </button>
</template>

<script setup lang="ts">
import { useUiStore } from "@/stores/modules/ui";

const uiStore = useUiStore();
</script>
