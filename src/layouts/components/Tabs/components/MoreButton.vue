<template>
  <el-dropdown
    trigger="click"
    :teleported="false"
  >
    <div class="more-button">
      <i class="i-ep-arrow-down"></i>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="refresh">
          <el-icon><i class="i-ep-refresh" /></el-icon>
          刷新
        </el-dropdown-item>
        <el-dropdown-item @click="maximize">
          <el-icon><i class="i-ep-full-screen" /></el-icon>
          最大化
        </el-dropdown-item>
        <el-dropdown-item
          divided
          @click="closeCurrentTab"
        >
          <el-icon><i class="i-ep-remove" /></el-icon>
          关闭当前
        </el-dropdown-item>
        <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'left')">
          <el-icon><i class="i-ep-d-arrow-left" /></el-icon>
          关闭左侧
        </el-dropdown-item>
        <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'right')">
          <el-icon><i class="i-ep-d-arrow-right" /></el-icon>
          关闭右侧
        </el-dropdown-item>
        <el-dropdown-item
          divided
          @click="tabStore.closeMultipleTab(route.fullPath)"
        >
          <el-icon><i class="i-ep-circle-close"></i></el-icon>
          关闭其它
        </el-dropdown-item>
        <el-dropdown-item @click="closeAllTab">
          <el-icon><i class="i-ep-folder-delete" /></el-icon>
          关闭所有
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { inject, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

import { HOME_URL } from "@/config";
import { useGlobalStore } from "@/stores/modules/global";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import { useTabsStore } from "@/stores/modules/tabs";

const route = useRoute();
const router = useRouter();
const tabStore = useTabsStore();
const globalStore = useGlobalStore();
const keepAliveStore = useKeepAliveStore();

// refresh current page
const refreshCurrentPage = inject<(val: boolean) => void>("refresh");

const refresh = () => {
  setTimeout(() => {
    if (route.meta.isKeepAlive) {
      keepAliveStore.removeKeepAliveName(route.fullPath as string);
    }

    if (refreshCurrentPage) {
      refreshCurrentPage(false);
      nextTick(() => {
        if (route.meta.isKeepAlive) {
          keepAliveStore.addKeepAliveName(route.fullPath as string);
        }
        refreshCurrentPage(true);
      });
    }
  }, 0);
};

// maximize current page
const maximize = () => {
  globalStore.setGlobalState("maximize", true);
};

// Close Current
const closeCurrentTab = () => {
  if (route.meta.isAffix) return;
  tabStore.removeTabs(route.fullPath);
};

// Close All
const closeAllTab = () => {
  tabStore.closeMultipleTab();
  router.push(HOME_URL);
};
</script>

<style scoped lang="scss">
@use "../index";
</style>
