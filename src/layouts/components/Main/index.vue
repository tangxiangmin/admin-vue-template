<template>
  <Maximize v-show="maximize" />
  <Tabs v-show="tabs" />
  <el-main>
    <router-view v-slot="{ Component, route }">
      <transition
        appear
        name="fade-transform"
        mode="out-in"
      >
        <keep-alive :include="keepAliveName">
          <component
            :is="createComponentWrapper(Component, route)"
            v-if="isRouterShow"
            :key="getPagePath(route)"
          />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script setup lang="ts">
import { getPagePath } from "@/utils/pageRoute";
import { usePageLeaveStore } from "@/stores/modules/pageLeave";
import { useDebounceFn, useEventListener } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { h, onBeforeUnmount, provide, ref, watch } from "vue";

import Tabs from "@/layouts/components/Tabs/index.vue";
import { useGlobalStore } from "@/stores/modules/global";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";

import Maximize from "./components/Maximize.vue";

const pageLeave = usePageLeaveStore();
useEventListener(window, "beforeunload", event => {
  if (pageLeave.isDirty()) {
    event.preventDefault();
    event.returnValue = "";
  }
});
const globalStore = useGlobalStore();
const { maximize, isCollapse, layout, tabs } = storeToRefs(globalStore);

const keepAliveStore = useKeepAliveStore();
const { keepAliveName } = storeToRefs(keepAliveStore);

// 注入刷新页面方法
const isRouterShow = ref(true);
const refreshCurrentPage = (val: boolean) => (isRouterShow.value = val);
provide("refresh", refreshCurrentPage);

// 解决详情页 keep-alive 问题
const wrapperMap = new Map();
function createComponentWrapper(component, route) {
  if (!component) return;
  const wrapperName = getPagePath(route);
  let wrapper = wrapperMap.get(wrapperName);
  if (!wrapper) {
    wrapper = { name: wrapperName, render: () => h(component) };
    wrapperMap.set(wrapperName, wrapper);
  }
  return h(wrapper);
}

// 监听当前页面是否最大化，动态添加 class
watch(
  () => maximize.value,
  () => {
    const app = document.getElementById("app") as HTMLElement;
    if (maximize.value) app.classList.add("main-maximize");
    else app.classList.remove("main-maximize");
  },
  { immediate: true }
);

// 监听布局变化，在 body 上添加相对应的 layout class
watch(
  () => layout.value,
  () => {
    const body = document.body as HTMLElement;
    body.setAttribute("class", layout.value);
  },
  { immediate: true }
);

// 监听窗口大小变化，折叠侧边栏
const screenWidth = ref(0);
const listeningWindow = useDebounceFn(() => {
  screenWidth.value = document.body.clientWidth;
  if (!isCollapse.value && screenWidth.value < 1200) globalStore.setGlobalState("isCollapse", true);
  if (isCollapse.value && screenWidth.value > 1200) globalStore.setGlobalState("isCollapse", false);
}, 100);
window.addEventListener("resize", listeningWindow, false);
onBeforeUnmount(() => {
  window.removeEventListener("resize", listeningWindow);
});
</script>

<style scoped lang="scss">
@use "./index";
</style>
