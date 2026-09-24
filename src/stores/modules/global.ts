import { defineStore } from "pinia";
import { ref, type UnwrapRef } from "vue";

import { UI_CONFIG } from "@/config/ui";
import { DEFAULT_PRIMARY } from "@/config";
import type { TAssemblySize, TLayout } from "@/typings/store";

export const useGlobalStore = defineStore(
  "admin-template-global",
  () => {
    // 布局模式 (纵向：vertical | 经典：classic | 横向：transverse | 分栏：columns)
    const layout = ref<TLayout>("vertical");
    // element 组件大小
    const assemblySize = ref<TAssemblySize>(UI_CONFIG.provider.size);
    // 当前页面是否全屏
    const maximize = ref<boolean>(false);
    // 主题颜色
    const primary = ref<string>(DEFAULT_PRIMARY);
    // 深色模式
    const isDark = ref<boolean>(false);
    // 基础字号，随主题偏好持久化
    const fontSize = ref<number>(UI_CONFIG.font.defaultSize);
    // 灰色模式
    const isGrey = ref<boolean>(false);
    // 色弱模式
    const isWeak = ref<boolean>(false);
    // 侧边栏反转
    const asideInverted = ref<boolean>(false);
    // 头部反转
    const headerInverted = ref<boolean>(false);
    // 折叠菜单
    const isCollapse = ref<boolean>(false);
    // 菜单手风琴
    const accordion = ref<boolean>(true);
    // 页面水印
    const watermark = ref<boolean>(false);
    // 面包屑导航
    const breadcrumb = ref<boolean>(true);
    // 面包屑导航图标
    const breadcrumbIcon = ref<boolean>(true);
    // 标签页
    const tabs = ref<boolean>(true);
    // 标签页图标
    const tabsIcon = ref<boolean>(true);

    const stateMap = {
      layout,
      assemblySize,
      maximize,
      primary,
      fontSize,
      isDark,
      isGrey,
      isWeak,
      asideInverted,
      headerInverted,
      isCollapse,
      accordion,
      watermark,
      breadcrumb,
      breadcrumbIcon,
      tabs,
      tabsIcon
    } as const;

    // Set GlobalState
    const setGlobalState = <K extends keyof typeof stateMap>(key: K, value: UnwrapRef<(typeof stateMap)[K]>) => {
      const stateRef = stateMap[key];
      if (stateRef) {
        stateRef.value = value;
      }
    };

    return {
      ...stateMap,
      setGlobalState
    };
  },
  {
    persist: {
      key: "admin-template-global",
      storage: localStorage
    }
  }
);
