<template>
  <div class="tabs-box">
    <div class="tabs-menu">
      <el-tabs
        v-model="tabsMenuValue"
        type="card"
        @contextmenu.capture="openContextMenu"
        @tab-click="tabClick"
        @tab-remove="tabRemove"
      >
        <el-tab-pane
          v-for="item in tabsMenuList"
          :key="item.path"
          :label="item.title"
          :name="item.path"
          :closable="item.close"
        >
          <template #label>
            <span
              :data-tab-path="item.path"
              class="inline-flex items-center"
            >
              <el-icon
                v-if="item.icon && tabsIcon"
                class="tabs-icon"
              >
                <i :class="item.icon"></i>
              </el-icon>
              {{ item.title }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
      <MoreButton
        ref="moreButton"
        @visible-change="visible => visible && closeContextMenu()"
      />
      <el-dropdown
        ref="contextMenu"
        class="tabs-context-menu"
        trigger="contextmenu"
        virtual-triggering
        :virtual-ref="contextReference"
        :show-arrow="false"
        placement="bottom-start"
        :show-timeout="0"
        :hide-timeout="0"
      >
        <template #dropdown>
          <TabOperationMenu
            :tab="contextTab"
            context
          />
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPageFullPath, getPagePath } from "@/utils/pageRoute";
import type { DropdownInstance, TabPaneName, TabsPaneContext } from "element-plus";
import Sortable from "sortablejs";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/modules/auth";
import { useGlobalStore } from "@/stores/modules/global";
import { useTabsStore } from "@/stores/modules/tabs";

import type { ITabMenu } from "@/typings/store";
import TabOperationMenu from "./components/TabOperationMenu.vue";
import MoreButton from "./components/MoreButton.vue";

const contextMenu = ref<DropdownInstance>();
const moreButton = ref<InstanceType<typeof MoreButton>>();
const contextTab = shallowRef<ITabMenu>();
const contextReference = shallowRef<{ getBoundingClientRect: () => DOMRect; contextElement: HTMLElement }>();
const closeContextMenu = () => contextMenu.value?.handleClose();
async function openContextMenu(event: MouseEvent) {
  const element = event.target instanceof Element ? event.target.closest<HTMLElement>(".el-tabs__item") : null;
  const path = element?.querySelector<HTMLElement>("[data-tab-path]")?.dataset.tabPath;
  const tab = tabsMenuList.value.find(item => item.path === path);
  if (!element || !tab) return;
  event.preventDefault();
  event.stopPropagation();
  closeContextMenu();
  moreButton.value?.close();
  const rect = element.getBoundingClientRect();
  const x = event.clientX || rect.left;
  const y = event.clientY || rect.bottom;
  contextTab.value = tab;
  contextReference.value = { getBoundingClientRect: () => new DOMRect(x, y, 0, 0), contextElement: element };
  await nextTick();
  contextMenu.value?.handleOpen();
}

const route = useRoute();
const router = useRouter();
const tabStore = useTabsStore();
const authStore = useAuthStore();
const globalStore = useGlobalStore();

const tabsMenuValue = ref(getPagePath(route));
const tabsMenuList = computed(() => tabStore.tabsMenuList);
const tabsIcon = computed(() => globalStore.tabsIcon);

onMounted(() => {
  tabsDrop();
  initTabs();
});

// 监听路由的变化（防止浏览器后退/前进不变化 tabsMenuValue）
watch(
  () => route.fullPath,
  () => {
    closeContextMenu();
    if (route.meta.isFull) return;
    tabsMenuValue.value = getPagePath(route);
    const tabsParams = {
      icon: route.meta.icon as string,
      title: route.meta.title as string,
      path: getPagePath(route),
      fullPath: getPageFullPath(route),
      name: route.name as string,
      close: !route.meta.isAffix,
      isKeepAlive: route.meta.isKeepAlive as boolean
    };
    tabStore.addTabs(tabsParams);
  },
  { immediate: true }
);

// 初始化需要固定的 tabs
const initTabs = () => {
  authStore.flatMenuListGet.forEach(item => {
    if (item.meta.isAffix && !item.meta.isHide && !item.meta.isFull) {
      const tabsParams = {
        icon: item.meta.icon,
        title: item.meta.title,
        path: item.path,
        name: item.name,
        close: !item.meta.isAffix,
        isKeepAlive: item.meta.isKeepAlive
      };
      tabStore.addTabs(tabsParams);
    }
  });
};

watch(
  () => tabsMenuList.value.map(item => item.path),
  () => {
    if (contextTab.value && !tabsMenuList.value.some(item => item.path === contextTab.value?.path)) closeContextMenu();
  }
);

let sortable: Sortable | undefined;
onBeforeUnmount(() => sortable?.destroy());

// tabs 拖拽排序
const tabsDrop = () => {
  sortable = Sortable.create(document.querySelector(".el-tabs__nav") as HTMLElement, {
    draggable: ".el-tabs__item",
    animation: 300,
    onStart: closeContextMenu,
    onEnd({ newIndex, oldIndex }) {
      const tabsList = [...tabStore.tabsMenuList];
      const currRow = tabsList.splice(oldIndex as number, 1)[0];
      tabsList.splice(newIndex as number, 0, currRow);
      tabStore.setTabs(tabsList);
    }
  });
};

// Tab Click
const tabClick = async (tabItem: TabsPaneContext) => {
  const fullPath = tabItem.props.name as string;
  const target = tabsMenuList.value.find(item => item.path === fullPath);
  await router.push(target?.fullPath ?? fullPath);
  tabsMenuValue.value = getPagePath(route);
};

// Remove Tab
const tabRemove = (fullPath: TabPaneName) => {
  tabStore.removeTabs(fullPath as string);
};
</script>

<style scoped lang="scss">
@use "./index";
</style>
