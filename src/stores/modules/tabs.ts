import { defineStore } from "pinia";
import { ref } from "vue";

import router from "@/routers";
import type { ITabMenu } from "@/typings/store";
import { useKeepAliveStore } from "./keepAlive";

export const useTabsStore = defineStore(
  "admin-template-tabs",
  () => {
    const keepAliveStore = useKeepAliveStore();

    const tabsMenuList = ref<ITabMenu[]>([]);

    // Add Tabs
    const addTabs = async (tabItem: ITabMenu) => {
      if (tabsMenuList.value.every(item => item.path !== tabItem.path)) {
        tabsMenuList.value.push(tabItem);
      }
      // add keepalive
      if (!keepAliveStore.keepAliveName.includes(tabItem.name) && tabItem.isKeepAlive) {
        keepAliveStore.addKeepAliveName(tabItem.path);
      }
    };

    // Remove Tabs
    const removeTabs = async (tabPath: string, isCurrent: boolean = true) => {
      if (isCurrent) {
        tabsMenuList.value.forEach((item, index) => {
          if (item.path !== tabPath) return;
          const nextTab = tabsMenuList.value[index + 1] || tabsMenuList.value[index - 1];
          if (!nextTab) return;
          router.push(nextTab.path);
        });
      }
      // remove keepalive
      const tabItem = tabsMenuList.value.find(item => item.path === tabPath);
      if (tabItem?.isKeepAlive) {
        keepAliveStore.removeKeepAliveName(tabItem.path);
      }
      // set tabs
      tabsMenuList.value = tabsMenuList.value.filter(item => item.path !== tabPath);
    };

    // Close Tabs On Side
    const closeTabsOnSide = async (path: string, type: "left" | "right") => {
      const currentIndex = tabsMenuList.value.findIndex(item => item.path === path);
      if (currentIndex !== -1) {
        const range = type === "left" ? [0, currentIndex] : [currentIndex + 1, tabsMenuList.value.length];
        tabsMenuList.value = tabsMenuList.value.filter((item, index) => {
          return index < range[0] || index >= range[1] || !item.close;
        });
      }
      // set keepalive
      const KeepAliveList = tabsMenuList.value.filter(item => item.isKeepAlive);
      keepAliveStore.setKeepAliveName(KeepAliveList.map(item => item.path));
    };

    // Close MultipleTab
    const closeMultipleTab = async (tabsMenuValue?: string) => {
      tabsMenuList.value = tabsMenuList.value.filter(item => {
        return item.path === tabsMenuValue || !item.close;
      });
      // set keepalive
      const KeepAliveList = tabsMenuList.value.filter(item => item.isKeepAlive);
      keepAliveStore.setKeepAliveName(KeepAliveList.map(item => item.path));
    };

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
