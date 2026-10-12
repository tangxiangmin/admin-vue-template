import { defineStore } from "pinia";
import { ref } from "vue";

import router from "@/routers";
import { HOME_URL } from "@/config";
import { getPagePath } from "@/utils/pageRoute";
import { usePageLeaveStore } from "./pageLeave";
import type { ITabMenu } from "@/typings/store";
import { useKeepAliveStore } from "./keepAlive";

export const useTabsStore = defineStore(
  "admin-template-tabs",
  () => {
    const keepAliveStore = useKeepAliveStore();

    const tabsMenuList = ref<ITabMenu[]>([]);
    const pageLeave = usePageLeaveStore();

    // Add Tabs
    const addTabs = async (tabItem: ITabMenu) => {
      const existing = tabsMenuList.value.find(item => item.path === tabItem.path);
      if (!existing) {
        tabsMenuList.value.push(tabItem);
      } else if (tabItem.fullPath !== undefined) {
        existing.fullPath = tabItem.fullPath;
      }
      // add keepalive
      if (!keepAliveStore.keepAliveName.includes(tabItem.path) && tabItem.isKeepAlive) {
        keepAliveStore.addKeepAliveName(tabItem.path);
      }
    };

    async function closeTabs(paths: string[]) {
      const targets = tabsMenuList.value.filter(item => item.close && paths.includes(item.path));
      if (!targets.length) return true;
      const targetPaths = targets.map(item => item.path);
      const currentPath = getPagePath(router.currentRoute.value);
      return pageLeave.perform(targetPaths, async () => {
        if (targetPaths.includes(currentPath)) {
          const remaining = tabsMenuList.value.filter(item => !targetPaths.includes(item.path));
          const currentIndex = tabsMenuList.value.findIndex(item => item.path === currentPath);
          const next = remaining.find(item => tabsMenuList.value.indexOf(item) > currentIndex) ?? remaining.at(-1);
          const failure = await router.push(next?.fullPath ?? next?.path ?? HOME_URL);
          if (failure || getPagePath(router.currentRoute.value) === currentPath) return false;
        }
        tabsMenuList.value = tabsMenuList.value.filter(item => !targetPaths.includes(item.path));
        keepAliveStore.setKeepAliveName(tabsMenuList.value.filter(item => item.isKeepAlive).map(item => item.path));
        return true;
      });
    }
    const removeTabs = (tabPath: string) => closeTabs([tabPath]);
    const closeTabsOnSide = (path: string, type: "left" | "right") => {
      const index = tabsMenuList.value.findIndex(item => item.path === path);
      if (index < 0) return Promise.resolve(false);
      const targets = type === "left" ? tabsMenuList.value.slice(0, index) : tabsMenuList.value.slice(index + 1);
      return closeTabs(targets.map(item => item.path));
    };
    const closeMultipleTab = (keepPath?: string) =>
      closeTabs(tabsMenuList.value.filter(item => item.path !== keepPath).map(item => item.path));

    // Set Tabs
    const setTabs = async (newTabsMenuList: ITabMenu[]) => {
      tabsMenuList.value = newTabsMenuList;
    };

    return {
      tabsMenuList,
      addTabs,
      removeTabs,
      closeTabsOnSide,
      closeMultipleTab,
      setTabs
    };
  },
  {
    persist: {
      key: "admin-template-tabs",
      storage: localStorage
    }
  }
);
