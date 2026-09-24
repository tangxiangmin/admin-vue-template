<template>
  <el-config-provider
    :locale="zhCn"
    :size="assemblySize"
    :button="buttonConfig"
  >
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { computed, watch } from "vue";

import { UI_CONFIG } from "@/config/ui";
import { useTheme } from "@/hooks/useTheme";
import { useGlobalStore } from "@/stores/modules/global";

const globalStore = useGlobalStore();

// 字号在应用根节点统一同步，弹窗和抽屉同样继承。
watch(
  () => globalStore.fontSize,
  value => {
    const size =
      typeof value === "number" && Number.isFinite(value)
        ? Math.min(UI_CONFIG.font.maxSize, Math.max(UI_CONFIG.font.minSize, Math.round(value)))
        : UI_CONFIG.font.defaultSize;
    if (value !== size) globalStore.setGlobalState("fontSize", size);
    document.documentElement.style.setProperty("--ui-font-size-base", `${size}px`);
  },
  { immediate: true }
);

// init theme
const { initTheme } = useTheme();
initTheme();

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize || UI_CONFIG.provider.size);

// element button config
const buttonConfig = UI_CONFIG.provider.button;
</script>
