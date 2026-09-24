<template>
  <el-drawer
    v-model="themeDrawerVisible"
    title="界面设置"
    size="min(var(--ui-size-drawer), 100vw)"
  >
    <!-- 布局样式 -->
    <el-divider
      class="my-lg"
      content-position="center"
    >
      <el-icon><i class="i-ep-notification" /></el-icon>
      布局样式
    </el-divider>
    <div
      class="grid grid-cols-2 gap-md my-lg"
      role="group"
      aria-label="布局方式"
    >
      <button
        v-for="item in layoutOptions"
        :key="item.value"
        type="button"
        class="ui-panel p-sm cursor-pointer text-md text-ui-text hover:border-ui-accent"
        :class="{ 'border-ui-accent': layout === item.value }"
        :aria-pressed="layout === item.value"
        @click="setLayout(item.value)"
      >
        <span
          class="grid grid-cols-3 grid-rows-3 h-16 gap-1 mb-xs"
          aria-hidden="true"
        >
          <span
            class="bg-ui-accent rounded-sm"
            :class="item.primary"
          />
          <span
            class="bg-ui-soft rounded-sm"
            :class="item.secondary"
          />
          <span
            class="bg-ui-canvas rounded-sm"
            :class="item.content"
          />
        </span>
        {{ item.label }}
      </button>
    </div>
    <div class="ui-between my-md text-md">
      <span>
        侧边栏反转色
        <el-tooltip
          effect="dark"
          content="侧边栏颜色变为深色模式"
          placement="top"
        >
          <el-icon><i class="i-ep-question-filled" /></el-icon>
        </el-tooltip>
      </span>
      <el-switch
        v-model="asideInverted"
        @change="setAsideTheme"
      />
    </div>
    <div class="ui-between my-md mb-xl text-md">
      <span>
        头部反转色
        <el-tooltip
          effect="dark"
          content="头部颜色变为深色模式"
          placement="top"
        >
          <el-icon><i class="i-ep-question-filled" /></el-icon>
        </el-tooltip>
      </span>
      <el-switch
        v-model="headerInverted"
        @change="setHeaderTheme"
      />
    </div>

    <!-- 全局主题 -->
    <el-divider
      class="my-lg"
      content-position="center"
    >
      <el-icon><i class="i-ep-cold-drink" /></el-icon>
      全局主题
    </el-divider>
    <div class="ui-between my-md text-md">
      <span>主题颜色</span>
      <el-color-picker
        v-model="primary"
        :predefine="colorList"
        @change="changePrimary"
      />
    </div>
    <div class="ui-between my-md text-md">
      <span>基础字号</span>
      <el-select
        v-model="fontSize"
        class="w-filter max-w-full"
        aria-label="基础字号"
      >
        <el-option
          v-for="size in fontSizeOptions"
          :key="size"
          :label="`${size}px${size === UI_CONFIG.font.defaultSize ? '（默认）' : ''}`"
          :value="size"
        />
      </el-select>
    </div>
    <div class="ui-between my-md text-md">
      <el-text
        type="info"
        size="small"
      >
        字号即时生效，刷新后保留。
      </el-text>
      <el-button
        text
        @click="fontSize = UI_CONFIG.font.defaultSize"
      >
        恢复默认
      </el-button>
    </div>
    <div class="ui-between my-md text-md">
      <span>暗黑模式</span>
      <SwitchDark />
    </div>
    <div class="ui-between my-md text-md">
      <span>灰色模式</span>
      <el-switch
        v-model="isGrey"
        @change="changeGreyOrWeak('grey', !!$event)"
      />
    </div>
    <div class="ui-between my-md mb-xl text-md">
      <span>色弱模式</span>
      <el-switch
        v-model="isWeak"
        @change="changeGreyOrWeak('weak', !!$event)"
      />
    </div>

    <!-- 界面设置 -->
    <el-divider
      class="my-lg"
      content-position="center"
    >
      <el-icon><i class="i-ep-setting" /></el-icon>
      界面设置
    </el-divider>
    <div class="ui-between my-md text-md">
      <span>菜单折叠</span>
      <el-switch v-model="isCollapse" />
    </div>
    <div class="ui-between my-md text-md">
      <span>菜单手风琴</span>
      <el-switch v-model="accordion" />
    </div>
    <div class="ui-between my-md text-md">
      <span>水印</span>
      <el-switch v-model="watermark" />
    </div>
    <div class="ui-between my-md text-md">
      <span>面包屑</span>
      <el-switch v-model="breadcrumb" />
    </div>
    <div class="ui-between my-md text-md">
      <span>面包屑图标</span>
      <el-switch v-model="breadcrumbIcon" />
    </div>
    <div class="ui-between my-md text-md">
      <span>标签栏</span>
      <el-switch v-model="tabs" />
    </div>
    <div class="ui-between my-md text-md">
      <span>标签栏图标</span>
      <el-switch v-model="tabsIcon" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { UI_CONFIG } from "@/config/ui";
import { storeToRefs } from "pinia";
import { onScopeDispose } from "vue";

import SwitchDark from "@/components/SwitchDark/index.vue";
import { DEFAULT_PRIMARY } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import type { TLayout } from "@/typings/store";
import { useGlobalStore } from "@/stores/modules/global";
import { useUiStore } from "@/stores/modules/ui";

const { changePrimary, changeGreyOrWeak, setAsideTheme, setHeaderTheme } = useTheme();

const globalStore = useGlobalStore();
const uiStore = useUiStore();
const { themeDrawerVisible } = storeToRefs(uiStore);
const {
  layout,
  primary,
  fontSize,
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
} = storeToRefs(globalStore);

const fontSizeOptions = Array.from(
  { length: UI_CONFIG.font.maxSize - UI_CONFIG.font.minSize + 1 },
  (_, index) => UI_CONFIG.font.minSize + index
);

// 预定义主题颜色
const colorList = [
  DEFAULT_PRIMARY,
  "#daa96e",
  "#0c819f",
  "#409eff",
  "#27ae60",
  "#ff5c93",
  "#e74c3c",
  "#fd726d",
  "#f39c12",
  "#9b59b6"
];

const layoutOptions: { value: TLayout; label: string; primary: string; secondary: string; content: string }[] = [
  {
    value: "vertical",
    label: "纵向",
    primary: "row-span-3",
    secondary: "col-span-2",
    content: "col-span-2 row-span-2"
  },
  { value: "classic", label: "经典", primary: "col-span-3", secondary: "row-span-2", content: "col-span-2 row-span-2" },
  { value: "transverse", label: "横向", primary: "col-span-3", secondary: "col-span-3", content: "col-span-3" },
  { value: "columns", label: "分栏", primary: "row-span-3", secondary: "row-span-3", content: "row-span-3" }
];

// 设置布局方式
const setLayout = (val: TLayout) => {
  globalStore.setGlobalState("layout", val);
  setAsideTheme();
};

onScopeDispose(() => {
  themeDrawerVisible.value = false;
});
</script>
