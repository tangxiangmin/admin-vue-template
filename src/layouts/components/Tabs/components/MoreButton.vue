<template>
  <el-dropdown
    ref="dropdown"
    trigger="click"
    class="tabs-more-menu"
    @visible-change="visible => $emit('visible-change', visible)"
  >
    <div
      class="more-button"
      tabindex="0"
      role="button"
      aria-label="当前标签操作"
    >
      <i class="i-ep-arrow-down" />
    </div>
    <template #dropdown><TabOperationMenu :tab="currentTab" /></template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { DropdownInstance } from "element-plus";
import { getPagePath } from "@/utils/pageRoute";
import { useTabsStore } from "@/stores/modules/tabs";
import TabOperationMenu from "./TabOperationMenu.vue";
const route = useRoute();
const tabs = useTabsStore();
const currentTab = computed(() => tabs.tabsMenuList.find(tab => tab.path === getPagePath(route)));
const dropdown = ref<DropdownInstance>();
defineEmits<{ "visible-change": [visible: boolean] }>();
const close = () => dropdown.value?.handleClose();
defineExpose({ close });
</script>
<style scoped lang="scss">
@use "../index";
</style>
